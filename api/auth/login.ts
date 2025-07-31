import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
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
    if (req.method === 'POST') {
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Login Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 