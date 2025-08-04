import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import crypto from 'crypto';

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