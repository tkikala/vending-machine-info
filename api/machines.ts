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
    const { id, admin } = req.query;

    // Handle individual machine operations
    if (id && typeof id === 'string') {
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
            console.log('❌ Machine not found:', id);
            return res.status(404).json({ error: 'Machine not found' });
          }

          console.log('✅ Found machine:', machine.name);
          return res.status(200).json(machine);
          
        } catch (dbError: any) {
          console.error('❌ Database error:', dbError);
          return res.status(500).json({
            error: 'Database connection failed',
            details: dbError.message
          });
        }
      }

      // Handle PUT (update machine)
      if (req.method === 'PUT') {
        console.log('Updating machine:', id);
        
        try {
          const updateData = req.body;
          
          // Handle products update - delete existing and create new ones
          if (updateData.products && Array.isArray(updateData.products)) {
            await prisma.machineProduct.deleteMany({
              where: { vendingMachineId: id }
            });
            
            if (updateData.products.length > 0) {
              await prisma.machineProduct.createMany({
                data: updateData.products.map((product: any) => ({
                  vendingMachineId: id,
                  productId: product.productId,
                  price: product.price,
                  isAvailable: product.isAvailable ?? true,
                })),
              });
            }
          }

          // Handle payment methods update
          if (updateData.paymentMethods && Array.isArray(updateData.paymentMethods)) {
            await prisma.machinePaymentMethod.deleteMany({
              where: { vendingMachineId: id }
            });
            
            // Get all payment method types
            const allPaymentMethodTypes = await prisma.paymentMethodType.findMany();
            
            // Create payment methods mapping
            const paymentMethodsToCreate = allPaymentMethodTypes.map(pmType => {
              const isAvailable = updateData.paymentMethods.includes(pmType.type) || false;
              return {
                vendingMachineId: id,
                paymentMethodTypeId: pmType.id,
                available: isAvailable,
              };
            });
            
            if (paymentMethodsToCreate.length > 0) {
              await prisma.machinePaymentMethod.createMany({
                data: paymentMethodsToCreate,
              });
            }
          }

          // Update machine data
          const updatedMachine = await prisma.vendingMachine.update({
            where: { id },
            data: {
              name: updateData.name,
              location: updateData.location,
              description: updateData.description,
              logo: updateData.logo,
              coordinates: updateData.coordinates,
              isActive: updateData.isActive
            },
            include: {
              products: { include: { product: true } },
              paymentMethods: { include: { paymentMethodType: true } },
              photos: true,
              reviews: true
            }
          });

          console.log('✅ Updated machine:', updatedMachine.name);
          return res.status(200).json(updatedMachine);
          
        } catch (dbError: any) {
          console.error('❌ Database error during update:', dbError);
          return res.status(500).json({
            error: 'Database connection failed',
            details: dbError.message
          });
        }
      }

      // Handle DELETE (delete machine)
      if (req.method === 'DELETE') {
        console.log('Deleting machine:', id);
        
        try {
          // Delete related records first
          await prisma.machineProduct.deleteMany({
            where: { vendingMachineId: id }
          });
          
          await prisma.machinePaymentMethod.deleteMany({
            where: { vendingMachineId: id }
          });
          
          await prisma.photo.deleteMany({
            where: { vendingMachineId: id }
          });
          
          await prisma.review.deleteMany({
            where: { vendingMachineId: id }
          });
          
          // Delete the machine
          await prisma.vendingMachine.delete({
            where: { id }
          });

          console.log('✅ Deleted machine:', id);
          return res.status(200).json({ message: 'Machine deleted successfully' });
          
        } catch (dbError: any) {
          console.error('❌ Database error during deletion:', dbError);
          return res.status(500).json({
            error: 'Database connection failed',
            details: dbError.message
          });
        }
      }
    }

    // Handle list operations
    if (req.method === 'GET') {
      console.log('Fetching machines...', admin ? '(admin view)' : '(public view)');
      
      try {
        const machines = await prisma.vendingMachine.findMany({
          where: admin ? {} : { isActive: true }, // Show all for admin, only active for public
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
                    description: true,
                    photo: true,
                    price: true,
                    isAvailable: true
                  }
                }
              },
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
          },
          orderBy: { createdAt: 'desc' }
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

    // Handle POST (create new machine)
    if (req.method === 'POST') {
      console.log('Creating new machine...');
      
      try {
        const machineData = req.body;
        
        // Get admin user for ownership
        const adminUser = await prisma.user.findFirst({
          where: { role: 'ADMIN', isActive: true }
        });

        if (!adminUser) {
          return res.status(500).json({ error: 'No admin user found' });
        }
        
        // Get all payment method types
        const allPaymentMethodTypes = await prisma.paymentMethodType.findMany();
        
        // Create payment methods mapping
        const paymentMethodsToCreate = allPaymentMethodTypes.map(pmType => {
          const isAvailable = machineData.paymentMethods?.includes(pmType.type) || false;
          return {
            paymentMethodTypeId: pmType.id,
            available: isAvailable,
          };
        });
        
        const newMachine = await prisma.vendingMachine.create({
          data: {
            name: machineData.name,
            location: machineData.location,
            description: machineData.description,
            logo: machineData.logo,
            coordinates: machineData.coordinates,
            isActive: machineData.isActive ?? true,
            ownerId: adminUser.id,
            products: {
              create: machineData.products?.map((product: any) => ({
                productId: product.productId,
                price: product.price,
                isAvailable: product.isAvailable ?? true,
              })) || [],
            },
            paymentMethods: {
              create: paymentMethodsToCreate,
            },
          },
          include: {
            products: { include: { product: true } },
            paymentMethods: { include: { paymentMethodType: true } },
            photos: true,
            reviews: true
          }
        });

        console.log('✅ Created machine:', newMachine.name);
        return res.status(201).json(newMachine);
        
      } catch (dbError: any) {
        console.error('❌ Database error during creation:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
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