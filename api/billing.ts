import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import type { IncomingMessage } from 'http';
import prisma from './prisma';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret) : null as any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Stripe-Signature');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action } = req.query;

    if (action === 'checkout' && req.method === 'POST') {
      if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

      const { plan } = req.body as { plan: 'STARTER' | 'PRO' };
      if (!plan) return res.status(400).json({ error: 'Plan is required' });

      // Find user from session cookie
      const sessionToken = req.cookies?.session;
      if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });

      const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
      if (!session || !session.user) return res.status(401).json({ error: 'Unauthorized' });

      // Ensure stripe customer
      let customerId = session.user.stripeCustomerId || undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({ email: session.user.email, name: session.user.name });
        customerId = customer.id;
        await prisma.user.update({ where: { id: session.user.id }, data: { stripeCustomerId: customer.id } });
      }

      // Hardcode price IDs for now (to be set as env vars later)
      const priceId = plan === 'STARTER' ? process.env.STRIPE_PRICE_STARTER : process.env.STRIPE_PRICE_PRO;
      if (!priceId) return res.status(500).json({ error: 'Price ID not configured' });

      const appUrl = process.env.APP_URL || 'http://localhost:5173';

      const checkout = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/billing/success`,
        cancel_url: `${appUrl}/billing/cancel`,
        metadata: { userId: session.user.id, plan },
      });

      return res.status(200).json({ url: checkout.url });
    }

    if (action === 'portal' && req.method === 'GET') {
      if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

      const sessionToken = req.cookies?.session;
      if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });

      const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
      if (!session || !session.user || !session.user.stripeCustomerId) return res.status(401).json({ error: 'Unauthorized' });

      const returnUrl = process.env.BILLING_PORTAL_RETURN_URL || process.env.APP_URL || 'http://localhost:5173';

      const portal = await stripe.billingPortal.sessions.create({
        customer: session.user.stripeCustomerId,
        return_url: returnUrl,
      });

      return res.status(200).json({ url: portal.url });
    }

    if (action === 'webhook' && req.method === 'POST') {
      if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!sig || !webhookSecret) return res.status(400).json({ error: 'Missing signature or secret' });

      // Read raw body for signature verification
      const getRawBody = (request: IncomingMessage): Promise<Buffer> => {
        return new Promise((resolve, reject) => {
          try {
            const chunks: Buffer[] = [];
            request.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            request.on('end', () => resolve(Buffer.concat(chunks)));
            request.on('error', (err) => reject(err));
          } catch (err) {
            reject(err);
          }
        });
      };

      let event: Stripe.Event;
      try {
        let rawBodyBuf: Buffer;
        if ((req as any).rawBody && typeof (req as any).rawBody !== 'object') {
          rawBodyBuf = Buffer.isBuffer((req as any).rawBody)
            ? (req as any).rawBody
            : Buffer.from((req as any).rawBody);
        } else if (typeof req.body === 'string') {
          rawBodyBuf = Buffer.from(req.body);
        } else {
          rawBodyBuf = await getRawBody(req);
        }
        event = stripe.webhooks.constructEvent(rawBodyBuf, sig, webhookSecret);
      } catch (err: any) {
        console.error('❌ Webhook signature verification failed', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId as string | undefined;
            const plan = (session.metadata?.plan as 'STARTER' | 'PRO' | undefined) || 'STARTER';
            if (userId && session.subscription) {
              await prisma.subscription.upsert({
                where: { id: String(session.subscription) },
                update: {
                  status: 'ACTIVE',
                  currentPeriodEnd: new Date((session as any).current_period_end ? (Number((session as any).current_period_end) * 1000) : Date.now()),
                },
                create: {
                  id: String(session.subscription),
                  userId,
                  plan,
                  status: 'ACTIVE',
                  currentPeriodEnd: new Date(Date.now()),
                  stripeSubscriptionId: String(session.subscription),
                  machineLimit: plan === 'PRO' ? 100 : 10,
                  featuredSlots: plan === 'PRO' ? 5 : 1,
                },
              });
            }
            break;
          }
          case 'customer.subscription.updated':
          case 'customer.subscription.created':
          case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription;
            const statusMap: any = {
              active: 'ACTIVE',
              trialing: 'ACTIVE',
              past_due: 'PAST_DUE',
              canceled: 'CANCELED',
              unpaid: 'PAST_DUE',
            };
            await prisma.subscription.upsert({
              where: { id: sub.id },
              update: {
                status: statusMap[sub.status] || 'ACTIVE',
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
              },
              create: {
                id: sub.id,
                userId: String(sub.metadata?.userId || ''),
                plan: (sub.items.data[0]?.price?.nickname === 'PRO' ? 'PRO' : 'STARTER') as any,
                status: statusMap[sub.status] || 'ACTIVE',
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                stripeSubscriptionId: sub.id,
                machineLimit: (sub.items.data[0]?.price?.nickname === 'PRO') ? 100 : 10,
                featuredSlots: (sub.items.data[0]?.price?.nickname === 'PRO') ? 5 : 1,
              },
            });
            break;
          }
        }
      } catch (err) {
        console.error('❌ Webhook handling error', err);
        return res.status(500).end();
      }

      return res.status(200).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Billing Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
