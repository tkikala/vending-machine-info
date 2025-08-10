import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import crypto from 'crypto';
import Stripe from 'stripe';

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
      console.log('Logout attempt');
      
      // Get session token from cookie
      const sessionToken = req.cookies?.session;
      
      if (sessionToken) {
        try {
          // Delete the session from database
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
        if (!user) {
          user = await prisma.user.create({ data: { email, name, role: 'OWNER', isActive: true } });
        }

        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.session.create({ data: { userId: user.id, token: sessionToken, expiresAt } });
        res.setHeader('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}; Path=/`);
        return res.status(302).setHeader('Location', '/my-machines').end();
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

        console.log('✅ Authenticated user:', session.user.name, session.user.role);

        return res.status(200).json({
          message: 'Authenticated',
          authenticated: true,
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role
          }
        });

      } catch (dbError: any) {
        console.error('❌ Database error during auth check:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          details: dbError.message,
          authenticated: false,
          user: null
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Auth Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 