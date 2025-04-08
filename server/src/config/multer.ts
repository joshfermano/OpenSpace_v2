import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create review uploads directory
const reviewUploadsDir = path.join(uploadsDir, 'reviews');
if (!fs.existsSync(reviewUploadsDir)) {
  fs.mkdirSync(reviewUploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Different folders for different types of uploads
    if (file.fieldname === 'photos') {
      cb(null, reviewUploadsDir);
    } else if (file.fieldname === 'profileImage') {
      const profileUploadsDir = path.join(uploadsDir, 'profiles');
      if (!fs.existsSync(profileUploadsDir)) {
        fs.mkdirSync(profileUploadsDir, { recursive: true });
      }
      cb(null, profileUploadsDir);
    } else if (file.fieldname === 'images') {
      const roomUploadsDir = path.join(uploadsDir, 'rooms');
      if (!fs.existsSync(roomUploadsDir)) {
        fs.mkdirSync(roomUploadsDir, { recursive: true });
      }
      cb(null, roomUploadsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (_req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
