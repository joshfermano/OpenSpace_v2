import express, {
  CookieOptions,
  Request,
  Response,
  NextFunction,
} from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { checkSupabaseConnection } from './config/supabase';
import { initializeStorage } from './services/imageService';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import fs from 'fs/promises';

// Import routes
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import roomRoutes from './routes/roomRoutes';
import bookingRoutes from './routes/bookingRoutes';
import reviewRoutes from './routes/reviewRoutes';
import earningsRoutes from './routes/earningsRoutes';
import emailVerificationRoutes from './routes/emailVerificationRoutes';
import adminEarningsRoutes from './routes/adminEarningsRoutes';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [
          /\.vercel\.app$/,
          'https://openspace-reserve.vercel.app',
          process.env.CLIENT_URL,
        ].filter(Boolean)
      : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['set-cookie'],
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../uploads')));

app.use((req: Request, res: Response, next: NextFunction) => {
  const originalCookie = res.cookie.bind(res);

  res.cookie = function (name: string, val: any, options?: CookieOptions) {
    const cookieOptions: CookieOptions = {
      sameSite:
        process.env.NODE_ENV === 'production'
          ? ('none' as const)
          : ('lax' as const),
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      ...options,
    };

    console.log(`Setting cookie: ${name}`, cookieOptions);

    // Call original method with our enhanced options
    return originalCookie(name, val, cookieOptions);
  } as typeof res.cookie;

  next();
});

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/email-verification', emailVerificationRoutes);
app.use('/api/admin/earnings', adminEarningsRoutes);

// Health check route
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const createUploadDirs = async () => {
  const dirs = [
    './src/uploads',
    './src/uploads/rooms',
    './src/uploads/profiles',
    './src/uploads/verifications',
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

createUploadDirs().catch(console.error);

const startServer = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      await checkSupabaseConnection();
      await initializeStorage();
    } else {
      console.warn(
        'Supabase credentials not found, image storage will not be available'
      );
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;
