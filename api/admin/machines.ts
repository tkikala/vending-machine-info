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
      console.log('Fetching all machines for admin...');
      
      try {
        const machines = await prisma.vendingMachine.findMany({
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            logo: true,
            coordinates: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: { id: true, name: true, email: true }
            },
            products: {
              select: {
                id: true,
                price: true,
                isAvailable: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    isAvailable: true
                  }
                }
              }
            },
            paymentMethods: {
              select: {
                id: true,
                available: true,
                paymentMethodType: {
                  select: {
                    id: true,
                    type: true,
                    name: true
                  }
                }
              }
            },
            photos: {
              select: {
                id: true,
                url: true,
                caption: true,
                fileType: true,
                originalName: true,
                fileSize: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' }
            },
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                isApproved: true,
                user: {
                  select: { id: true, name: true }
                },
                createdAt: true,
                updatedAt: true
              },
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        console.log(`✅ Found ${machines.length} machines for admin`);
        return res.status(200).json(machines);
        
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
    console.error('❌ Admin Machines Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 