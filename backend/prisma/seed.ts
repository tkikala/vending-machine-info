import { PrismaClient, PaymentType, UserRole } from '../generated/prisma';
import { hashPassword } from '../src/auth';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hashPassword('admin123'); // Change this in production!
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vendingmachine.com' },
    update: {},
    create: {
      email: 'admin@vendingmachine.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  // Create or update existing users with roles
  const user = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {
      role: UserRole.OWNER,
      password: await hashPassword('password123'),
    },
    create: {
      email: 'owner@example.com',
      password: await hashPassword('password123'),
      name: 'Vending Owner',
      role: UserRole.OWNER,
    },
  });

  // Create another owner
  const user2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {
      role: UserRole.OWNER,
      password: await hashPassword('password456'),
    },
    create: {
      email: 'owner2@example.com',
      password: await hashPassword('password456'),
      name: 'SnackMaster Inc',
      role: UserRole.OWNER,
    },
  });

  // Delete existing machines if they exist
  await prisma.vendingMachine.deleteMany({});

  // Create Central Park Vending Machine
  const machine1 = await prisma.vendingMachine.create({
    data: {
      name: 'Central Park Vending',
      location: 'Central Park, NYC',
      description: 'Premium vending machine with a wide selection of snacks and beverages',
      ownerId: user.id,
      products: {
        create: [
          { name: 'Coca-Cola', description: 'Refreshing soda', photo: '', price: 1.50, slotCode: 'A1' },
          { name: 'Snickers', description: 'Chocolate bar', photo: '', price: 1.25, slotCode: 'A2' },
          { name: 'Water Bottle', description: '500ml spring water', photo: '', price: 1.00, slotCode: 'A3' },
          { name: 'Lay\'s Chips', description: 'Classic potato chips', photo: '', price: 1.75, slotCode: 'B1' },
          { name: 'Kit-Kat', description: 'Crispy wafer bar', photo: '', price: 1.25, slotCode: 'B2' },
          { name: 'Diet Coke', description: 'Zero calorie cola', photo: '', price: 1.50, slotCode: 'B3' },
          { name: 'Sprite', description: 'Lemon-lime soda', photo: '', price: 1.50, slotCode: 'C1' },
          { name: 'Doritos', description: 'Nacho cheese chips', photo: '', price: 1.75, slotCode: 'C2' },
          { name: 'Twix', description: 'Caramel cookie bar', photo: '', price: 1.25, slotCode: 'C3' },
          { name: 'M&Ms', description: 'Colorful chocolate candies', photo: '', price: 1.25, slotCode: 'D1' },
          { name: 'Gatorade', description: 'Sports drink', photo: '', price: 2.00, slotCode: 'D2' },
          { name: 'Cheetos', description: 'Cheese puffs', photo: '', price: 1.75, slotCode: 'D3' },
          { name: 'Reese\'s', description: 'Peanut butter cups', photo: '', price: 1.25, slotCode: 'E1' },
          { name: 'Pepsi', description: 'Cola drink', photo: '', price: 1.50, slotCode: 'E2' },
          { name: 'Pretzels', description: 'Salted snack', photo: '', price: 1.50, slotCode: 'E3' },
          { name: 'Oreos', description: 'Chocolate sandwich cookies', photo: '', price: 1.75, slotCode: 'F1' },
          { name: 'Red Bull', description: 'Energy drink', photo: '', price: 2.50, slotCode: 'F2' },
          { name: 'Pringles', description: 'Stackable chips', photo: '', price: 2.00, slotCode: 'F3' },
          { name: 'Hershey\'s', description: 'Milk chocolate bar', photo: '', price: 1.25, slotCode: 'G1' },
          { name: 'Mountain Dew', description: 'Citrus soda', photo: '', price: 1.50, slotCode: 'G2' },
          { name: 'Trail Mix', description: 'Nuts and dried fruit', photo: '', price: 2.25, slotCode: 'G3' },
          { name: 'Dr Pepper', description: 'Unique flavored soda', photo: '', price: 1.50, slotCode: 'H1' },
          { name: 'Crackers', description: 'Cheese crackers', photo: '', price: 1.50, slotCode: 'H2' },
          { name: 'Vitamin Water', description: 'Enhanced water', photo: '', price: 1.75, slotCode: 'H3' },
          { name: 'Skittles', description: 'Fruity candies', photo: '', price: 1.25, slotCode: 'I1' },
          { name: 'Granola Bar', description: 'Healthy snack', photo: '', price: 1.75, slotCode: 'I2' },
          { name: 'Iced Tea', description: 'Sweet tea', photo: '', price: 1.50, slotCode: 'I3' },
          { name: 'Pop-Tarts', description: 'Toaster pastries', photo: '', price: 1.75, slotCode: 'J1' },
          { name: 'Beef Jerky', description: 'Protein snack', photo: '', price: 3.00, slotCode: 'J2' },
          { name: 'Orange Juice', description: 'Fresh squeezed', photo: '', price: 2.00, slotCode: 'J3' },
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
          { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', caption: 'Front view of the machine' },
          { url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c', caption: 'Product selection' },
          { url: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3', caption: 'Payment options' },
        ],
      },
      reviews: {
        create: [
          { rating: 5, comment: 'Great selection and always stocked!', userId: user.id, isApproved: true },
          { rating: 4, comment: 'Good prices, convenient location', userId: user2.id, isApproved: true },
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
      description: 'Quick snacks for busy tourists and locals',
      ownerId: user2.id,
      products: {
        create: [
          { name: 'Red Bull', description: 'Energy drink', photo: '', price: 2.50, slotCode: 'A1' },
          { name: 'Doritos', description: 'Nacho cheese chips', photo: '', price: 1.75, slotCode: 'A2' },
          { name: 'Pepsi', description: 'Cola drink', photo: '', price: 1.50, slotCode: 'A3' },
          { name: 'Twix', description: 'Caramel cookie bar', photo: '', price: 1.25, slotCode: 'B1' },
          { name: 'Gatorade', description: 'Sports drink', photo: '', price: 2.00, slotCode: 'B2' },
          { name: 'Pringles', description: 'Stackable chips', photo: '', price: 2.00, slotCode: 'B3' },
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
          { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', caption: 'Machine in Times Square' },
          { url: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3', caption: 'Product display' },
        ],
      },
      reviews: {
        create: [
          { rating: 5, comment: 'Perfect for tourists, accepts everything!', userId: user.id, isApproved: true },
          { rating: 3, comment: 'A bit pricey but convenient', userId: user2.id, isApproved: true },
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
      description: 'Healthy options for the modern workspace',
      ownerId: user.id,
      products: {
        create: [
          { name: 'Coffee', description: 'Hot coffee', photo: '', price: 2.50, slotCode: 'A1' },
          { name: 'Granola Bar', description: 'Healthy snack', photo: '', price: 1.75, slotCode: 'A2' },
          { name: 'Sparkling Water', description: 'LaCroix sparkling water', photo: '', price: 1.25, slotCode: 'A3' },
          { name: 'Trail Mix', description: 'Nuts and dried fruit', photo: '', price: 2.25, slotCode: 'B1' },
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
          { url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c', caption: 'Office vending machine' },
        ],
      },
      reviews: {
        create: [
          { rating: 4, comment: 'Great healthy options for office workers', userId: user2.id, isApproved: true },
        ],
      },
    },
    include: { products: true, paymentMethods: true, photos: true, reviews: true },
  });

  console.log('Seeded admin:', admin);
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