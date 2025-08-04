import { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import formidable from 'formidable';
import { promises as fs } from 'fs';

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
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Content-Length:', req.headers['content-length']);
      
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
      const filename = fields.filename?.[0];
      const contentType = fields.contentType?.[0];
      
      if (!file) {
        console.log('❌ No file uploaded');
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
        const uniqueFilename = `logo_${timestamp}.${extension}`;

        // Upload to Vercel Blob Storage
        const blob = await put(uniqueFilename, buffer, {
          access: 'public',
          contentType: contentType || file.mimetype || 'image/jpeg'
        });

        // Clean up temp file
        await fs.unlink(file.filepath);

        console.log(`✅ File uploaded to Vercel Blob: ${uniqueFilename} (${buffer.length} bytes)`);
        return res.status(200).json({
          message: 'File uploaded successfully',
          file: {
            filename: uniqueFilename,
            originalName: file.originalFilename,
            url: blob.url,
            size: buffer.length,
            contentType: contentType || file.mimetype || 'image/jpeg'
          }
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
          error: 'Failed to upload file to Vercel Blob Storage',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
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