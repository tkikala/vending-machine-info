import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

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
      console.log('Starting database migration...');

      try {
        // Push the schema to create tables
        console.log('Pushing schema to database...');
        execSync('npx prisma db push', { 
          stdio: 'inherit',
          env: { ...process.env }
        });

        console.log('Schema pushed successfully!');

        // Generate Prisma client
        console.log('Generating Prisma client...');
        execSync('npx prisma generate', { 
          stdio: 'inherit',
          env: { ...process.env }
        });

        console.log('Prisma client generated successfully!');

        return res.status(200).json({ 
          message: 'Database migration completed successfully!',
          status: 'migrated',
          nextSteps: [
            '1. Tables have been created',
            '2. Prisma client has been generated',
            '3. You can now use the setup endpoint to create the admin user'
          ]
        });

      } catch (migrationError: any) {
        console.error('Migration failed:', migrationError);
        return res.status(500).json({ 
          error: 'Migration failed',
          details: migrationError.message,
          suggestion: 'Check your DATABASE_URL and database permissions'
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Migration Error:', error);
    return res.status(500).json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
} 