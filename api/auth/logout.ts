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
    if (req.method === 'POST') {
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Logout Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 