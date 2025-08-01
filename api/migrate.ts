import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Run migrations
    const { execSync } = require('child_process');
    
    console.log('📦 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('🎉 Migration script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateDatabase; 