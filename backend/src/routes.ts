import { Router } from 'express';
import prisma from './prisma';
import authRouter from './auth-routes';
import { requireAuth, requireAdmin, requireOwnerOrAdmin } from './auth';

const router = Router();

// Auth routes
router.use('/auth', authRouter);

// Get all vending machines (public)
router.get('/machines', async (req, res) => {
  try {
    const machines = await prisma.vendingMachine.findMany({
      where: { isActive: true },
      include: {
        products: { where: { isAvailable: true } },
        paymentMethods: true,
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
        paymentMethods: true,
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
        paymentMethods: true,
        photos: true,
        reviews: { include: { user: { select: { id: true, name: true } } } },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(machines);
  } catch (error) {
    console.error('Admin get machines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create vending machine (authenticated users)
router.post('/machines', requireAuth, async (req, res) => {
  try {
    const { name, location, description, products = [], paymentMethods = [] } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const machine = await prisma.vendingMachine.create({
      data: {
        name,
        location,
        description,
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
          create: paymentMethods.map((pm: any) => ({
            type: pm.type,
            available: pm.available ?? false,
          })),
        },
      },
      include: {
        products: true,
        paymentMethods: true,
        photos: true,
        owner: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(machine);
  } catch (error) {
    console.error('Create machine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vending machine (owner or admin)
router.put('/machines/:id', requireAuth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, location, description, isActive, products, paymentMethods } = req.body;

    const updateData: any = {
      ...(name && { name }),
      ...(location && { location }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    };

    const machine = await prisma.vendingMachine.update({
      where: { id },
      data: updateData,
      include: {
        products: true,
        paymentMethods: true,
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
        paymentMethods: true,
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