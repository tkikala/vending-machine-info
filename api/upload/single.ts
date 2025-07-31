import { VercelRequest, VercelResponse } from '@vercel/node';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔍 Single file upload endpoint called');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      console.log('Uploading single file...');
      
      // Check if we have file data
      if (!req.body || !req.body.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { file, filename, contentType } = req.body;
      
      if (!file || !filename) {
        return res.status(400).json({ error: 'File data and filename are required' });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'uploads', 'logos');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = filename.split('.').pop();
      const uniqueFilename = `logo_${timestamp}.${extension}`;
      const filePath = join(uploadsDir, uniqueFilename);

      // Convert base64 to buffer and save
      const buffer = Buffer.from(file, 'base64');
      await writeFile(filePath, buffer);

      // Return the file URL
      const fileUrl = `/uploads/logos/${uniqueFilename}`;
      
      console.log(`✅ File uploaded: ${uniqueFilename}`);
      return res.status(200).json({
        message: 'File uploaded successfully',
        file: {
          filename: uniqueFilename,
          originalName: filename,
          url: fileUrl,
          size: buffer.length,
          contentType: contentType || 'application/octet-stream'
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Upload Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 