import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`🔍 [${req.method}] /api/machines/[id] called with query:`, req.query);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      console.log('❌ Invalid machine ID:', id);
      return res.status(400).json({ error: 'Invalid machine ID' });
    }

    console.log('🔍 Processing request for machine ID:', id);

    if (req.method === 'GET') {
      console.log('Individual machine endpoint called - fetching machine:', id);
      
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

    if (req.method === 'PUT') {
      console.log('Updating machine:', id);

      try {
        const { name, location, description, logo, coordinates, isActive, products, paymentMethods } = req.body;
  
        // Start a transaction to update machine and related data
        const result = await prisma.$transaction(async (tx) => {
          // Update basic machine info
          const machine = await tx.vendingMachine.update({
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
  
          // Handle products if provided
          if (products && Array.isArray(products)) {
            console.log('Updating products:', products.length);
            
            // Get existing products
            const existingProducts = await tx.product.findMany({
              where: { vendingMachineId: id }
            });
  
            // Update existing products
            for (const product of products) {
              if (product.id) {
                // Update existing product
                await tx.product.update({
                  where: { id: product.id },
                  data: {
                    name: product.name,
                    description: product.description || '',
                    photo: product.photo || '',
                    price: product.price ? parseFloat(product.price) : null,
                    slotCode: product.slotCode || null,
                    isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
                  }
                });
              } else {
                // Create new product
                await tx.product.create({
                  data: {
                    name: product.name,
                    description: product.description || '',
                    photo: product.photo || '',
                    price: product.price ? parseFloat(product.price) : null,
                    slotCode: product.slotCode || null,
                    isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
                    vendingMachineId: id
                  }
                });
              }
            }
  
            // Delete products that are no longer in the list
            const productIds = products.filter(p => p.id).map(p => p.id);
            await tx.product.deleteMany({
              where: {
                vendingMachineId: id,
                id: { notIn: productIds }
              }
            });
          }
  
          // Handle payment methods if provided
          if (paymentMethods && Array.isArray(paymentMethods)) {
            console.log('Updating payment methods:', paymentMethods.length);
            
            // Get existing payment methods
            const existingPaymentMethods = await tx.paymentMethod.findMany({
              where: { vendingMachineId: id }
            });
  
            // Update existing payment methods
            for (const pm of paymentMethods) {
              const existing = existingPaymentMethods.find(epm => epm.type === pm.type);
              if (existing) {
                await tx.paymentMethod.update({
                  where: { id: existing.id },
                  data: { available: pm.available }
                });
              } else {
                await tx.paymentMethod.create({
                  data: {
                    type: pm.type,
                    available: pm.available,
                    vendingMachineId: id
                  }
                });
              }
            }
          }
  
          return machine;
        });
  
        console.log(`✅ Updated machine: ${result.name}`);
        return res.status(200).json(result);
  
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
        await prisma.vendingMachine.update({
          where: { id },
          data: { isActive: false }
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