const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleData() {
  try {
    console.log('🚀 Adding sample data to vending machines...');

    // Get all existing machines
    const machines = await prisma.vendingMachine.findMany();
    console.log(`✅ Found ${machines.length} machines`);

    for (const machine of machines) {
      console.log(`\n📦 Adding data to: ${machine.name}`);

      // Add payment methods based on machine type
      if (machine.name.includes('Coffee')) {
        // Coffee machine - accepts all payment methods
        await addPaymentMethods(machine.id, [
          { type: 'COIN', available: true },
          { type: 'BANKNOTE', available: true },
          { type: 'GIROCARD', available: true },
          { type: 'CREDIT_CARD', available: true }
        ]);
      } else if (machine.name.includes('Healthy')) {
        // Healthy machine - modern payment methods
        await addPaymentMethods(machine.id, [
          { type: 'BANKNOTE', available: true },
          { type: 'GIROCARD', available: true },
          { type: 'CREDIT_CARD', available: true }
        ]);
      } else if (machine.name.includes('Tech')) {
        // Tech machine - card payments only
        await addPaymentMethods(machine.id, [
          { type: 'GIROCARD', available: true },
          { type: 'CREDIT_CARD', available: true }
        ]);
      }

      // Add products based on machine type
      if (machine.name.includes('Coffee')) {
        await addCoffeeProducts(machine.id);
      } else if (machine.name.includes('Healthy')) {
        await addHealthyProducts(machine.id);
      } else if (machine.name.includes('Tech')) {
        await addTechProducts(machine.id);
      }

      // Add some sample reviews
      await addSampleReviews(machine.id);
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log('📊 Summary:');
    console.log(`   🤖 Vending Machines: ${machines.length}`);
    console.log('   💳 Payment methods added');
    console.log('   📦 Products added');
    console.log('   ⭐ Reviews added');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function addPaymentMethods(machineId, paymentTypes) {
  for (const payment of paymentTypes) {
    await prisma.paymentMethod.create({
      data: {
        type: payment.type,
        available: payment.available,
        vendingMachineId: machineId
      }
    });
  }
  console.log(`   💳 Added ${paymentTypes.length} payment methods`);
}

async function addCoffeeProducts(machineId) {
  const products = [
    { name: 'Espresso', description: 'Strong Italian coffee', price: 1.50, slotCode: 'A1' },
    { name: 'Cappuccino', description: 'Coffee with steamed milk', price: 2.20, slotCode: 'A2' },
    { name: 'Latte Macchiato', description: 'Milk with coffee', price: 2.50, slotCode: 'A3' },
    { name: 'Hot Chocolate', description: 'Rich chocolate drink', price: 2.00, slotCode: 'B1' },
    { name: 'Tea (Black)', description: 'Classic black tea', price: 1.20, slotCode: 'B2' },
    { name: 'Tea (Green)', description: 'Refreshing green tea', price: 1.30, slotCode: 'B3' },
    { name: 'Croissant', description: 'Buttery French pastry', price: 2.80, slotCode: 'C1' },
    { name: 'Chocolate Bar', description: 'Dark chocolate 70%', price: 1.50, slotCode: 'C2' },
    { name: 'Chips (Salt)', description: 'Classic salted chips', price: 1.80, slotCode: 'C3' },
    { name: 'Chips (Paprika)', description: 'Spicy paprika chips', price: 1.80, slotCode: 'D1' },
    { name: 'Nuts Mix', description: 'Mixed nuts and dried fruits', price: 3.20, slotCode: 'D2' },
    { name: 'Energy Bar', description: 'High protein energy bar', price: 2.50, slotCode: 'D3' }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        vendingMachineId: machineId,
        isAvailable: true
      }
    });
  }
  console.log(`   ☕ Added ${products.length} coffee/snack products`);
}

