import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      console.log('Creating new payment method...');
      
      try {
        const { type, available, vendingMachineId } = req.body;
        
        if (!type || !vendingMachineId) {
          return res.status(400).json({ error: 'Type and vending machine ID are required' });
        }

        const paymentMethod = await prisma.paymentMethod.create({
          data: {
            type,
            available: available !== undefined ? available : false,
            vendingMachineId
          }
        });

        console.log(`✅ Created payment method: ${paymentMethod.type}`);
        return res.status(201).json(paymentMethod);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to create payment method',
          details: dbError.message
        });
      }
    }

    if (req.method === 'PUT') {
      console.log('Updating payment method...');
      
      try {
        const { id, type, available } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Payment method ID is required' });
        }

        const paymentMethod = await prisma.paymentMethod.update({
          where: { id },
          data: {
            type: type || undefined,
            available: available !== undefined ? available : undefined
          }
        });

        console.log(`✅ Updated payment method: ${paymentMethod.type}`);
        return res.status(200).json(paymentMethod);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to update payment method',
          details: dbError.message
        });
      }
    }

    if (req.method === 'DELETE') {
      console.log('Deleting payment method...');
      
      try {
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Payment method ID is required' });
        }

        await prisma.paymentMethod.delete({
          where: { id }
        });

        console.log(`✅ Deleted payment method: ${id}`);
        return res.status(200).json({ message: 'Payment method deleted successfully' });
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to delete payment method',
          details: dbError.message
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 