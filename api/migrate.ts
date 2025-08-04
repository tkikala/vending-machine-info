import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Running database migration...');
    
    // Add category column to Product table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "category" TEXT;
    `;
    
    console.log('✅ Migration completed successfully!');
    
    // Test the migration by fetching products
    const products = await prisma.product.findMany({
      take: 5
    });
    
    console.log(`✅ Found ${products.length} products in database`);
    
    return res.status(200).json({ 
      message: 'Migration completed successfully',
      productsCount: products.length
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return res.status(500).json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 