import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import path from 'path';
import fs from 'fs/promises';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import roomRoutes from './routes/roomRoutes';
import bookingRoutes from './routes/bookingRoutes';
import reviewRoutes from './routes/reviewRoutes';
import earningsRoutes from './routes/earningsRoutes';
import emailVerificationRoutes from './routes/emailVerificationRoutes';

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://openspace-client.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/email-verification', emailVerificationRoutes);

// Health check route
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
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
