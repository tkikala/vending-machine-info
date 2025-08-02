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
    const paymentMethods = [
      {
        id: '1',
        type: 'COIN',
        name: 'Coins',
        description: 'Cash coins',
        icon: '🪙',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'BANKNOTE',
        name: 'Banknotes',
        description: 'Cash banknotes',
        icon: '💵',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'GIROCARD',
        name: 'Girocard',
        description: 'German debit card',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiMwMDAwMDAiLz4KPHBhdGggZD0iTTE2IDEySDhWMTBIMTZWMTRIMFYxNkgxNlYxMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        type: 'CREDIT_CARD',
        name: 'Creditcard',
        description: 'Credit card',
        icon: '💳',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
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
    const { name, location, description, logo, products = [], paymentMethods = [] } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

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
      await prisma.paymentMethod.deleteMany({
        where: { vendingMachineId: id }
      });
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
        ...(paymentMethods.length > 0 && {
          paymentMethods: {
            create: paymentMethods.map((pm: any) => ({
              type: pm.type,
              available: pm.available ?? false,
            })),
          },
        }),
      },
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