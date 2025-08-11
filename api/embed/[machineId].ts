import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();
  const machineId = String(req.query.machineId || '');
  if (!machineId) return res.status(400).send('machineId required');
  try {
    const m = await prisma.vendingMachine.findUnique({
      where: { id: machineId, isActive: true },
      select: { id: true, name: true, location: true, products: { select: { product: { select: { name: true } }, price: true } } }
    });
    if (!m) return res.status(404).send('Not found');
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{margin:0;padding:12px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0b0b0b;color:#fff} .card{border:1px solid #333;border-radius:12px;padding:12px} h3{margin:0 0 6px 0} ul{margin:6px 0 0 18px;padding:0} a{color:#a78bfa;text-decoration:none}</style></head><body><div class="card"><h3>${m.name}</h3><div style="opacity:.8;font-size:12px">${m.location}</div><ul>${m.products.map((p:any)=>`<li>${p.product?.name || ''}${p.price?` — €${p.price.toFixed(2)}`:''}</li>`).join('')}</ul><div style="margin-top:8px"><a href="${req.headers.origin || ''}/machine/${m.id}" target="_blank" rel="noopener">View details</a></div></div></body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send('Error');
  }
}
