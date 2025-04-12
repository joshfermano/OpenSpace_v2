import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Create the upload directories if they don't exist
const createUploadDirs = async () => {
  try {
    await fs.mkdir('./uploads/profiles', { recursive: true });
    await fs.mkdir('./uploads/rooms', { recursive: true });
    await fs.mkdir('./uploads/ids', { recursive: true });
    await fs.mkdir('./uploads/reviews', { recursive: true });
    await fs.mkdir('./temp-uploads', { recursive: true });
  } catch (err) {
    console.error('Error creating upload directories:', err);
  }
};

createUploadDirs();

// Profile image upload storage
const profileStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Room image upload storage
const roomStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, 'uploads/rooms/');
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// ID verification document upload storage
const idStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, 'uploads/ids/');
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'id-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Review photos upload storage
const reviewStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, 'uploads/reviews/');
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Temporary upload storage
const tempStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, 'temp-uploads/');
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images only
const imageFileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create the multer upload objects
const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: imageFileFilter,
});

const roomUpload = multer({
  storage: roomStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: imageFileFilter,
});

const idUpload = multer({
  storage: idStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: imageFileFilter,
});

const reviewUpload = multer({
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: imageFileFilter,
});

const tempUpload = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export { profileUpload, roomUpload, idUpload, reviewUpload, tempUpload };
