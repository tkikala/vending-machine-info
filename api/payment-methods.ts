import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Fetching all payment method types...');
    
    const paymentMethods = await prisma.paymentMethodType.findMany({
      orderBy: {
        type: 'asc'
      }
    });

    console.log(`✅ Found ${paymentMethods.length} payment method types`);
    return res.status(200).json(paymentMethods);
    
  } catch (error) {
    console.error('❌ Payment methods error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 