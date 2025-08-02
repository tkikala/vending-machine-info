const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function seedPaymentMethods() {
  try {
    console.log('Seeding payment methods...');

    // Create payment method types
    const paymentMethods = [
      {
        type: 'COIN',
        name: 'Coins',
        description: 'Cash coins',
        icon: '🪙'
      },
      {
        type: 'BANKNOTE',
        name: 'Banknotes',
        description: 'Cash banknotes',
        icon: '💵'
      },
      {
        type: 'GIROCARD',
        name: 'Girocard',
        description: 'German debit card',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiMwMDAwMDAiLz4KPHBhdGggZD0iTTE2IDEySDhWMTBIMTZWMTRIMFYxNkgxNlYxMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
      },
      {
        type: 'CREDIT_CARD',
        name: 'Creditcard',
        description: 'Credit card',
        icon: '💳'
      }
    ];

    for (const pm of paymentMethods) {
      await prisma.paymentMethodType.upsert({
        where: { type: pm.type },
        update: pm,
        create: pm
      });
    }

    console.log('Payment methods seeded successfully!');
  } catch (error) {
    console.error('Error seeding payment methods:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPaymentMethods(); 