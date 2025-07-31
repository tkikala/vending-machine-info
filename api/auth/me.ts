import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
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
    console.error('❌ Auth check Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      authenticated: false,
      user: null
    });
  }
} 