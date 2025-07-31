const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    console.log('📋 Creating database tables...');
    
    // Create User table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'OWNER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ User table created');

    // Create unique index on email
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `;
    console.log('✅ Email index created');

    // Create Session table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ Session table created');

    // Create VendingMachine table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VendingMachine" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "ownerId" TEXT NOT NULL,
        "logoUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "VendingMachine_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ VendingMachine table created');

    // Create Product table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" DECIMAL(10,2) NOT NULL,
        "isAvailable" BOOLEAN NOT NULL DEFAULT true,
        "vendingMachineId" TEXT NOT NULL,
        "slotCode" TEXT,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ Product table created');

    // Create PaymentMethod table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PaymentMethod" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "isAvailable" BOOLEAN NOT NULL DEFAULT true,
        "vendingMachineId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ PaymentMethod table created');

    // Create Photo table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Photo" (
        "id" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "caption" TEXT,
        "vendingMachineId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ Photo table created');

    // Create Review table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT NOT NULL,
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "authorName" TEXT NOT NULL,
        "isApproved" BOOLEAN NOT NULL DEFAULT false,
        "vendingMachineId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ Review table created');

    // Add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `;
    } catch (e) {
      console.log('⚠️ Session foreign key already exists');
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "VendingMachine" ADD CONSTRAINT "VendingMachine_ownerId_fkey" 
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `;
    } catch (e) {
      console.log('⚠️ VendingMachine foreign key already exists');
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "Product" ADD CONSTRAINT "Product_vendingMachineId_fkey" 
        FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `;
    } catch (e) {
      console.log('⚠️ Product foreign key already exists');
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_vendingMachineId_fkey" 
        FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `;
    } catch (e) {
      console.log('⚠️ PaymentMethod foreign key already exists');
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "Photo" ADD CONSTRAINT "Photo_vendingMachineId_fkey" 
        FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `;
    } catch (e) {
      console.log('⚠️ Photo foreign key already exists');
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "Review" ADD CONSTRAINT "Review_vendingMachineId_fkey" 
        FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `;
    } catch (e) {
      console.log('⚠️ Review foreign key already exists');
    }

    console.log('✅ Foreign key constraints added');

    // Create admin user
    console.log('👤 Creating admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 't.kikala@gmail.com' }
    });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists, updating...');
      const hashedPassword = await bcrypt.hash('gCJ4Dxr55dGYmhM', 12);
      await prisma.user.update({
        where: { email: 't.kikala@gmail.com' },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });
    } else {
      console.log('➕ Creating new admin user...');
      const hashedPassword = await bcrypt.hash('gCJ4Dxr55dGYmhM', 12);
      await prisma.user.create({
        data: {
          email: 't.kikala@gmail.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true
        }
      });
    }

    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email: t.kikala@gmail.com');
    console.log('🔑 Password: gCJ4Dxr55dGYmhM');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('🚀 Your vending machine app should now work!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase(); 