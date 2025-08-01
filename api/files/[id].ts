import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Find the file in the database
    const file = await prisma.file.findUnique({
      where: { id }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Length', file.fileSize);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);

    // Convert base64 to buffer and send
    const buffer = Buffer.from(file.fileData, 'base64');
    res.send(buffer);

  } catch (error) {
    console.error('❌ File serving error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 