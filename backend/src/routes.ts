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
        products: { where: { isAvailable: true } },
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
        products: { where: { isAvailable: true } },
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
        products: true,
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
        products: true,
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

// Create new vending machine (owner or admin)
router.post('/machines', requireAuth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { name, location, description, logo, products = [], paymentMethods = [] } = req.body;

    // Get all available payment method types
    const allPaymentMethodTypes = await prisma.paymentMethodType.findMany();

    const machine = await prisma.vendingMachine.create({
      data: {
        name,
        location,
        description,
        logo,
        ownerId: req.user.id,
        products: {
          create: products.map((product: any) => ({
            name: product.name,
            description: product.description,
            photo: product.photo,
            price: product.price,
            slotCode: product.slotCode,
            isAvailable: product.isAvailable ?? true,
          })),
        },
        paymentMethods: {
          create: allPaymentMethodTypes.map((pmType) => ({
            paymentMethodTypeId: pmType.id,
            available: false, // Default to false, will be updated based on frontend data
          })),
        },
      },
      include: {
        products: true,
        paymentMethods: { include: { paymentMethodType: true } },
        photos: true,
        owner: { select: { id: true, name: true } },
      },
    });

    // Update payment method availability based on frontend data
    if (paymentMethods.length > 0) {
      for (const pm of paymentMethods) {
        if (pm.type) {
          await prisma.machinePaymentMethod.updateMany({
            where: {
              vendingMachineId: machine.id,
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

    // Fetch the updated machine with correct payment method data
    const updatedMachine = await prisma.vendingMachine.findUnique({
      where: { id: machine.id },
      include: {
        products: true,
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
    const { name, location, description, logo, isActive, products = [], paymentMethods = [] } = req.body;

    const updateData: any = {
      ...(name && { name }),
      ...(location && { location }),
      ...(description !== undefined && { description }),
      ...(logo !== undefined && { logo }),
      ...(isActive !== undefined && { isActive }),
    };

    // Handle products update - delete existing and create new ones
    if (products.length > 0) {
      // Delete existing products
      await prisma.product.deleteMany({
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
              name: product.name,
              description: product.description,
              photo: product.photo,
              price: product.price,
              slotCode: product.slotCode,
              isAvailable: product.isAvailable ?? true,
            })),
          },
        }),
      },
      include: {
        products: true,
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
        products: true,
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

export default router; 