import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

// Simple SVG PDF (browser/print-friendly). For production, we could integrate a QR library and real PDF.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const sessionToken = req.cookies?.session;
  if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });
  const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
  if (!session?.user || session.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  const machineId = String(req.query.machineId || '');
  if (!machineId) return res.status(400).json({ error: 'machineId required' });

  // UTM link
  const base = process.env.APP_URL || '';
  const url = `${base}/machine/${machineId}?utm_source=sticker&utm_medium=offline&utm_campaign=reviews`;

  // Minimal QR: link text + placeholder box; swap with QR lib if needed
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842"><rect width="100%" height="100%" fill="#ffffff"/><text x="50" y="80" font-family="Arial" font-size="24">Scan to view products, pay options & reviews</text><rect x="50" y="120" width="300" height="300" fill="#f3f3f3" stroke="#000"/><text x="50" y="450" font-family="Arial" font-size="14">URL: ${url}</text><text x="50" y="480" font-family="Arial" font-size="12" fill="#666">(Replace QR box with printed QR code if you use a QR generator.)</text></svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Content-Disposition', `attachment; filename="machine-${machineId}-qr.svg"`);
  return res.status(200).send(svg);
}
