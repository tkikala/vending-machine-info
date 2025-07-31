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
    if (req.method === 'GET') {
      console.log('Machines endpoint called - testing database connection...');
      
      // Test database connection first
      try {
        await prisma.$connect();
        console.log('Database connected successfully');
        
        // Try a simple query to test the connection
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
        
        // Get all machines (public view)
        const machines = await prisma.vendingMachine.findMany({
          where: { isActive: true },
          include: {
            products: {
              where: { isAvailable: true }
            },
            paymentMethods: true,
            photos: true,
            reviews: {
              where: { isApproved: true }
            },
            owner: {
              select: { id: true, name: true }
            }
          }
        });

        console.log('Found machines:', machines.length);
        return res.status(200).json(machines);
        
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
    console.error('API Error:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('P2021')) {
      return res.status(500).json({ 
        error: 'Database not initialized. Please run database migrations.',
        details: error.message 
      });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
} 