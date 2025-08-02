import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const paymentMethods = await prisma.paymentMethodType.findMany();
    
    // Sort payment methods in the desired order: Coins, Banknotes, Girocard, Creditcard
    const sortedPaymentMethods = paymentMethods.sort((a, b) => {
      const order = ['COIN', 'BANKNOTE', 'GIROCARD', 'CREDIT_CARD'];
      const aIndex = order.indexOf(a.type);
      const bIndex = order.indexOf(b.type);
      return aIndex - bIndex;
    });

    res.status(200).json(sortedPaymentMethods);
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
} 