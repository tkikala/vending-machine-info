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
        
        // Get all machines with related data
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
                name: true,
                description: true,
                price: true,
                slotCode: true,
                isAvailable: true
              }
            },
            paymentMethods: {
              select: {
                id: true,
                type: true,
                available: true
              }
            },
            reviews: {
              where: { isApproved: true },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true
              }
            }
          }
        });

        console.log(`✅ Found machines: ${machines.length}`);
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
      console.log('Creating new vending machine...');
      
      try {
        const { name, location, description, logo, coordinates, products, paymentMethods } = req.body;
        
        if (!name || !location) {
          return res.status(400).json({ error: 'Name and location are required' });
        }

        // For now, use the admin user as owner
        const adminUser = await prisma.user.findUnique({
          where: { email: 't.kikala@gmail.com' }
        });

        if (!adminUser) {
          return res.status(500).json({ error: 'Admin user not found' });
        }

        // Create machine with related data in a transaction
        const result = await prisma.$transaction(async (tx) => {
          const machine = await tx.vendingMachine.create({
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

          // Create products if provided
          if (products && Array.isArray(products)) {
            console.log('Creating products:', products.length);
            for (const product of products) {
              if (product.name && product.name.trim()) {
                await tx.product.create({
                  data: {
                    name: product.name.trim(),
                    description: product.description || '',
                    photo: product.photo || '',
                    price: product.price ? parseFloat(product.price) : null,
                    slotCode: product.slotCode || 'A1',
                    isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
                    vendingMachineId: machine.id
                  }
                });
              }
            }
          }

          // Create payment methods if provided
          if (paymentMethods && Array.isArray(paymentMethods)) {
            console.log('Creating payment methods:', paymentMethods.length);
            for (const pm of paymentMethods) {
              await tx.paymentMethod.create({
                data: {
                  type: pm.type,
                  available: pm.available,
                  vendingMachineId: machine.id
                }
              });
            }
          }

          return machine;
        });

        console.log(`✅ Created machine: ${result.name}`);
        return res.status(201).json(result);
        
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