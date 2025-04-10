import mongoose from 'mongoose';
import Booking from '../models/Booking';

async function migratePaymentMethods() {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);

    // Update all creditCard payment methods to card
    await Booking.updateMany(
      { paymentMethod: 'creditCard' },
      { $set: { paymentMethod: 'card' } }
    );

    console.log('Payment methods migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating payment methods:', error);
    process.exit(1);
  }
}

migratePaymentMethods();
