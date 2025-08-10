import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

function startOfUTC(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return d;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action } = req.query;

    if (action === 'event' && req.method === 'POST') {
      const { machineId, type } = req.body as { machineId: string, type: 'view' | 'click_website' | 'click_phone' };
      if (!machineId || !type) return res.status(400).json({ error: 'machineId and type required' });

      const machine = await prisma.vendingMachine.findUnique({ where: { id: machineId } });
      if (!machine) return res.status(404).json({ error: 'Machine not found' });

      const today = startOfUTC(new Date());
      const stats = await prisma.machineDailyStats.upsert({
        where: { machineId_date: { machineId, date: today } },
        update: {
          views: type === 'view' ? { increment: 1 } : undefined,
          clicksWebsite: type === 'click_website' ? { increment: 1 } : undefined,
          clicksPhone: type === 'click_phone' ? { increment: 1 } : undefined,
        },
        create: {
          machineId,
          date: today,
          views: type === 'view' ? 1 : 0,
          clicksWebsite: type === 'click_website' ? 1 : 0,
          clicksPhone: type === 'click_phone' ? 1 : 0,
        },
      });

      return res.status(200).json(stats);
    }

    if (action === 'stats' && req.method === 'GET') {
      const { machineId, range } = req.query as { [k: string]: string };
      if (!machineId) return res.status(400).json({ error: 'machineId required' });
      const days = range === '7d' ? 7 : 30;
      const since = startOfUTC(new Date(Date.now() - days * 86400000));

      const rows = await prisma.machineDailyStats.findMany({
        where: { machineId: String(machineId), date: { gte: since } },
        orderBy: { date: 'asc' },
      });

      return res.status(200).json({ range: days, rows });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Analytics Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
