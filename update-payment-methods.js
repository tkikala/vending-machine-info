import { PrismaClient } from './api/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

async function updatePaymentMethods() {
  try {
    // Update Credit Card to Creditcard
    const updatedCreditCard = await prisma.paymentMethodType.update({
      where: {
        type: 'CREDIT_CARD'
      },
      data: {
        name: 'Creditcard'
      }
    });

    console.log('✅ Credit Card updated to Creditcard:', updatedCreditCard);

    // Get all payment methods to verify order
    const allPaymentMethods = await prisma.paymentMethodType.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log('📋 Current payment methods order:', allPaymentMethods.map(pm => pm.name));

  } catch (error) {
    console.error('❌ Error updating payment methods:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePaymentMethods(); 