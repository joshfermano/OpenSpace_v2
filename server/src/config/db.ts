import mongoose from 'mongoose';
import 'dotenv/config';

export const connectDb = async (): Promise<boolean> => {
  try {
    const connectionString = process.env.MONGO_URL;
    if (!connectionString) {
      throw new Error('MONGO_URL environment variable is not defined');
    }

    // Add connection options for better reliability
    await mongoose.connect(connectionString, {
      // These options are automatically applied in mongoose 6+ but including for clarity
      serverSelectionTimeoutMS: 5000, // Keep trying to connect for 5 seconds
      heartbeatFrequencyMS: 30000, // Check connection every 30 seconds
    });

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Atlas connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    return false;
  }
};
