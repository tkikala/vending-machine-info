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

  // Create another owner
  const user2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {},
    create: {
      email: 'owner2@example.com',
      password: 'password456',
      name: 'SnackMaster Inc',
    },
  });

  // Delete existing machines if they exist
  await prisma.vendingMachine.deleteMany({});

  // Create Central Park Vending Machine
  const machine1 = await prisma.vendingMachine.create({
    data: {
      name: 'Central Park Vending',
      location: 'Central Park, NYC',
      ownerId: user.id,
      products: {
        create: [
          { name: 'Coca-Cola', description: 'Refreshing soda', photo: '', },
          { name: 'Snickers', description: 'Chocolate bar', photo: '', },
          { name: 'Water Bottle', description: '500ml spring water', photo: '', },
          { name: 'Lay\'s Chips', description: 'Classic potato chips', photo: '', },
          { name: 'Kit-Kat', description: 'Crispy wafer bar', photo: '', },
          { name: 'Diet Coke', description: 'Zero calorie cola', photo: '', },
          { name: 'Sprite', description: 'Lemon-lime soda', photo: '', },
          { name: 'Doritos', description: 'Nacho cheese chips', photo: '', },
          { name: 'Twix', description: 'Caramel cookie bar', photo: '', },
          { name: 'M&Ms', description: 'Colorful chocolate candies', photo: '', },
          { name: 'Gatorade', description: 'Sports drink', photo: '', },
          { name: 'Cheetos', description: 'Cheese puffs', photo: '', },
          { name: 'Reese\'s', description: 'Peanut butter cups', photo: '', },
          { name: 'Pepsi', description: 'Cola drink', photo: '', },
          { name: 'Pretzels', description: 'Salted snack', photo: '', },
          { name: 'Oreos', description: 'Chocolate sandwich cookies', photo: '', },
          { name: 'Red Bull', description: 'Energy drink', photo: '', },
          { name: 'Pringles', description: 'Stackable chips', photo: '', },
          { name: 'Hershey\'s', description: 'Milk chocolate bar', photo: '', },
          { name: 'Mountain Dew', description: 'Citrus soda', photo: '', },
          { name: 'Trail Mix', description: 'Nuts and dried fruit', photo: '', },
          { name: 'Dr Pepper', description: 'Unique flavored soda', photo: '', },
          { name: 'Crackers', description: 'Cheese crackers', photo: '', },
          { name: 'Vitamin Water', description: 'Enhanced water', photo: '', },
          { name: 'Skittles', description: 'Fruity candies', photo: '', },
          { name: 'Granola Bar', description: 'Healthy snack', photo: '', },
          { name: 'Iced Tea', description: 'Sweet tea', photo: '', },
          { name: 'Pop-Tarts', description: 'Toaster pastries', photo: '', },
          { name: 'Beef Jerky', description: 'Protein snack', photo: '', },
          { name: 'Orange Juice', description: 'Fresh squeezed', photo: '', },
        ],
      },
      paymentMethods: {
        create: [
          { type: PaymentType.COIN, available: true },
          { type: PaymentType.BANKNOTE, available: false },
          { type: PaymentType.GIROCARD, available: true },
          { type: PaymentType.CREDIT_CARD, available: true },
        ],
      },
      photos: {
        create: [
          { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
          { url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c' },
          { url: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3' },
        ],
      },
      reviews: {
        create: [
          { rating: 5, comment: 'Great selection and always stocked!', userId: user.id },
          { rating: 4, comment: 'Good prices, convenient location', userId: user2.id },
        ],
      },
    },
    include: { products: true, paymentMethods: true, photos: true, reviews: true },
  });

  // Create Times Square Vending Machine
  const machine2 = await prisma.vendingMachine.create({
    data: {
      name: 'Times Square Express',
      location: 'Times Square, NYC',
      ownerId: user2.id,
      products: {
        create: [
          { name: 'Red Bull', description: 'Energy drink', photo: '', },
          { name: 'Doritos', description: 'Nacho cheese chips', photo: '', },
          { name: 'Pepsi', description: 'Cola drink', photo: '', },
          { name: 'Twix', description: 'Caramel cookie bar', photo: '', },
          { name: 'Gatorade', description: 'Sports drink', photo: '', },
          { name: 'Pringles', description: 'Stackable chips', photo: '', },
        ],
      },
      paymentMethods: {
        create: [
          { type: PaymentType.COIN, available: true },
          { type: PaymentType.BANKNOTE, available: true },
          { type: PaymentType.GIROCARD, available: true },
          { type: PaymentType.CREDIT_CARD, available: true },
        ],
      },
      photos: {
        create: [
          { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
          { url: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3' },
        ],
      },
      reviews: {
        create: [
          { rating: 5, comment: 'Perfect for tourists, accepts everything!', userId: user.id },
          { rating: 3, comment: 'A bit pricey but convenient', userId: user2.id },
        ],
      },
    },
    include: { products: true, paymentMethods: true, photos: true, reviews: true },
  });

  // Create Brooklyn Office Vending Machine
  const machine3 = await prisma.vendingMachine.create({
    data: {
      name: 'Brooklyn Tech Hub',
      location: 'DUMBO, Brooklyn',
      ownerId: user.id,
      products: {
        create: [
          { name: 'Coffee', description: 'Hot coffee', photo: '', },
          { name: 'Granola Bar', description: 'Healthy snack', photo: '', },
          { name: 'Sparkling Water', description: 'LaCroix sparkling water', photo: '', },
          { name: 'Trail Mix', description: 'Nuts and dried fruit', photo: '', },
        ],
      },
      paymentMethods: {
        create: [
          { type: PaymentType.COIN, available: false },
          { type: PaymentType.BANKNOTE, available: false },
          { type: PaymentType.GIROCARD, available: true },
          { type: PaymentType.CREDIT_CARD, available: true },
        ],
      },
      photos: {
        create: [
          { url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c' },
        ],
      },
      reviews: {
        create: [
          { rating: 4, comment: 'Great healthy options for office workers', userId: user2.id },
        ],
      },
    },
    include: { products: true, paymentMethods: true, photos: true, reviews: true },
  });

  console.log('Seeded user:', user);
  console.log('Seeded user2:', user2);
  console.log('Seeded vending machine 1:', machine1);
  console.log('Seeded vending machine 2:', machine2);
  console.log('Seeded vending machine 3:', machine3);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 