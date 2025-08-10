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
    if (!session || !session.user) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const { machineId, message } = req.body as { machineId: string, message?: string };
      if (!machineId) return res.status(400).json({ error: 'machineId is required' });

      // Ensure machine exists
      const machine = await prisma.vendingMachine.findUnique({ where: { id: machineId } });
      if (!machine) return res.status(404).json({ error: 'Machine not found' });

      // Create claim
      const claim = await prisma.machineClaim.create({
        data: {
          machineId,
          requesterUserId: session.user.id,
          message: message?.trim() || null,
        },
      });
      // Notify admin
      try {
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true } });
        for (const admin of admins) {
          if (admin.email) {
            await sendEmail(
              admin.email,
              'New machine claim submitted',
              `<p>User ${session.user.name} requested ownership for machine ${machine.name}.</p>`
            );
          }
        }
      } catch {}

      return res.status(201).json(claim);
    }

    if (req.method === 'GET') {
      const claims = await prisma.machineClaim.findMany({
        where: { requesterUserId: session.user.id },
        include: { machine: { select: { id: true, name: true, location: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(claims);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Operator Claims Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
