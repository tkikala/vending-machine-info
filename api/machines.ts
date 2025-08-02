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
      console.log('🔍 Fetching all machines...');
      
      try {
        const machines = await prisma.vendingMachine.findMany({
          where: { isActive: true },
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
              select: { id: true, name: true }
            },
            products: {
              select: {
                id: true,
                isAvailable: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    photo: true,
                    price: true,
                    isAvailable: true
                  }
                }
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
              select: {
                id: true,
                rating: true,
                comment: true,
                isApproved: true,
                user: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        });

        console.log(`✅ Found ${machines.length} machines`);
        return res.status(200).json(machines);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          details: dbError.message
        });
      }
    }

    if (req.method === 'POST') {
      console.log('Creating new machine...');
      
      try {
        const { name, location, description, logo, coordinates, products, paymentMethods } = req.body;
        
        if (!name || !name.trim()) {
          return res.status(400).json({ error: 'Machine name is required' });
        }

        if (!location || !location.trim()) {
          return res.status(400).json({ error: 'Machine location is required' });
        }

        // Get admin user (assuming first admin user)
        const adminUser = await prisma.user.findFirst({
          where: { role: 'ADMIN', isActive: true }
        });

        if (!adminUser) {
          return res.status(500).json({ error: 'No admin user found' });
        }

        // Create machine with related data in a transaction
        const machine = await prisma.$transaction(async (tx) => {
          // Create the machine
          const newMachine = await tx.vendingMachine.create({
            data: {
              name,
              location,
              description: description || '',
              logo: logo || null,
              coordinates: coordinates || null,
              ownerId: adminUser.id,
              isActive: true
            }
          });

          // Create machine-product relationships
          if (products && Array.isArray(products)) {
            for (const productData of products) {
              if (productData.productId) {
                await tx.machineProduct.create({
                  data: {
                    vendingMachineId: newMachine.id,
                    productId: productData.productId,
                    isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true
                  }
                });
              }
            }
          }

          // Create payment methods
          if (paymentMethods && Array.isArray(paymentMethods)) {
            for (const paymentType of paymentMethods) {
              await tx.paymentMethod.create({
                data: {
                  type: paymentType,
                  available: true,
                  vendingMachineId: newMachine.id
                }
              });
            }
          }

          return newMachine;
        });

        console.log(`✅ Created machine: ${machine.id}`);
        return res.status(201).json(machine);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to create machine',
          details: dbError.message
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Machines Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 