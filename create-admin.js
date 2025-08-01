const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 't.kikala@gmail.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('gCJ4Dxr55dGYmhM', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 't.kikala@gmail.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully:', adminUser.email);
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function main() {
  try {
    await createAdminUser();
    console.log('🎉 Admin user setup completed!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 