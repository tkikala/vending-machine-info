import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

// Generate a branded QR PDF with loading rings motif
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const sessionToken = req.cookies?.session;
  if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });
  const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
  if (!session?.user || session.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  const machineId = String(req.query.machineId || '');
  if (!machineId) return res.status(400).json({ error: 'machineId required' });

  const base = process.env.APP_URL || '';
  const url = `${base}/machine/${machineId}?utm_source=sticker&utm_medium=offline&utm_campaign=reviews`;

  // Create QR PNG buffer
  const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, scale: 8 });
  const qrBase64 = qrDataUrl.split(',')[1];
  const qrBuffer = Buffer.from(qrBase64, 'base64');

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks: any[] = [];
  doc.on('data', (c) => chunks.push(c));
  doc.on('end', () => {
    const pdf = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=machine-${machineId}-qr.pdf`);
    res.status(200).send(pdf);
  });

  doc.fontSize(22).text('Scan to view products, payments & reviews');
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#555').text(url);
  doc.moveDown(1);

  // Decorative loading rings motif
  const cx = 420, cy = 120;
  const rings = [40, 60, 80];
  rings.forEach((r, i) => {
    doc.circle(cx, cy, r).strokeColor(['#8b5cf6', '#6366f1', '#22c55e'][i]).lineWidth(2).stroke();
  });

  doc.image(qrBuffer, 40, 120, { width: 260, height: 260 });
  doc.moveDown(18);
  doc.fontSize(10).fillColor('#666').text('Tip: Place this near the keypad/payment area for maximum scans.');
  doc.end();
}
