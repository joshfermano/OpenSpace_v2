import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Earning from '../models/Earnings';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL || '')
  .then(() => {
    console.log('Connected to MongoDB');
    migrateEarnings();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateEarnings() {
  try {
    console.log('Starting earnings migration...');

    // Find all earnings from online payments that are still pending
    const earningsToUpdate = await Earning.find({
      paymentMethod: { $in: ['card', 'gcash', 'maya'] },
      status: 'pending',
    });

    console.log(`Found ${earningsToUpdate.length} earnings to update...`);

    let updatedCount = 0;

    for (const earning of earningsToUpdate) {
      // Update to available status with immediate availability
      earning.status = 'available';
      earning.availableDate = new Date();
      await earning.save();
      updatedCount++;

      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount} records so far...`);
      }
    }

    console.log(
      `Successfully updated ${updatedCount} earnings to available status.`
    );
    console.log('Migration completed!');

    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}
