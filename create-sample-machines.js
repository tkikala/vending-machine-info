const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleMachines() {
  try {
    console.log('🚀 Creating sample vending machines...');

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 't.kikala@gmail.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Please run create-admin.js first.');
      return;
    }

    const machines = [
      {
        name: 'Coffee Corner',
        location: 'Main Building - Ground Floor',
        description: 'Premium coffee and snacks vending machine'
      },
      {
        name: 'Healthy Hub',
        location: 'Fitness Center - Lobby',
        description: 'Healthy snacks and protein products'
      },
      {
        name: 'Tech Stop',
        location: 'IT Department - Break Room',
        description: 'Tech accessories and gadgets'
      },
      {
        name: 'BERE',
        location: 'BERE',
        description: 'Test machine'
      }
    ];

    for (const machineData of machines) {
      const machine = await prisma.vendingMachine.create({
        data: {
          ...machineData,
          ownerId: adminUser.id,
          isActive: true
        }
      });
      console.log(`✅ Created machine: ${machine.name}`);
    }

    console.log('\n🎉 Sample machines created successfully!');
    console.log(`📊 Created ${machines.length} vending machines`);

  } catch (error) {
    console.error('❌ Error creating sample machines:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleMachines(); 