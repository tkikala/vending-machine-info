const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleMachines() {
  try {
    console.log('🚀 Adding sample vending machines...');
    
    // Get the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 't.kikala@gmail.com' }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found!');
      return;
    }

    console.log('✅ Found admin user:', adminUser.name);

    // Sample Machine 1: Coffee & Snacks
    console.log('☕ Creating Coffee & Snacks machine...');
    const coffeeMachine = await prisma.vendingMachine.create({
      data: {
        name: 'Coffee & Snacks Corner',
        location: 'Main Building - Ground Floor',
        description: 'Fresh coffee, hot drinks, and delicious snacks available 24/7. Perfect for a quick break!',
        isActive: true,
        ownerId: adminUser.id
      }
    });

    console.log('✅ Coffee machine created with ID:', coffeeMachine.id);

    // Sample Machine 2: Healthy Options
    console.log('🥗 Creating Healthy Options machine...');
    const healthyMachine = await prisma.vendingMachine.create({
      data: {
        name: 'Healthy Options Hub',
        location: 'Fitness Center - Lobby',
        description: 'Nutritious snacks, protein bars, smoothies, and healthy beverages. Fuel your workout!',
        isActive: true,
        ownerId: adminUser.id
      }
    });

    console.log('✅ Healthy machine created with ID:', healthyMachine.id);

    // Sample Machine 3: Tech Gadgets
    console.log('📱 Creating Tech Gadgets machine...');
    const techMachine = await prisma.vendingMachine.create({
      data: {
        name: 'Tech Gadgets Express',
        location: 'Computer Science Building - 2nd Floor',
        description: 'Phone chargers, headphones, USB cables, and other tech accessories. Never run out of power!',
        isActive: true,
        ownerId: adminUser.id
      }
    });

    console.log('✅ Tech machine created with ID:', techMachine.id);

    // Get final count
    const machineCount = await prisma.vendingMachine.count();

    console.log('\n🎉 Sample vending machines added successfully!');
    console.log('📊 Summary:');
    console.log(`   🤖 Vending Machines: ${machineCount}`);
    console.log('\n🚀 Your vending machine app now has sample data!');

  } catch (error) {
    console.error('❌ Error adding sample machines:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleMachines(); 