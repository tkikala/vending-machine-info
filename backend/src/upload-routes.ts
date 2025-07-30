import { Router } from 'express';
import { uploadSingle, uploadGallery, getFileType, deleteFile } from './upload';
import { requireAuth } from './auth';
import { uploadLimiter } from './middleware/rateLimiter';
import prisma from './prisma';
import path from 'path';

// Helper function to get server URL
const getServerUrl = (req: any) => {
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:4000';
  return `${protocol}://${host}`;
};

const uploadRouter = Router();

// Upload single file (logo or general)
uploadRouter.post('/single', uploadLimiter, requireAuth, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `${getServerUrl(req)}/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`,
      fileType: getFileType(req.file.mimetype)
    };

    res.json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Single file upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Upload gallery files for a specific machine
uploadRouter.post('/gallery/:machineId', uploadLimiter, requireAuth, uploadGallery, async (req, res) => {
  try {
    const { machineId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Verify machine exists and user has permission
    const machine = await prisma.vendingMachine.findUnique({
      where: { id: machineId },
      include: { owner: true }
    });

    if (!machine) {
      // Clean up uploaded files if machine doesn't exist
      files.forEach(file => deleteFile(file.path));
      return res.status(404).json({ error: 'Machine not found' });
    }

    // Check if user owns the machine or is admin
    if (machine.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      // Clean up uploaded files if no permission
      files.forEach(file => deleteFile(file.path));
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Create photo records in database
    const photoPromises = files.map(file => {
      const url = `${getServerUrl(req)}/uploads/gallery/${file.filename}`;
      return prisma.photo.create({
        data: {
          url,
          fileType: getFileType(file.mimetype),
          originalName: file.originalname,
          fileSize: file.size,
          vendingMachineId: machineId,
          caption: req.body.caption || null
        }
      });
    });

    const photos = await Promise.all(photoPromises);

    res.json({
      message: 'Gallery files uploaded successfully',
      photos: photos
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    // Clean up files on error
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => deleteFile(file.path));
    }
    res.status(500).json({ error: 'Gallery upload failed' });
  }
});

// Delete a gallery item
uploadRouter.delete('/gallery/:photoId', requireAuth, async (req, res) => {
  try {
    const { photoId } = req.params;

    // Get photo with machine info
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(photoId) },
      include: { vendingMachine: true }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check permissions
    if (photo.vendingMachine.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Delete file from filesystem
    const filePath = path.join('uploads/gallery', path.basename(photo.url));
    deleteFile(filePath);

    // Delete from database
    await prisma.photo.delete({
      where: { id: parseInt(photoId) }
    });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Get file info
uploadRouter.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // This endpoint can be used to verify file existence
    // In a production environment, you might want to add more security
    res.json({
      filename,
      url: `/uploads/${filename}`,
      exists: true
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

export default uploadRouter; 