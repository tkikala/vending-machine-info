import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔍 File serving endpoint called');
  
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      console.log('❌ Invalid file ID:', id);
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    console.log('🔍 Looking for file with ID:', id);

    // Find file in database
    const fileRecord = await prisma.file.findUnique({
      where: { id }
    });

    if (!fileRecord) {
      console.log('❌ File not found in database:', id);
      return res.status(404).json({ error: 'File not found' });
    }

    try {
      // Convert base64 to buffer
      const fileBuffer = Buffer.from(fileRecord.fileData, 'base64');
      
      // Set headers
      res.setHeader('Content-Type', fileRecord.contentType);
      res.setHeader('Content-Length', fileBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      console.log(`✅ Served file: ${fileRecord.filename} (${fileBuffer.length} bytes, ${fileRecord.contentType})`);
      return res.status(200).send(fileBuffer);
      
    } catch (bufferError) {
      console.error('❌ Buffer conversion error:', bufferError);
      return res.status(500).json({
        error: 'Failed to process file data',
        details: bufferError instanceof Error ? bufferError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('❌ File serving error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 