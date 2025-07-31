const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);
    
    // Count machines
    const machineCount = await prisma.vendingMachine.count();
    console.log(`🤖 Vending Machines: ${machineCount}`);
    
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 't.kikala@gmail.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      console.log('❌ Admin user not found!');
    }
    
    // Get sample machines
    const machines = await prisma.vendingMachine.findMany({
      take: 3
    });
    
    console.log('\n📋 Sample machines:');
    machines.forEach((machine, index) => {
      console.log(`   ${index + 1}. ${machine.name} (${machine.location})`);
    });
    
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 