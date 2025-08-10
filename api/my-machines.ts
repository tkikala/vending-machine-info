import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

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

    const machines = await prisma.vendingMachine.findMany({
      where: { ownerId: session.user.id },
      select: {
        id: true,
        name: true,
        location: true,
        description: true,
        logo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.status(200).json(machines);
  } catch (error) {
    console.error('❌ My Machines Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
