import { VercelRequest, VercelResponse } from '@vercel/node';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
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

      console.log('Uploading gallery files for machine:', machineId);
      
      // Check if we have files data
      if (!req.body || !req.body.files || !Array.isArray(req.body.files)) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const { files, captions = [] } = req.body;
      
      // Use relative path for Vercel serverless environment
      const uploadsDir = join('.', 'uploads', 'gallery', machineId);
      console.log('📁 Gallery upload directory:', uploadsDir);
      
      if (!existsSync(uploadsDir)) {
        console.log('📁 Creating gallery upload directory:', uploadsDir);
        await mkdir(uploadsDir, { recursive: true });
      }

      const uploadedFiles: any[] = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const caption = captions[i] || '';
        
        if (!fileData.file || !fileData.filename) {
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now() + i;
        const extension = fileData.filename.split('.').pop();
        const uniqueFilename = `gallery_${timestamp}.${extension}`;
        const filePath = join(uploadsDir, uniqueFilename);

        // Convert base64 to buffer and save
        const buffer = Buffer.from(fileData.file, 'base64');
        await writeFile(filePath, buffer);

        // Determine file type
        const fileType = fileData.contentType?.startsWith('video/') ? 'video' : 'image';

        // Save to database
        const photo = await prisma.photo.create({
          data: {
            url: `/uploads/gallery/${machineId}/${uniqueFilename}`,
            caption: caption,
            fileType: fileType,
            originalName: fileData.filename,
            fileSize: buffer.length,
            vendingMachineId: machineId
          }
        });

        uploadedFiles.push({
          id: photo.id,
          filename: uniqueFilename,
          originalName: fileData.filename,
          url: photo.url,
          caption: photo.caption,
          fileType: photo.fileType,
          size: buffer.length
        });
      }
      
      console.log(`✅ Uploaded ${uploadedFiles.length} gallery files`);
      return res.status(200).json({
        message: 'Gallery files uploaded successfully',
        photos: uploadedFiles
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Gallery Upload Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 