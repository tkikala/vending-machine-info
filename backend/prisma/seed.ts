import { PrismaClient, PaymentType } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create or update a user (owner)
  const user = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      password: 'password123',
      name: 'Vending Owner',
    },
  });

  // Delete existing machine if it exists and create a new one
  await prisma.vendingMachine.deleteMany({
    where: { name: 'Central Park Vending' },
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
          { url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c' },
          { url: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3' },
          { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
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