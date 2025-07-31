const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMachinesWithSQL() {
  try {
    console.log('🚀 Adding sample vending machines using SQL...');
    
    // Get the admin user ID
    const adminUser = await prisma.user.findUnique({
      where: { email: 't.kikala@gmail.com' },
      select: { id: true, name: true }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found!');
      return;
    }

    console.log('✅ Found admin user:', adminUser.name, 'ID:', adminUser.id);

    // Add machines using raw SQL
    const machines = [
      {
        name: 'Coffee & Snacks Corner',
        location: 'Main Building - Ground Floor',
        description: 'Fresh coffee, hot drinks, and delicious snacks available 24/7. Perfect for a quick break!'
      },
      {
        name: 'Healthy Options Hub',
        location: 'Fitness Center - Lobby',
        description: 'Nutritious snacks, protein bars, smoothies, and healthy beverages. Fuel your workout!'
      },
      {
        name: 'Tech Gadgets Express',
        location: 'Computer Science Building - 2nd Floor',
        description: 'Phone chargers, headphones, USB cables, and other tech accessories. Never run out of power!'
      }
    ];

    for (const machine of machines) {
      console.log(`🤖 Adding machine: ${machine.name}`);
      
      await prisma.$executeRaw`
        INSERT INTO "VendingMachine" ("id", "name", "location", "description", "isActive", "ownerId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${machine.name}, ${machine.location}, ${machine.description}, true, ${adminUser.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      console.log(`✅ Added: ${machine.name}`);
    }

    // Get final count
    const machineCount = await prisma.vendingMachine.count();

    console.log('\n🎉 Sample vending machines added successfully!');
    console.log('📊 Summary:');
    console.log(`   🤖 Vending Machines: ${machineCount}`);
    console.log('\n🚀 Your vending machine app now has sample data!');

  } catch (error) {
    console.error('❌ Error adding machines:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMachinesWithSQL(); 