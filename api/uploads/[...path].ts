import { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔍 File serving endpoint called');
  
  try {
    const { path } = req.query;
    
    if (!path || !Array.isArray(path)) {
      console.log('❌ Invalid path:', path);
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Use relative path for Vercel serverless environment
    const filePath = join('.', 'uploads', ...path);
    
    // Security check: ensure the path is within uploads directory
    const normalizedPath = join('.', 'uploads');
    if (!filePath.startsWith(normalizedPath)) {
      console.log('❌ Access denied - path outside uploads directory:', filePath);
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('🔍 Looking for file:', filePath);

    // Check if file exists
    if (!existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    // Read and serve the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (['jpg', 'jpeg'].includes(extension || '')) {
      contentType = 'image/jpeg';
    } else if (extension === 'png') {
      contentType = 'image/png';
    } else if (extension === 'gif') {
      contentType = 'image/gif';
    } else if (extension === 'webp') {
      contentType = 'image/webp';
    } else if (extension === 'mp4') {
      contentType = 'video/mp4';
    } else if (extension === 'webm') {
      contentType = 'video/webm';
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    console.log(`✅ Served file: ${filePath} (${fileBuffer.length} bytes, ${contentType})`);
    return res.status(200).send(fileBuffer);
    
  } catch (error) {
    console.error('❌ File serving error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 