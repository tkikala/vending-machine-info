import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sessionToken = req.cookies?.session;
    if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });
    const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
    if (!session || !session.user) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const reviews = await prisma.review.findMany({
        where: { vendingMachine: { ownerId: session.user.id } },
        select: {
          id: true,
          rating: true,
          comment: true,
          reply: true,
          isHidden: true,
          isApproved: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
          vendingMachine: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(reviews);
    }

    if (req.method === 'POST') {
      const { id, action, reply } = req.body as { id: string; action: 'reply' | 'hide' | 'unhide'; reply?: string };
      if (!id || !action) return res.status(400).json({ error: 'id and action required' });

      // Verify ownership
      const review = await prisma.review.findUnique({ where: { id }, include: { vendingMachine: true } });
      if (!review || review.vendingMachine.ownerId !== session.user.id) return res.status(404).json({ error: 'Review not found' });

      if (action === 'reply') {
        const updated = await prisma.review.update({ where: { id }, data: { reply: reply?.trim() || null } });
        return res.status(200).json(updated);
      }
      if (action === 'hide') {
        const updated = await prisma.review.update({ where: { id }, data: { isHidden: true } });
        return res.status(200).json(updated);
      }
      if (action === 'unhide') {
        const updated = await prisma.review.update({ where: { id }, data: { isHidden: false } });
        return res.status(200).json(updated);
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Operator Reviews Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
