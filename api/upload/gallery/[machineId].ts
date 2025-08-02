import { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
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
      
      // Validate number of files (now handling single files)
      if (files.length > 1) {
        return res.status(400).json({ error: 'Maximum 1 file per request' });
      }

      const uploadedFiles: any[] = [];
      const errors: string[] = [];

      // Process each file (should be only one now)
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const caption = captions[i] || '';
        
        if (!fileData || !fileData.file || !fileData.filename) {
          errors.push(`File ${i + 1}: Invalid file data`);
          continue;
        }

        try {
          // Validate file size (4MB limit for Vercel Blob free tier)
          const fileSizeInBytes = Math.ceil((fileData.file.length * 3) / 4); // Approximate size for base64
          if (fileSizeInBytes > 4 * 1024 * 1024) {
            errors.push(`File ${fileData.filename}: File size exceeds 4MB limit`);
            continue;
          }

          // Convert base64 to buffer
          const buffer = Buffer.from(fileData.file, 'base64');
          
          // Generate unique filename
          const timestamp = Date.now() + i;
          const extension = fileData.filename.split('.').pop()?.toLowerCase() || 'jpg';
          const uniqueFilename = `gallery_${machineId}_${timestamp}.${extension}`;

          // Upload to Vercel Blob Storage
          const blob = await put(uniqueFilename, buffer, {
            access: 'public',
            contentType: fileData.contentType || 'image/jpeg'
          });

          // Determine file type
          const fileType = fileData.contentType?.startsWith('video/') ? 'video' : 'image';

          // Save to database (just metadata, not the file data)
          const photo = await prisma.photo.create({
            data: {
              url: blob.url,
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
            url: blob.url,
            caption: photo.caption,
            fileType: photo.fileType,
            size: buffer.length
          });

          console.log(`✅ Uploaded gallery file: ${uniqueFilename}`);
        } catch (uploadError) {
          console.error(`❌ Failed to upload file ${fileData.filename}:`, uploadError);
          errors.push(`File ${fileData.filename}: ${uploadError instanceof Error ? uploadError.message : 'Upload failed'}`);
        }
      }
      
      console.log(`✅ Uploaded ${uploadedFiles.length} gallery files`);
      
      // Return response with both successes and errors
      return res.status(200).json({
        message: `Gallery upload completed. ${uploadedFiles.length} files uploaded successfully.`,
        photos: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Gallery Upload Error:', error);
    return res.status(500).json({
      error: 'Failed to upload gallery files',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 