// Check if this matches your model definition
import mongoose, { Schema, Document } from 'mongoose';

interface OtpVerificationDocument extends Document {
  user: mongoose.Types.ObjectId;
  otp: string;
  type: string;
  expiresAt: Date;
  createdAt: Date;
}

const OtpVerificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['email', 'phone'],
      default: 'email',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<OtpVerificationDocument>(
  'OtpVerification',
  OtpVerificationSchema
);
