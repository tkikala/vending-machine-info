import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      console.log('Testing database connection...');

      // Test database connection
      try {
        await prisma.$connect();
        console.log('Database connection successful');
        
        return res.status(200).json({ 
          message: 'Database connection successful!',
          status: 'connected',
          nextSteps: [
            '1. Go to your Vercel database dashboard',
            '2. Use the SQL editor to create tables',
            '3. Or use Prisma Studio to manage the database',
            '4. Admin credentials: t.kikala@gmail.com / gCJ4Dxr55dGYmhM'
          ]
        });
        
      } catch (connectionError: any) {
        console.error('Database connection failed:', connectionError);
        return res.status(500).json({ 
          error: 'Database connection failed',
          details: connectionError.message,
          suggestion: 'Check your DATABASE_URL environment variable'
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Setup Error:', error);
    return res.status(500).json({ 
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
} 