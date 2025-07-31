import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      console.log('Setting up database...');

      // Create tables by running a simple query that will trigger schema creation
      await prisma.$executeRaw`SELECT 1`;

      // Check if admin user already exists
      const existingAdmin = await prisma.user.findUnique({
        where: { email: 't.kikala@gmail.com' }
      });

      if (!existingAdmin) {
        console.log('Creating admin user...');
        
        // Hash password
        const adminPassword = await bcrypt.hash('gCJ4Dxr55dGYmhM', 12);
        
        // Create admin user
        const admin = await prisma.user.create({
          data: {
            email: 't.kikala@gmail.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
            isActive: true,
          },
        });

        console.log('Admin user created:', admin.email);
      } else {
        console.log('Admin user already exists');
      }

      return res.status(200).json({ 
        message: 'Database setup completed successfully!',
        adminEmail: 't.kikala@gmail.com',
        adminPassword: 'gCJ4Dxr55dGYmhM'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Setup Error:', error);
    return res.status(500).json({ 
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
} 