import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

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
      console.log('Machines endpoint called - fetching machines...');
      
      try {
        // Simple test query
        const userCount = await prisma.user.count();
        console.log(`✅ User count: ${userCount}`);
        
        // Get all machines (public view) - only basic fields to avoid column issues
        const machines = await prisma.vendingMachine.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: { id: true, name: true }
            }
          }
        });

        console.log(`✅ Found machines: ${machines.length}`);
        return res.status(200).json(machines);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({ 
          error: 'Database connection failed',
          details: dbError.message,
          suggestion: 'Check your DATABASE_URL environment variable'
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 