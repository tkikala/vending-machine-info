import { VercelRequest, VercelResponse } from '@vercel/node';
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
      const uploadedFiles: any[] = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const caption = captions[i] || '';
        
        if (!fileData.file || !fileData.filename) {
          continue;
        }

        try {
          // Generate unique filename
          const timestamp = Date.now() + i;
          const extension = fileData.filename.split('.').pop();
          const uniqueFilename = `gallery_${machineId}_${timestamp}.${extension}`;

          // Calculate file size
          const fileSizeInBytes = Math.ceil((fileData.file.length * 3) / 4);

          // Determine file type
          const fileType = fileData.contentType?.startsWith('video/') ? 'video' : 'image';

          // Store file in database
          const fileRecord = await prisma.file.create({
            data: {
              filename: uniqueFilename,
              originalName: fileData.filename,
              contentType: fileData.contentType || 'image/jpeg',
              fileSize: fileSizeInBytes,
              fileData: fileData.file, // Store base64 data
              fileType: 'gallery'
            }
          });

          // Save to database (just metadata, not the file data)
          const photo = await prisma.photo.create({
            data: {
              url: `/api/files/${fileRecord.id}`,
              caption: caption,
              fileType: fileType,
              originalName: fileData.filename,
              fileSize: fileSizeInBytes,
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
            size: fileSizeInBytes
          });

          console.log(`✅ Uploaded gallery file: ${uniqueFilename}`);
        } catch (uploadError) {
          console.error(`❌ Failed to upload file ${fileData.filename}:`, uploadError);
          // Continue with other files
        }
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