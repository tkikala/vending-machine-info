import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all machines (public view)
      const machines = await prisma.vendingMachine.findMany({
        where: { isActive: true },
        include: {
          products: {
            where: { isAvailable: true }
          },
          paymentMethods: true,
          photos: true,
          reviews: {
            where: { isApproved: true }
          },
          owner: {
            select: { id: true, name: true }
          }
        }
      });

      return res.status(200).json(machines);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    
    // Check if it's a database connection error - return empty array instead of crashing
    if (error instanceof Error && error.message.includes('P2021')) {
      console.log('Database not initialized, returning empty array');
      return res.status(200).json([]);
    }
    
    // For other errors, return empty array to prevent frontend crashes
    console.log('Database error, returning empty array');
    return res.status(200).json([]);
  }
} 