import { PrismaClient, UserRole } from '../generated/prisma';
import { hashPassword } from '../src/auth';

const prisma = new PrismaClient();

async function main() {
  // Delete all existing data
  console.log('Cleaning existing data...');
  await prisma.review.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.vendingMachine.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  // Create the single admin user
  console.log('Creating admin user...');
  const adminPassword = await hashPassword('gCJ4Dxr55dGYmhM');
  const admin = await prisma.user.create({
    data: {
      email: 't.kikala@gmail.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin user created:');
  console.log('  Email:', admin.email);
  console.log('  Name:', admin.name);
  console.log('  Role:', admin.role);
  console.log('  ID:', admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 