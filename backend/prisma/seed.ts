import { PrismaClient, PaymentType } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create a user (owner)
  const user = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      password: 'password123', // In production, hash passwords!
      name: 'Vending Owner',
    },
  });

  // Create a vending machine
  const machine = await prisma.vendingMachine.create({
    data: {
      name: 'Central Park Vending',
      location: 'Central Park, NYC',
      ownerId: user.id,
      products: {
        create: [
          { name: 'Coca-Cola', description: 'Refreshing soda', photo: '', },
          { name: 'Snickers', description: 'Chocolate bar', photo: '', },
          { name: 'Water Bottle', description: '500ml spring water', photo: '', },
        ],
      },
      paymentMethods: {
        create: [
          { type: PaymentType.COIN, available: true },
          { type: PaymentType.BANKNOTE, available: false },
          { type: PaymentType.CREDIT_CARD, available: true },
        ],
      },
      photos: {
        create: [
          { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
        ],
      },
      reviews: {
        create: [
          { rating: 5, comment: 'Great selection!', userId: user.id },
        ],
      },
    },
    include: { products: true, paymentMethods: true, photos: true, reviews: true },
  });

  console.log('Seeded user:', user);
  console.log('Seeded vending machine:', machine);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 