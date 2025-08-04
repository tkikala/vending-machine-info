const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function updateSchema() {
  try {
    console.log('🔄 Updating Vercel database schema...');
    
    // Add category column to Product table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "category" TEXT;
    `;
    
    console.log('✅ Schema updated successfully!');
    
    // Test the update by fetching products
    const products = await prisma.product.findMany({
      take: 5
    });
    
    console.log(`✅ Found ${products.length} products in database`);
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSchema(); 