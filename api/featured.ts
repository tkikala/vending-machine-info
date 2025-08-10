import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { machineId } = req.query;

    if (req.method === 'GET') {
      if (!machineId || typeof machineId !== 'string') return res.status(400).json({ error: 'machineId required' });

      const now = new Date();
      const listing = await prisma.featuredListing.findFirst({
        where: { machineId, startsAt: { lte: now }, endsAt: { gte: now } },
        orderBy: { startsAt: 'desc' },
      });
      return res.status(200).json({ active: Boolean(listing), listing });
    }

    if (req.method === 'POST') {
      const sessionToken = req.cookies?.session;
      if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });
      const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
      if (!session || !session.user) return res.status(401).json({ error: 'Unauthorized' });

      const { machineId: mid, durationDays } = req.body as { machineId: string, durationDays?: number };
      if (!mid) return res.status(400).json({ error: 'machineId is required' });

      // Check ownership
      const machine = await prisma.vendingMachine.findUnique({ where: { id: mid } });
      if (!machine) return res.status(404).json({ error: 'Machine not found' });
      if (machine.ownerId !== session.user.id && session.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

      // Check entitlement (simple via subscription snapshot)
      const sub = await prisma.subscription.findFirst({ where: { userId: session.user.id, status: 'ACTIVE' } });
      const slotLimit = sub?.featuredSlots ?? 1;
      const now = new Date();
      const activeCount = await prisma.featuredListing.count({ where: { userId: session.user.id, startsAt: { lte: now }, endsAt: { gte: now } } });
      if (activeCount >= slotLimit) return res.status(403).json({ error: 'No featured slots available' });

      const startsAt = now;
      const endsAt = new Date(now.getTime() + (durationDays ?? 30) * 24 * 60 * 60 * 1000);

      const listing = await prisma.featuredListing.create({ data: { machineId: mid, userId: session.user.id, startsAt, endsAt } });
      return res.status(201).json(listing);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Featured Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
