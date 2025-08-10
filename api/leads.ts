import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { name, email, phone, venueName, address, message } = req.body || {};
      if (!name || !email || !venueName || !address) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const lead = await prisma.lead.create({
        data: {
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: phone ? String(phone).trim() : null,
          venueName: String(venueName).trim(),
          address: String(address).trim(),
          message: message ? String(message).trim() : null,
        }
      });
      return res.status(201).json({ success: true, id: lead.id });
    }

    if (req.method === 'GET') {
      // Admin-only: list leads
      const sessionToken = req.cookies?.session;
      const session = sessionToken ? await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } }) : null;
      if (!session?.user || session.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

      const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(leads);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Leads Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
