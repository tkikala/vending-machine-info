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
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"/><style>
      body{margin:0;padding:16px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center}
      .vending-machine{background:linear-gradient(145deg,#2d2d2d,#1a1a1a);border:2px solid #4c1d95;border-radius:20px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.3);max-width:320px;width:100%}
      .machine-header{text-align:center;margin-bottom:16px;position:relative}
      .machine-name{font-size:18px;font-weight:700;margin:0 0 4px 0;color:#e0e7ff}
      .machine-location{font-size:12px;opacity:0.8;color:#a5b4fc}
      .products-section{margin:16px 0}
      .products-title{font-size:14px;font-weight:600;margin:0 0 12px 0;color:#c4b5fd;text-align:center}
      .product-list{list-style:none;padding:0;margin:0;display:grid;gap:8px}
      .product-item{background:linear-gradient(90deg,#3b3b3b,#2a2a2a);border:1px solid #4c1d95;border-radius:8px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center}
      .product-name{font-size:13px;font-weight:500}
      .product-price{font-size:12px;color:#a78bfa;font-weight:600}
      .view-details{display:block;text-align:center;margin-top:16px;padding:10px 16px;background:linear-gradient(90deg,#7c3aed,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;transition:all 0.2s}
      .view-details:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(124,58,237,0.3)}
      .machine-icon{width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#8b5cf6);border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:20px}
    </style></head><body>
      <div class="vending-machine">
        <div class="machine-header">
          <div class="machine-icon">🥤</div>
          <h3 class="machine-name">${m.name}</h3>
          <div class="machine-location">📍 ${m.location}</div>
        </div>
        <div class="products-section">
          <div class="products-title">Available Products</div>
          <ul class="product-list">
            ${m.products.map((p:any)=>`<li class="product-item"><span class="product-name">${p.product?.name || ''}</span><span class="product-price">${p.price?`€${p.price.toFixed(2)}`:'Free'}</span></li>`).join('')}
          </ul>
        </div>
        <a href="${req.headers.origin || ''}/machine/${m.id}" target="_blank" rel="noopener" class="view-details">View Full Details</a>
      </div>
    </body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send('Error');
  }
}
