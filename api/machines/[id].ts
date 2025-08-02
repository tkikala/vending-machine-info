import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Machine ID is required' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log('Fetching machine:', id);
      
      try {
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
                price: true,
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
                available: true,
                paymentMethodType: {
                  select: {
                    id: true,
                    type: true,
                    name: true,
                    icon: true
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
              where: { isApproved: true },
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
          }
        });

        if (!machine) {
          return res.status(404).json({ error: 'Machine not found' });
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

    if (req.method === 'PUT') {
      console.log('Updating machine:', id);
      
      try {
        const { name, location, description, logo, coordinates, isActive, products, paymentMethods } = req.body;
        
        if (!name || !name.trim()) {
          return res.status(400).json({ error: 'Machine name is required' });
        }

        if (!location || !location.trim()) {
          return res.status(400).json({ error: 'Machine location is required' });
        }

        const machine = await prisma.$transaction(async (tx) => {
          const updatedMachine = await tx.vendingMachine.update({
            where: { id },
            data: {
              name: name || undefined,
              location: location || undefined,
              description: description || undefined,
              logo: logo !== undefined ? logo : undefined,
              coordinates: coordinates !== undefined ? coordinates : undefined,
              isActive: isActive !== undefined ? isActive : undefined
            }
          });

          // Update machine-product relationships
          if (products && Array.isArray(products)) {
            await tx.machineProduct.deleteMany({ where: { vendingMachineId: id } });
            for (const productData of products) {
              if (productData.productId) {
                await tx.machineProduct.create({
                  data: {
                    vendingMachineId: id,
                    productId: productData.productId,
                    price: productData.price || null,
                    isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true
                  }
                });
              }
            }
          }

          // Update payment methods
          if (paymentMethods && Array.isArray(paymentMethods)) {
            await tx.machinePaymentMethod.deleteMany({ where: { vendingMachineId: id } });
            for (const paymentType of paymentMethods) {
              const pmType = await tx.paymentMethodType.findUnique({
                where: { type: paymentType }
              });
              
              if (pmType) {
                await tx.machinePaymentMethod.create({
                  data: {
                    vendingMachineId: id,
                    paymentMethodTypeId: pmType.id,
                    available: true
                  }
                });
              }
            }
          }

          return updatedMachine;
        });

        console.log(`✅ Updated machine: ${machine.name}`);
        return res.status(200).json(machine);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to update machine',
          details: dbError.message
        });
      }
    }

    if (req.method === 'DELETE') {
      console.log('Deleting machine:', id);
      try {
        // Actually delete the machine and all related data
        await prisma.$transaction(async (tx) => {
          await tx.review.deleteMany({ where: { vendingMachineId: id } });
          await tx.photo.deleteMany({ where: { vendingMachineId: id } });
          await tx.machinePaymentMethod.deleteMany({ where: { vendingMachineId: id } });
          await tx.machineProduct.deleteMany({ where: { vendingMachineId: id } });
          await tx.vendingMachine.delete({ where: { id } });
        });
        console.log(`✅ Deleted machine: ${id}`);
        return res.status(200).json({ message: 'Machine deleted successfully' });
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to delete machine',
          details: dbError.message
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Machine Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 