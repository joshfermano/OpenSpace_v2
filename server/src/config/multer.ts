import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../temp-uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different types of uploads
['profiles', 'rooms', 'reviews', 'verifications'].forEach((dir) => {
  const subDir = path.join(uploadsDir, dir);
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Different folders for different types of uploads
    if (file.fieldname === 'photos') {
      cb(null, path.join(uploadsDir, 'reviews'));
    } else if (file.fieldname === 'profileImage') {
      cb(null, path.join(uploadsDir, 'profiles'));
    } else if (file.fieldname === 'images') {
      cb(null, path.join(uploadsDir, 'rooms'));
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (_req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
