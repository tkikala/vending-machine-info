import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../prisma';

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
      console.log('Request body keys:', Object.keys(req.body || {}));
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Content-Length:', req.headers['content-length']);
      
      // Check if we have file data
      if (!req.body) {
        console.log('❌ No request body');
        return res.status(400).json({ error: 'No request body provided' });
      }

      const { file, filename, contentType } = req.body;
      
      console.log('File data received:', {
        hasFile: !!file,
        fileLength: file ? file.length : 0,
        filename,
        contentType
      });
      
      if (!file || !filename) {
        console.log('❌ Missing file data or filename');
        return res.status(400).json({ 
          error: 'File data and filename are required',
          received: {
            hasFile: !!file,
            hasFilename: !!filename,
            bodyKeys: Object.keys(req.body)
          }
        });
      }

      // Validate that file is a valid base64 string
      if (typeof file !== 'string' || !file.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
        console.log('❌ Invalid base64 data');
        return res.status(400).json({ 
          error: 'Invalid file data format. Expected base64 string.',
          receivedType: typeof file
        });
      }

      // Validate file size (max 10MB)
      const fileSizeInBytes = Math.ceil((file.length * 3) / 4);
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      
      if (fileSizeInBytes > maxSizeInBytes) {
        console.log('❌ File too large:', fileSizeInBytes, 'bytes');
        return res.status(400).json({ 
          error: 'File too large. Maximum size is 10MB',
          receivedSize: fileSizeInBytes,
          maxSize: maxSizeInBytes
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueFilename = `logo_${timestamp}.${extension}`;

      try {
        // Store file data in database as base64
        const fileRecord = await prisma.file.create({
          data: {
            filename: uniqueFilename,
            originalName: filename,
            contentType: contentType || 'application/octet-stream',
            fileSize: fileSizeInBytes,
            fileData: file, // Store base64 data directly
            fileType: 'logo'
          }
        });

        // Return the file URL (this will be served by the file serving endpoint)
        const fileUrl = `/api/files/${fileRecord.id}`;
        
        console.log(`✅ File uploaded and stored in database: ${uniqueFilename} (${fileSizeInBytes} bytes)`);
        return res.status(200).json({
          message: 'File uploaded successfully',
          file: {
            id: fileRecord.id,
            filename: uniqueFilename,
            originalName: filename,
            url: fileUrl,
            size: fileSizeInBytes,
            contentType: contentType || 'application/octet-stream'
          }
        });
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          error: 'Failed to save file to database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        });
      }
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