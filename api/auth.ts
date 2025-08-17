import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import crypto from 'crypto';
import Stripe from 'stripe';
import { sendEmail } from './email';

// Simple in-memory rate limiting (in production, use Redis)
const signupAttempts = new Map<string, { count: number; lastAttempt: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    // Handle signup
    if (action === 'signup' && req.method === 'POST') {
      const { email, password, name, captchaToken } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Rate limiting: max 5 signup attempts per IP per hour
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      const hourAgo = now - 60 * 60 * 1000;
      
      if (signupAttempts.has(clientIP as string)) {
        const attempts = signupAttempts.get(clientIP as string)!;
        if (attempts.lastAttempt > hourAgo && attempts.count >= 5) {
          return res.status(429).json({ error: 'Too many signup attempts. Please try again later.' });
        }
        if (attempts.lastAttempt <= hourAgo) {
          attempts.count = 0;
        }
        attempts.count++;
        attempts.lastAttempt = now;
      } else {
        signupAttempts.set(clientIP as string, { count: 1, lastAttempt: now });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      // Password strength validation
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      // Optional reCAPTCHA Enterprise verification (if configured)
      if (process.env.RECAPTCHA_SECRET_KEY && captchaToken) {
        try {
          const captchaRes = await fetch('https://recaptchaenterprise.googleapis.com/v1/projects/automatcheck/assessments?key=' + (process.env.GOOGLE_CLOUD_API_KEY || ''), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: {
                token: captchaToken,
                expectedAction: 'SIGNUP',
                siteKey: '6LdyX6grAAAAAJ_fSEF9e1TQJMP8I6udIl0znNeC'
              }
            })
          });
          const captchaData = await captchaRes.json();
          if (!captchaData.riskAnalysis?.score || captchaData.riskAnalysis.score < 0.5) {
            console.warn('reCAPTCHA Enterprise score too low:', captchaData.riskAnalysis?.score);
            // Continue without blocking - just log the low score
          }
        } catch (err) {
          console.warn('reCAPTCHA Enterprise verification error:', err);
          // Continue without CAPTCHA if verification fails
        }
      }

      try {
        const normalizedEmail = String(email).toLowerCase();
        const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (exists) {
          return res.status(409).json({ error: 'Email already in use' });
        }

        const hash = await bcrypt.hash(String(password), 10);
        const user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            password: hash,
            name: String(name || normalizedEmail.split('@')[0]),
            role: 'OWNER',
            isActive: true,
          }
        });

        // Ensure Stripe customer for billing
        try {
          if (process.env.STRIPE_SECRET_KEY) {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            const customer = await stripe.customers.create({ email: user.email, name: user.name });
            await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
          }
        } catch (err) {
          console.warn('⚠️ Stripe customer create on signup failed:', err);
        }

        // Send welcome email
        try {
          await sendEmail(
            user.email,
            'Welcome to Vending Community!',
            `<h2>Welcome to Vending Community!</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for joining Vending Community! Your account has been created successfully.</p>
            <p>You can now:</p>
            <ul>
              <li>Add your vending machines</li>
              <li>Track analytics and customer behavior</li>
              <li>Manage customer reviews</li>
              <li>Generate QR codes for your machines</li>
            </ul>
            <p>Start with our free tier and upgrade when you need more features!</p>
            <p>Best regards,<br>The Vending Community Team</p>`
          );
        } catch (err) {
          console.warn('⚠️ Welcome email failed:', err);
        }

        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.session.create({ data: { userId: user.id, token: sessionToken, expiresAt } });
        res.setHeader('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}; Path=/`);

        return res.status(201).json({
          message: 'Signup successful',
          user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
      } catch (dbError: any) {
        console.error('❌ Database error during signup:', dbError);
        return res.status(500).json({ error: 'Database connection failed', details: dbError.message });
      }
    }

    // Handle login
    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body;
      
      console.log('Login attempt for:', email);

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (!user) {
          console.log('❌ User not found:', email);
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.isActive) {
          console.log('❌ User account inactive:', email);
          return res.status(401).json({ error: 'Account is deactivated' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password || '');
        if (!isValidPassword) {
          console.log('❌ Invalid password for:', email);
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Ensure Stripe customer exists for this user (for operator billing)
        try {
          if (!user.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            const customer = await stripe.customers.create({
              email: user.email,
              name: user.name,
            });
            await prisma.user.update({
              where: { id: user.id },
              data: { stripeCustomerId: customer.id },
            });
          }
        } catch (err) {
          console.warn('⚠️ Failed to ensure Stripe customer:', err);
        }

        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create session
        await prisma.session.create({
          data: {
            userId: user.id,
            token: sessionToken,
            expiresAt: expiresAt
          }
        });

        // Set session cookie
        res.setHeader('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}; Path=/`);

        console.log('✅ Login successful for:', user.name, user.role);

        return res.status(200).json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        });

      } catch (dbError: any) {
        console.error('❌ Database error during login:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          details: dbError.message
        });
      }
    }

    // Handle logout
    if (action === 'logout' && req.method === 'POST') {
      const sessionToken = req.cookies?.session;
      
      if (sessionToken) {
        try {
          await prisma.session.deleteMany({
            where: { token: sessionToken }
          });
          console.log('✅ Session deleted for logout');
        } catch (dbError: any) {
          console.error('❌ Database error during logout:', dbError);
          // Continue with logout even if session deletion fails
        }
      }

      // Clear the session cookie
      res.setHeader('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');

      console.log('✅ Logout successful');

      return res.status(200).json({
        message: 'Logout successful'
      });
    }

    // Handle Google OAuth start
    if (action === 'google' && req.method === 'GET') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = `${process.env.APP_URL || ''}/api/auth?action=google-callback`;
      const scope = encodeURIComponent('openid email profile');
      const state = crypto.randomBytes(16).toString('hex');
      const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&prompt=consent`;
      return res.status(200).json({ url });
    }

    // Handle Google OAuth callback
    if (action === 'google-callback' && req.method === 'GET') {
      try {
        const code = String(req.query.code || '');
        const redirectUri = `${process.env.APP_URL || ''}/api/auth?action=google-callback`;
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: String(process.env.GOOGLE_CLIENT_ID || ''),
            client_secret: String(process.env.GOOGLE_CLIENT_SECRET || ''),
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          }) as any
        });
        const tokenJson = await tokenRes.json();
        const idToken = tokenJson.id_token as string;
        if (!idToken) return res.status(400).json({ error: 'Missing id_token' });
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        const email = String(payload.email || '').toLowerCase();
        const name = String(payload.name || email.split('@')[0]);
        if (!email) return res.status(400).json({ error: 'No email from Google' });

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });
        let isNewUser = false;
        if (!user) {
          user = await prisma.user.create({ data: { email, name, role: 'OWNER', isActive: true } });
          isNewUser = true;
          
          // Send welcome email for new Google users
          try {
            await sendEmail(
              user.email,
              'Welcome to Vending Community!',
              `<h2>Welcome to Vending Community!</h2>
              <p>Hi ${user.name},</p>
              <p>Thank you for joining Vending Community with Google! Your account has been created successfully.</p>
              <p>You can now:</p>
              <ul>
                <li>Add your vending machines</li>
                <li>Track analytics and customer behavior</li>
                <li>Manage customer reviews</li>
                <li>Generate QR codes for your machines</li>
              </ul>
              <p>Start with our free tier and upgrade when you need more features!</p>
              <p>Best regards,<br>The Vending Community Team</p>`
            );
          } catch (err) {
            console.warn('⚠️ Welcome email failed for Google user:', err);
          }
        }

        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.session.create({ data: { userId: user.id, token: sessionToken, expiresAt } });
        res.setHeader('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}; Path=/`);
        
        // Redirect based on user role
        const redirectPath = user.role === 'ADMIN' ? '/admin' : '/my-machines';
        return res.status(302).setHeader('Location', redirectPath).end();
      } catch (e: any) {
        console.error('Google OAuth error:', e);
        return res.status(500).json({ error: 'Google auth failed' });
      }
    }

    // Handle me (get current user)
    if (action === 'me' && req.method === 'GET') {
      console.log('Checking current user session');
      
      // Get session token from cookie
      const sessionToken = req.cookies?.session;
      
      if (!sessionToken) {
        console.log('❌ No session token found');
        return res.status(401).json({
          message: 'No active session',
          authenticated: false,
          user: null
        });
      }

      try {
        // Find the session
        const session = await prisma.session.findUnique({
          where: { token: sessionToken },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true
              }
            }
          }
        });

        if (!session) {
          console.log('❌ Session not found');
          return res.status(401).json({
            message: 'Invalid session',
            authenticated: false,
            user: null
          });
        }

        if (session.expiresAt < new Date()) {
          console.log('❌ Session expired');
          // Delete expired session
          await prisma.session.delete({
            where: { id: session.id }
          });
          return res.status(401).json({
            message: 'Session expired',
            authenticated: false,
            user: null
          });
        }

        if (!session.user.isActive) {
          console.log('❌ User account inactive');
          return res.status(401).json({
            message: 'Account deactivated',
            authenticated: false,
            user: null
          });
        }

        console.log('✅ Session valid for:', session.user.name, session.user.role);

        return res.status(200).json({
          message: 'Session valid',
          authenticated: true,
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role
          }
        });

      } catch (dbError: any) {
        console.error('❌ Database error during session check:', dbError);
        return res.status(500).json({
          message: 'Database connection failed',
          authenticated: false,
          user: null,
          details: dbError.message
        });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error: any) {
    console.error('❌ Auth Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
} 