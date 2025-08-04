import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;

    // Handle DELETE with path parameter (for frontend compatibility)
    if (req.method === 'DELETE' && req.url?.includes('/products/')) {
      const pathId = req.url.split('/products/')[1];
      if (pathId) {
        console.log('Deleting product (path param):', pathId);
        
        try {
          // Check if product exists
          const existingProduct = await prisma.product.findUnique({
            where: { id: pathId }
          });

          if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
          }

          // Check if product is used in any machines
          const machineProducts = await prisma.machineProduct.findMany({
            where: { productId: pathId }
          });

          if (machineProducts.length > 0) {
            return res.status(400).json({ 
              error: 'Cannot delete product that is used in vending machines',
              machineCount: machineProducts.length
            });
          }

          // Delete product
          await prisma.product.delete({
            where: { id: pathId }
          });

          console.log('✅ Deleted product:', existingProduct.name);
          return res.status(200).json({ message: 'Product deleted successfully' });
          
        } catch (dbError: any) {
          console.error('❌ Database error during deletion:', dbError);
          return res.status(500).json({
            error: 'Database connection failed',
            details: dbError.message
          });
        }
      }
    }

    // Handle individual product operations (GET, PUT, DELETE)
    if (id && typeof id === 'string') {
      if (req.method === 'GET') {
        console.log('Fetching product:', id);
        
        try {
          const product = await prisma.product.findUnique({
            where: { id }
          });

          if (!product) {
            return res.status(404).json({ error: 'Product not found' });
          }

          console.log('✅ Found product:', product.name);
          return res.status(200).json(product);
          
        } catch (dbError: any) {
          console.error('❌ Database error:', dbError);
          return res.status(500).json({
            error: 'Database connection failed',
            details: dbError.message
          });
        }
      }

      if (req.method === 'PUT') {
        console.log('Updating product:', id);
        
        try {
          const { name, description, photo, price } = req.body;
          
          if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Product name is required' });
          }

          // Check if product exists
          const existingProduct = await prisma.product.findUnique({
            where: { id }
          });

          if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
          }

          // Check if name is already taken by another product
          const nameConflict = await prisma.product.findFirst({
            where: {
              name: {
                equals: name.trim()
              },
              id: {
                not: id
              }
            }
          });

          if (nameConflict) {
            return res.status(409).json({ error: 'Product name already exists' });
          }

          // Update product
          const product = await prisma.product.update({
            where: { id },
            data: {
              name: name.trim(),
              description: description?.trim() || null,
              photo: photo || null,
              price: price ? parseFloat(price) : null
            }
          });

          console.log('✅ Updated product:', product.name);
          return res.status(200).json(product);
          
        } catch (dbError: any) {
          console.error('❌ Database error during update:', dbError);
          return res.status(500).json({
            error: 'Database connection failed',
            details: dbError.message
          });
        }
      }

      if (req.method === 'DELETE') {
        console.log('Deleting product:', id);
        
        try {
          // Check if product exists
          const existingProduct = await prisma.product.findUnique({
            where: { id }
          });

          if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
          }

          // Check if product is used in any machines
          const machineProducts = await prisma.machineProduct.findMany({
            where: { productId: id }
          });

          if (machineProducts.length > 0) {
            return res.status(400).json({ 
              error: 'Cannot delete product that is used in vending machines',
              machineCount: machineProducts.length
            });
          }

          // Delete product
          await prisma.product.delete({
            where: { id }
          });

          console.log('✅ Deleted product:', existingProduct.name);
          return res.status(200).json({ message: 'Product deleted successfully' });
          
        } catch (dbError: any) {
          console.error('❌ Database error during deletion:', dbError);
          return res.status(500).json({
            error: 'Database connection failed',
            details: dbError.message
          });
        }
      }
    }

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