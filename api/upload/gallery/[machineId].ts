import { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import prisma from '../../prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔍 Gallery upload endpoint called');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { machineId } = req.query;
      
      if (!machineId || typeof machineId !== 'string') {
        return res.status(400).json({ error: 'Machine ID is required' });
      }

      console.log('Uploading gallery file for machine:', machineId);
      
      // Parse FormData
      const form = formidable({
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
        keepExtensions: true,
        uploadDir: '/tmp'
      });

      const [fields, files] = await form.parse(req);
      
      console.log('Form fields:', fields);
      console.log('Form files:', Object.keys(files));
      
      const file = files.file?.[0];
      const caption = fields.caption?.[0] || '';
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('File received:', {
        originalName: file.originalFilename,
        size: file.size,
        mimetype: file.mimetype,
        tempPath: file.filepath
      });

      try {
        // Read the uploaded file
        const buffer = await fs.readFile(file.filepath);
        
        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.originalFilename?.split('.').pop()?.toLowerCase() || 'jpg';
        const uniqueFilename = `gallery_${machineId}_${timestamp}.${extension}`;

        // Upload to Vercel Blob Storage
        const blob = await put(uniqueFilename, buffer, {
          access: 'public',
          contentType: file.mimetype || 'image/jpeg'
        });

        // Determine file type
        const fileType = file.mimetype?.startsWith('video/') ? 'video' : 'image';

        // Save to database
        const photo = await prisma.photo.create({
          data: {
            url: blob.url,
            caption: caption,
            fileType: fileType,
            originalName: file.originalFilename || 'unknown',
            fileSize: buffer.length,
            vendingMachineId: machineId
          }
        });

        // Clean up temp file
        await fs.unlink(file.filepath);

        const uploadedFile = {
          id: photo.id,
          filename: uniqueFilename,
          originalName: file.originalFilename,
          url: blob.url,
          caption: photo.caption,
          fileType: photo.fileType,
          size: buffer.length
        };

        console.log(`✅ Uploaded gallery file: ${uniqueFilename}`);
        
        return res.status(200).json({
          message: 'Gallery file uploaded successfully',
          photos: [uploadedFile]
        });
      } catch (uploadError) {
        console.error('❌ Upload error:', uploadError);
        // Clean up temp file on error
        try {
          await fs.unlink(file.filepath);
        } catch (cleanupError) {
          console.error('Failed to cleanup temp file:', cleanupError);
        }
        return res.status(500).json({
          error: 'Failed to upload gallery file',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Gallery Upload Error:', error);
    return res.status(500).json({
      error: 'Failed to upload gallery file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 