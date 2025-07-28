import { Router } from 'express';
import prisma from './prisma';

const router = Router();

// Get all vending machines
router.get('/machines', async (req, res) => {
  const machines = await prisma.vendingMachine.findMany({
    include: {
      products: true,
      paymentMethods: true,
      photos: true,
      reviews: true,
      owner: { select: { id: true, name: true } },
    },
  });
  res.json(machines);
});

// Get vending machine by ID
router.get('/machines/:id', async (req, res) => {
  const id = Number(req.params.id);
  const machine = await prisma.vendingMachine.findUnique({
    where: { id },
    include: {
      products: true,
      paymentMethods: true,
      photos: true,
      reviews: { include: { user: { select: { id: true, name: true } } } },
      owner: { select: { id: true, name: true } },
    },
  });
  if (!machine) return res.status(404).json({ error: 'Not found' });
  res.json(machine);
});

// Create a vending machine (basic, for demo)
router.post('/machines', async (req, res) => {
  const { name, location, ownerId } = req.body;
  const machine = await prisma.vendingMachine.create({
    data: { name, location, ownerId },
  });
  res.status(201).json(machine);
});

export default router; 