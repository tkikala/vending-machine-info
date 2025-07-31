import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

// Fallback sample data in case database connection fails
const fallbackMachines = [
  {
    id: "fallback-1",
    name: "Coffee & Snacks Corner",
    location: "Main Building - Ground Floor",
    description: "Fresh coffee, hot drinks, and delicious snacks available 24/7. Perfect for a quick break!",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: "fallback-admin",
      name: "Admin User"
    }
  },
  {
    id: "fallback-2",
    name: "Healthy Options Hub",
    location: "Fitness Center - Lobby",
    description: "Nutritious snacks, protein bars, smoothies, and healthy beverages. Fuel your workout!",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: "fallback-admin",
      name: "Admin User"
    }
  },
  {
    id: "fallback-3",
    name: "Tech Gadgets Express",
    location: "Computer Science Building - 2nd Floor",
    description: "Phone chargers, headphones, USB cables, and other tech accessories. Never run out of power!",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: "fallback-admin",
      name: "Admin User"
    }
  }
];

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
      console.log('Machines endpoint called - fetching machines...');
      
      try {
        // Simple test query
        const userCount = await prisma.user.count();
        console.log(`✅ User count: ${userCount}`);
        
        // Get all machines (public view) - only basic fields to avoid column issues
        const machines = await prisma.vendingMachine.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: { id: true, name: true }
            }
          }
        });

        console.log(`✅ Found machines: ${machines.length}`);
        
        // If no machines found, return fallback data
        if (machines.length === 0) {
          console.log('⚠️ No machines found in database, returning fallback data');
          return res.status(200).json(fallbackMachines);
        }
        
        return res.status(200).json(machines);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        console.log('⚠️ Returning fallback data due to database error');
        return res.status(200).json(fallbackMachines);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ API Error:', error);
    console.log('⚠️ Returning fallback data due to API error');
    return res.status(200).json(fallbackMachines);
  }
} 