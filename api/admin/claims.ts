import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';
import { sendEmail } from '../email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sessionToken = req.cookies?.session;
    if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });

    const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
    if (!session || !session.user || session.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    if (req.method === 'GET') {
      const claims = await prisma.machineClaim.findMany({
        where: { status: 'PENDING' },
        include: {
          machine: { select: { id: true, name: true, location: true, owner: { select: { id: true, name: true, email: true } } } },
          requester: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      return res.status(200).json(claims);
    }

    if (req.method === 'POST') {
      const { id, decision } = req.body as { id: string, decision: 'APPROVE' | 'REJECT' };
      if (!id || !decision) return res.status(400).json({ error: 'id and decision required' });

      const claim = await prisma.machineClaim.findUnique({ where: { id }, include: { machine: true, requester: true } });
      if (!claim || claim.status !== 'PENDING') return res.status(404).json({ error: 'Claim not found or already decided' });

      if (decision === 'APPROVE') {
        // Enforce subscription machine limit
        const sub = await prisma.subscription.findFirst({ where: { userId: claim.requesterUserId, status: 'ACTIVE' } });
        const limit = sub?.machineLimit ?? 1;
        const currentOwned = await prisma.vendingMachine.count({ where: { ownerId: claim.requesterUserId } });
        if (currentOwned >= limit) {
          return res.status(403).json({ error: 'Machine limit reached for requester' });
        }

        await prisma.$transaction([
          prisma.vendingMachine.update({ where: { id: claim.machineId }, data: { ownerId: claim.requesterUserId } }),
          prisma.machineClaim.update({ where: { id }, data: { status: 'APPROVED', decidedByUserId: session.user.id, decidedAt: new Date() } }),
        ]);

        // Notify requester
        try {
          if (claim.requester.email) {
            await sendEmail(
              claim.requester.email,
              'Your machine claim was approved',
              `<p>Your ownership request for machine ${claim.machine.name} has been approved.</p>`
            );
          }
        } catch {}
      } else {
        await prisma.machineClaim.update({ where: { id }, data: { status: 'REJECTED', decidedByUserId: session.user.id, decidedAt: new Date() } });
        try {
          if (claim.requester.email) {
            await sendEmail(
              claim.requester.email,
              'Your machine claim was rejected',
              `<p>Your ownership request for machine ${claim.machine.name} was rejected.</p>`
            );
          }
        } catch {}
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Admin Claims Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