async function addHealthyProducts(machineId) {
  const products = [
    { name: 'Protein Shake', description: 'Vanilla protein shake', price: 4.50, slotCode: 'A1' },
    { name: 'Smoothie Bowl', description: 'Acai berry smoothie', price: 5.20, slotCode: 'A2' },
    { name: 'Protein Bar', description: 'Chocolate protein bar', price: 3.80, slotCode: 'A3' },
    { name: 'Energy Gel', description: 'Quick energy boost', price: 2.50, slotCode: 'B1' },
    { name: 'BCAA Drink', description: 'Amino acid supplement', price: 3.20, slotCode: 'B2' },
    { name: 'Vitamin Water', description: 'Electrolyte drink', price: 2.80, slotCode: 'B3' },
    { name: 'Almonds', description: 'Raw almonds 100g', price: 4.20, slotCode: 'C1' },
    { name: 'Cashews', description: 'Roasted cashews 100g', price: 4.50, slotCode: 'C2' },
    { name: 'Dried Mango', description: 'Sweet dried mango', price: 3.80, slotCode: 'C3' },
    { name: 'Quinoa Bowl', description: 'Ready-to-eat quinoa', price: 6.50, slotCode: 'D1' },
    { name: 'Greek Yogurt', description: 'High protein yogurt', price: 3.20, slotCode: 'D2' },
    { name: 'Avocado Toast', description: 'Fresh avocado on toast', price: 5.80, slotCode: 'D3' }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        vendingMachineId: machineId,
        isAvailable: true
      }
    });
  }
  console.log(`   🥗 Added ${products.length} healthy products`);
}

async function addTechProducts(machineId) {
  const products = [
    { name: 'USB-C Cable', description: 'Fast charging cable', price: 8.50, slotCode: 'A1' },
    { name: 'Lightning Cable', description: 'iPhone charging cable', price: 9.20, slotCode: 'A2' },
    { name: 'Micro USB Cable', description: 'Android charging cable', price: 7.80, slotCode: 'A3' },
    { name: 'Wireless Earbuds', description: 'Bluetooth earbuds', price: 25.00, slotCode: 'B1' },
    { name: 'Phone Stand', description: 'Adjustable phone holder', price: 12.50, slotCode: 'B2' },
    { name: 'Screen Protector', description: 'Tempered glass protector', price: 6.80, slotCode: 'B3' },
    { name: 'Power Bank 5000mAh', description: 'Portable charger', price: 18.50, slotCode: 'C1' },
    { name: 'Power Bank 10000mAh', description: 'Large portable charger', price: 28.00, slotCode: 'C2' },
    { name: 'Car Charger', description: 'Fast car charging adapter', price: 15.20, slotCode: 'C3' },
    { name: 'Laptop Charger', description: 'Universal laptop adapter', price: 35.00, slotCode: 'D1' },
    { name: 'HDMI Cable', description: 'High-speed HDMI cable', price: 8.90, slotCode: 'D2' },
    { name: 'USB Hub', description: '4-port USB hub', price: 12.80, slotCode: 'D3' }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        vendingMachineId: machineId,
        isAvailable: true
      }
    });
  }
  console.log(`   📱 Added ${products.length} tech products`);
}

async function addSampleReviews(machineId) {
  // Get the admin user for reviews
  const adminUser = await prisma.user.findUnique({
    where: { email: 't.kikala@gmail.com' }
  });

  if (!adminUser) {
    console.log('   ⚠️ Admin user not found, skipping reviews');
    return;
  }

  const reviews = [
    { rating: 5, comment: 'Great selection and fast service!' },
    { rating: 4, comment: 'Convenient location, good prices.' },
    { rating: 5, comment: 'Always well-stocked and clean.' },
    { rating: 3, comment: 'Good but could use more variety.' },
    { rating: 4, comment: 'Perfect for quick snacks!' }
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: {
        ...review,
        userId: adminUser.id,
        vendingMachineId: machineId,
        isApproved: true
      }
    });
  }
  console.log(`   ⭐ Added ${reviews.length} sample reviews`);
}

// Run the script
addSampleData(); 