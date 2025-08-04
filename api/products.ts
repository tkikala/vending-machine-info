import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle list operations (GET) and creation (POST)
    if (req.method === 'GET') {
      console.log('Fetching all products...');
      
      try {
        const { search } = req.query;
        
        let products;
        
        if (search && typeof search === 'string') {
          products = await prisma.product.findMany({
            where: {
              name: {
                contains: search
              }
            },
            orderBy: {
              name: 'asc'
            },
            take: 10
          });
        } else {
          products = await prisma.product.findMany({
            orderBy: {
              name: 'asc'
            }
          });
        }

        console.log(`✅ Found ${products.length} products`);
        return res.status(200).json(products);
        
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          details: dbError.message
        });
      }
    }

    if (req.method === 'POST') {
      console.log('Creating new product...');
      
      try {
        const { name, description, photo, price } = req.body;
        
        if (!name || !name.trim()) {
          return res.status(400).json({ error: 'Product name is required' });
        }

        // Check if product already exists
        const existingProduct = await prisma.product.findFirst({
          where: {
            name: {
              equals: name.trim()
            }
          }
        });

        if (existingProduct) {
          return res.status(409).json({ 
            error: 'Product already exists',
            product: existingProduct
          });
        }

        // Create new product
        const product = await prisma.product.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            photo: photo || null,
            price: price ? parseFloat(price) : null,
            isAvailable: true
          }
        });

        console.log('✅ Created product:', product.name);
        return res.status(201).json(product);
        
      } catch (dbError: any) {
        console.error('❌ Database error during creation:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          details: dbError.message
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Products Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 