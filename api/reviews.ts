import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      console.log('Creating new review...');
      
      try {
        const { vendingMachineId, rating, comment } = req.body;
        
        if (!vendingMachineId) {
          return res.status(400).json({ error: 'Vending machine ID is required' });
        }
        
        if (!rating || rating < 1 || rating > 5) {
          return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        if (!comment || !comment.trim()) {
          return res.status(400).json({ error: 'Comment is required' });
        }

        // Get user from session (simplified for now)
        const adminUser = await prisma.user.findFirst({
          where: { role: 'ADMIN', isActive: true }
        });

        if (!adminUser) {
          return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if vending machine exists
        const machine = await prisma.vendingMachine.findUnique({
          where: { id: vendingMachineId }
        });

        if (!machine) {
          return res.status(404).json({ error: 'Vending machine not found' });
        }

        // Create review
        const review = await prisma.review.create({
          data: {
            rating,
            comment: comment.trim(),
            userId: adminUser.id,
            vendingMachineId,
            isApproved: true // Auto-approve for now
          },
          include: {
            user: { select: { id: true, name: true } }
          }
        });

        console.log('✅ Created review for machine:', machine.name);
        return res.status(201).json(review);
        
      } catch (dbError: any) {
        console.error('❌ Database error during creation:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          details: dbError.message
        });
      }
    }

    if (req.method === 'GET') {
      console.log('Fetching reviews...');
      
      try {
        const { machineId } = req.query;
        
        if (!machineId || typeof machineId !== 'string') {
          return res.status(400).json({ error: 'Machine ID is required' });
        }

        const reviews = await prisma.review.findMany({
          where: { 
            vendingMachineId: machineId,
            isApproved: true
          },
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        console.log(`✅ Found ${reviews.length} reviews for machine: ${machineId}`);
        return res.status(200).json(reviews);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          details: dbError.message
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Reviews Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 