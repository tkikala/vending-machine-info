const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function migratePaymentMethods() {
  try {
    console.log('Migrating payment methods...');

    // Get all payment method types
    const paymentMethodTypes = await prisma.paymentMethodType.findMany();
    console.log('Found payment method types:', paymentMethodTypes.map(pm => pm.type));

    // Get all vending machines
    const machines = await prisma.vendingMachine.findMany();
    console.log(`Found ${machines.length} machines to migrate`);

    for (const machine of machines) {
      console.log(`Migrating machine: ${machine.name}`);
      
      // Create payment methods for this machine
      for (const pmType of paymentMethodTypes) {
        // Set default availability based on type
        let available = false;
        if (pmType.type === 'BANKNOTE' || pmType.type === 'GIROCARD') {
          available = true; // Default to available for banknotes and girocard
        }

        await prisma.machinePaymentMethod.upsert({
          where: {
            vendingMachineId_paymentMethodTypeId: {
              vendingMachineId: machine.id,
              paymentMethodTypeId: pmType.id
            }
          },
          update: {
            available: available
          },
          create: {
            vendingMachineId: machine.id,
            paymentMethodTypeId: pmType.id,
            available: available
          }
        });
      }
    }

    console.log('Payment methods migration completed successfully!');
  } catch (error) {
    console.error('Error migrating payment methods:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migratePaymentMethods(); 