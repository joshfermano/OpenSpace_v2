import mongoose, { Document, Schema } from 'mongoose';
export interface IEarning extends Document {
  host: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  amount: number;
  platformFee: number;
  hostPayout: number;
  status: 'pending' | 'available' | 'paid_out';
  paymentMethod: 'property' | 'card' | 'gcash' | 'maya';
  availableDate: Date;
  paidOutAt?: Date;
  payoutId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const earningSchema = new Schema<IEarning>(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    hostPayout: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'available', 'paid_out'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['property', 'card', 'gcash', 'maya'],
      required: true,
    },
    availableDate: {
      type: Date,
      required: true,
    },
    paidOutAt: {
      type: Date,
    },
    payoutId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEarning>('Earning', earningSchema);
