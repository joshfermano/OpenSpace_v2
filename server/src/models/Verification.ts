import mongoose, { Document, Schema } from 'mongoose';

export interface IVerification extends Document {
  user: mongoose.Types.ObjectId;
  email: {
    token: string;
    expiresAt: Date;
    isVerified: boolean;
    verifiedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },
    email: {
      token: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookup by token
verificationSchema.index({ 'email.token': 1 });

// Clean up expired tokens (utility method)
verificationSchema.statics.cleanupExpired = async function () {
  return this.deleteMany({
    'email.expiresAt': { $lt: new Date() },
    'email.isVerified': false,
  });
};

// Middleware to create a new token
verificationSchema.statics.createToken = async function (userId: string) {
  const crypto = require('crypto');
  const token = crypto.randomBytes(20).toString('hex');

  const verification = await this.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      email: {
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isVerified: false,
      },
    },
    { upsert: true, new: true }
  );

  return verification;
};

// Middleware to verify email
verificationSchema.statics.verifyEmailToken = async function (token: string) {
  const verification = await this.findOne({
    'email.token': token,
    'email.expiresAt': { $gt: new Date() },
  });

  if (!verification) {
    return null;
  }

  verification.email.isVerified = true;
  verification.email.verifiedAt = new Date();
  await verification.save();

  // Update user's verification status
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(verification.user, {
    isEmailVerified: true,
  });

  return verification;
};

const Verification = mongoose.model<IVerification>(
  'Verification',
  verificationSchema
);

export default Verification;
