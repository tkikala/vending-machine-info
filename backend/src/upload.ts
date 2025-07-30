import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize upload directories
ensureDirectoryExists('uploads/machines');
ensureDirectoryExists('uploads/logos');
ensureDirectoryExists('uploads/gallery');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'logo') {
      uploadPath += 'logos';
    } else if (file.fieldname === 'gallery') {
      uploadPath += 'gallery';
    } else {
      uploadPath += 'machines';
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter for images and videos
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MPEG, MOV, WebM) are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Export upload configurations
export const uploadSingle = upload.single('file');
export const uploadLogo = upload.single('logo');
export const uploadGallery = upload.array('gallery', 10);
export const uploadMixed = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

// Helper function to get file type from mimetype
export const getFileType = (mimetype: string): 'image' | 'video' => {
  return mimetype.startsWith('video/') ? 'video' : 'image';
};

// Helper function to delete file
export const deleteFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export default upload; 