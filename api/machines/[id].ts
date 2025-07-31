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
      const { id } = req.query;
      console.log('Individual machine endpoint called - fetching machine:', id);
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid machine ID' });
      }

      try {
        // Get the specific machine with all related data
        const machine = await prisma.vendingMachine.findUnique({
          where: { 
            id: id,
            isActive: true 
          },
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            logo: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: { id: true, name: true }
            },
            products: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                slotCode: true,
                isAvailable: true,
                photo: true
              }
            },
            paymentMethods: {
              select: {
                id: true,
                type: true,
                available: true
              }
            },
            photos: {
              select: {
                id: true,
                url: true,
                caption: true,
                fileType: true,
                originalName: true,
                fileSize: true
              }
            },
            reviews: {
              where: { isApproved: true },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                user: {
                  select: { name: true }
                }
              }
            }
          }
        });

        if (!machine) {
          console.log('❌ Machine not found:', id);
          return res.status(404).json({ error: 'Vending machine not found' });
        }

        console.log(`✅ Found machine: ${machine.name}`);
        return res.status(200).json(machine);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          details: dbError.message
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