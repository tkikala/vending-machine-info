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
    if (!session?.user || session.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    if (req.method === 'GET') {
      const subs = await prisma.subscription.findMany({
        include: {
          user: { select: { id: true, email: true, name: true, stripeCustomerId: true } }
        },
        orderBy: { updatedAt: 'desc' }
      });
      return res.status(200).json(subs);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Admin Subscriptions Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
