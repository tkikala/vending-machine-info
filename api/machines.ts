import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
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
      res.status(200).json(machines);
    } catch (error) {
      console.error('Get machines error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 