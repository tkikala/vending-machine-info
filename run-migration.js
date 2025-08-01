const { execSync } = require('child_process');

async function runMigration() {
  try {
    console.log('🔍 Running Prisma migration...');
    
    // Run the migration
    execSync('cd api && npx prisma migrate deploy', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL
      }
    });
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration(); 