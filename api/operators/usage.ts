import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sessionToken = req.cookies?.session;
    if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });

    const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
    if (!session || !session.user) return res.status(401).json({ error: 'Unauthorized' });

    const sub = await prisma.subscription.findFirst({ where: { userId: session.user.id, status: 'ACTIVE' } });
    const machineLimit = sub?.machineLimit ?? 1;
    const featuredSlots = sub?.featuredSlots ?? 0;

    const usedMachines = await prisma.vendingMachine.count({ where: { ownerId: session.user.id } });

    const now = new Date();
    const activeFeatured = await prisma.featuredListing.count({
      where: { userId: session.user.id, startsAt: { lte: now }, endsAt: { gte: now } }
    });

    return res.status(200).json({ machineLimit, featuredSlots, usedMachines, activeFeatured });
  } catch (error) {
    console.error('❌ Operator Usage Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
