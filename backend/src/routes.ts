import { Router } from 'express';
import prisma from './prisma';
import authRouter from './auth-routes';
import { requireAuth, requireAdmin, requireOwnerOrAdmin } from './auth';

const router = Router();

// Auth routes
router.use('/auth', authRouter);

// Get all payment methods (public)
router.get('/payment-methods', async (req, res) => {
  try {
    const paymentMethods = await prisma.paymentMethodType.findMany({
      orderBy: [
        { type: 'asc' }
      ]
    });
    res.json(paymentMethods);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all vending machines (public)
router.get('/machines', async (req, res) => {
  try {
    const machines = await prisma.vendingMachine.findMany({
      where: { isActive: true },
      include: {
        products: { where: { isAvailable: true }, include: { product: true } },
        paymentMethods: { include: { paymentMethodType: true } },
        photos: true,
        reviews: { where: { isApproved: true }, include: { user: { select: { id: true, name: true } } } },
        owner: { select: { id: true, name: true } },
      },
    });
    res.json(machines);
  } catch (error) {
    console.error('Get machines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vending machine by ID (public)
router.get('/machines/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const machine = await prisma.vendingMachine.findUnique({
      where: { id, isActive: true },
      include: {
        products: { where: { isAvailable: true }, include: { product: true } },
        paymentMethods: { include: { paymentMethodType: true } },
        photos: true,
        reviews: { where: { isApproved: true }, include: { user: { select: { id: true, name: true } } } },
        owner: { select: { id: true, name: true } },
      },
    });
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    res.json(machine);
  } catch (error) {
    console.error('Get machine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Routes - Get all machines (including inactive)
router.get('/admin/machines', requireAuth, requireAdmin, async (req, res) => {
  try {
    const machines = await prisma.vendingMachine.findMany({
      include: {
        products: { include: { product: true } },
        paymentMethods: { include: { paymentMethodType: true } },
        photos: true,
        reviews: { include: { user: { select: { id: true, name: true } } } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(machines);
  } catch (error) {
    console.error('Get admin machines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vending machine by ID (admin)
router.get('/admin/machines/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const machine = await prisma.vendingMachine.findUnique({
      where: { id },
      include: {
        products: { include: { product: true } },
        paymentMethods: { include: { paymentMethodType: true } },
        photos: true,
        reviews: { include: { user: { select: { id: true, name: true } } } },
        owner: { select: { id: true, name: true } },
      },
    });
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    res.json(machine);
  } catch (error) {
    console.error('Get admin machine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create vending machine
router.post('/machines', requireAuth, async (req, res) => {
  try {
    const { name, location, description, logo, coordinates, products = [], paymentMethods = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Machine name is required' });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Machine location is required' });
    }

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true }
    });

    if (!adminUser) {
      return res.status(500).json({ error: 'No admin user found' });
    }

    const machine = await prisma.$transaction(async (tx) => {
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
                price: productData.price || null,
                isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true
              }
            });
          }
        }
      }

      // Create payment methods
      if (paymentMethods && Array.isArray(paymentMethods)) {
        for (const paymentType of paymentMethods) {
          const pmType = await tx.paymentMethodType.findUnique({
            where: { type: paymentType }
          });
          
          if (pmType) {
            await tx.machinePaymentMethod.create({
              data: {
                vendingMachineId: newMachine.id,
                paymentMethodTypeId: pmType.id,
                available: true
              }
            });
          }
        }
      }

      return newMachine;
    });

    // Fetch the updated machine with correct payment method data
    const updatedMachine = await prisma.vendingMachine.findUnique({
      where: { id: machine.id },
      include: {
        products: { include: { product: true } },
        paymentMethods: { include: { paymentMethodType: true } },
        photos: true,
        owner: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(updatedMachine);
  } catch (error) {
    console.error('Create machine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vending machine (owner or admin)
router.put('/machines/:id', requireAuth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, location, description, logo, coordinates, isActive, products = [], paymentMethods = [] } = req.body;

    const updateData: any = {
      ...(name && { name }),
      ...(location && { location }),
      ...(description !== undefined && { description }),
      ...(logo !== undefined && { logo }),
      ...(coordinates !== undefined && { coordinates }),
      ...(isActive !== undefined && { isActive }),
    };

    // Handle products update - delete existing and create new ones
    if (products.length > 0) {
      // Delete existing machine products
      await prisma.machineProduct.deleteMany({
        where: { vendingMachineId: id }
      });
    }

    // Handle payment methods update - delete existing and create new ones
    if (paymentMethods.length > 0) {
      // Delete existing payment methods
      await prisma.machinePaymentMethod.deleteMany({
        where: { vendingMachineId: id }
      });

      // Get all available payment method types
      const allPaymentMethodTypes = await prisma.paymentMethodType.findMany();

      // Create payment methods for all types
      await prisma.machinePaymentMethod.createMany({
        data: allPaymentMethodTypes.map((pmType) => ({
          vendingMachineId: id,
          paymentMethodTypeId: pmType.id,
          available: false, // Default to false
        }))
      });

      // Update availability based on frontend data
      for (const pm of paymentMethods) {
        if (pm.type) {
          await prisma.machinePaymentMethod.updateMany({
            where: {
              vendingMachineId: id,
              paymentMethodType: {
                type: pm.type
              }
            },
            data: {
              available: pm.available ?? false
            }
          });
        }
      }
    }

    const machine = await prisma.vendingMachine.update({
      where: { id },
      data: {
        ...updateData,
        ...(products.length > 0 && {
          products: {
            create: products.map((product: any) => ({
              productId: product.productId,
              price: product.price,
              isAvailable: product.isAvailable ?? true,
            })),
          },
        }),
      },
      include: {
        products: { include: { product: true } },
        paymentMethods: { include: { paymentMethodType: true } },
        photos: true,
        owner: { select: { id: true, name: true } },
      },
    });

    res.json(machine);
  } catch (error) {
    console.error('Update machine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vending machine (owner or admin)
router.delete('/machines/:id', requireAuth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.vendingMachine.delete({ where: { id } });
    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Delete machine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's own machines
router.get('/my-machines', requireAuth, async (req, res) => {
  try {
    const machines = await prisma.vendingMachine.findMany({
      where: { ownerId: req.user.id },
      include: {
        products: { include: { product: true } },
        paymentMethods: { include: { paymentMethodType: true } },
        photos: true,
        reviews: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(machines);
  } catch (error) {
    console.error('Get user machines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product search endpoint
router.get('/products', async (req, res) => {
  try {
    const { search } = req.query;
    
    let products;
    
    if (search && typeof search === 'string') {
      // Search products by name (SQLite doesn't support case-insensitive search)
      products = await prisma.product.findMany({
        where: {
          name: {
            contains: search
          }
        },
        orderBy: {
          name: 'asc'
        },
        take: 10 // Limit results
      });
    } else {
      // Get all products
      products = await prisma.product.findMany({
        orderBy: {
          name: 'asc'
        }
      });
    }

    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product endpoint
router.post('/products', async (req, res) => {
  try {
    const { name, description, photo, price } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: name.trim()
        }
      }
    });

    if (existingProduct) {
      return res.status(409).json({ 
        error: 'Product already exists',
        product: existingProduct
      });
    }

    // Create new product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        photo: photo || null,
        price: price ? parseFloat(price) : null,
        isAvailable: true
      }
    });

    console.log(`✅ Created product: ${product.name}`);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 