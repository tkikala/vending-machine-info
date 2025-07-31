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
      console.log('Creating new product...');
      
      try {
        const { name, description, price, slotCode, vendingMachineId, isAvailable } = req.body;
        
        if (!name || !vendingMachineId) {
          return res.status(400).json({ error: 'Name and vending machine ID are required' });
        }

        const product = await prisma.product.create({
          data: {
            name,
            description: description || '',
            price: price ? parseFloat(price) : null,
            slotCode: slotCode || null,
            vendingMachineId,
            isAvailable: isAvailable !== undefined ? isAvailable : true
          }
        });

        console.log(`✅ Created product: ${product.name}`);
        return res.status(201).json(product);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to create product',
          details: dbError.message
        });
      }
    }

    if (req.method === 'PUT') {
      console.log('Updating product...');
      
      try {
        const { id, name, description, price, slotCode, isAvailable } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        const product = await prisma.product.update({
          where: { id },
          data: {
            name: name || undefined,
            description: description || undefined,
            price: price ? parseFloat(price) : undefined,
            slotCode: slotCode || undefined,
            isAvailable: isAvailable !== undefined ? isAvailable : undefined
          }
        });

        console.log(`✅ Updated product: ${product.name}`);
        return res.status(200).json(product);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to update product',
          details: dbError.message
        });
      }
    }

    if (req.method === 'DELETE') {
      console.log('Deleting product...');
      
      try {
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        await prisma.product.delete({
          where: { id }
        });

        console.log(`✅ Deleted product: ${id}`);
        return res.status(200).json({ message: 'Product deleted successfully' });
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to delete product',
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