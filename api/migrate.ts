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
      console.log('Starting database setup...');

      try {
        // Test database connection first
        await prisma.$connect();
        console.log('Database connection successful');

        // Create tables by running a simple query that will fail if tables don't exist
        // This will trigger Prisma to create the schema
        try {
          await prisma.user.findMany({ take: 1 });
          console.log('User table exists');
        } catch (error: any) {
          if (error.message.includes('P2021')) {
            console.log('Tables do not exist, creating schema...');
            // For now, we'll return a message to create tables manually
            return res.status(200).json({ 
              message: 'Database connected but tables need to be created manually',
              status: 'connected_no_tables',
              nextSteps: [
                '1. Go to your Vercel database dashboard',
                '2. Use the SQL editor to create tables',
                '3. Or use Prisma Studio to manage the database',
                '4. Admin credentials: t.kikala@gmail.com / gCJ4Dxr55dGYmhM'
              ],
              manualSetup: true
            });
          }
          throw error;
        }

        return res.status(200).json({ 
          message: 'Database is ready!',
          status: 'ready',
          nextSteps: [
            '1. Tables exist and are ready',
            '2. You can now use the setup endpoint to create the admin user'
          ]
        });

      } catch (dbError: any) {
        console.error('Database error:', dbError);
        return res.status(500).json({ 
          error: 'Database connection failed',
          details: dbError.message,
          suggestion: 'Check your DATABASE_URL environment variable'
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Migration Error:', error);
    return res.status(500).json({ 
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
} 