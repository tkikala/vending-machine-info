import { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

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

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(file, 'base64');
        
        // Generate unique filename
        const timestamp = Date.now();
        const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
        const uniqueFilename = `logo_${timestamp}.${extension}`;

        // Upload to Vercel Blob Storage
        const blob = await put(uniqueFilename, buffer, {
          access: 'public',
          contentType: contentType || 'image/jpeg'
        });

        console.log(`✅ File uploaded to Vercel Blob: ${uniqueFilename} (${buffer.length} bytes)`);
        return res.status(200).json({
          message: 'File uploaded successfully',
          file: {
            filename: uniqueFilename,
            originalName: filename,
            url: blob.url,
            size: buffer.length,
            contentType: contentType || 'image/jpeg'
          }
        });
      } catch (uploadError) {
        console.error('❌ Upload error:', uploadError);
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