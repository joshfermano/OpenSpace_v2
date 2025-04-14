import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  active: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImage?: string;
  role: 'user' | 'host' | 'admin';
  verificationLevel: 'basic' | 'verified' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isHostVerified: boolean;
  identificationDocument?: {
    idType: string;
    idNumber: string;
    idImage: string;
    uploadDate: Date;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    verificationDate?: Date;
    rejectionReason?: string;
    businessDocument?: {
      certificateType: string;
      certificateNumber: string;
      certificateImage: string;
      uploadDate: Date;
    };
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  hostInfo?: {
    bio: string;
    languagesSpoken: string[];
    responseRate?: number;
    responseTime?: number;
    acceptanceRate?: number;
    hostSince: Date;
  };
  savedRooms: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface UserModel extends mongoose.Model<IUser> {
  getUserVerificationCounts(): Promise<{
    total: number;
    verified: number;
    unverified: number;
    banned: number;
  }>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      select: false, // Don't return this field in queries by default
    },
    resetPasswordExpire: {
      type: Date,
      select: false, // Don't return this field in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'host', 'admin'],
      default: 'user',
    },
    verificationLevel: {
      type: String,
      enum: ['basic', 'verified', 'admin'],
      default: 'basic',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isHostVerified: {
      type: Boolean,
      default: false,
    },
    identificationDocument: {
      idType: {
        type: String,
        enum: [
          'Philippine National ID',
          'ePhilID',
          'Passport',
          'LTO Drivers License',
          'SSS Card',
          'GSIS Card',
          'UMID Card',
          'PRC ID',
          'COMELEC Voters ID',
          'Senior Citizen ID',
          'PhilHealth ID',
          'Postal ID',
          'TIN Card',
          'Other',
        ],
      },
      idNumber: { type: String },
      idImage: { type: String },
      uploadDate: { type: Date },
      verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      verificationDate: { type: Date },
      rejectionReason: { type: String },
      businessDocument: {
        certificateType: { type: String },
        certificateNumber: { type: String },
        certificateImage: { type: String },
        uploadDate: { type: Date },
      },
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    hostInfo: {
      bio: { type: String },
      languagesSpoken: [{ type: String }],
      responseRate: { type: Number },
      responseTime: { type: Number },
      acceptanceRate: { type: Number },
      hostSince: { type: Date },
    },
    savedRooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  },
  {
    timestamps: true,
  }
);

userSchema.statics.getUserVerificationCounts = async function () {
  try {
    console.log('Calculating user verification counts...');

    const total = await this.countDocuments({});
    console.log(`Total users: ${total}`);

    // Get verified users (users with verificationLevel of 'verified' or 'admin')
    const verified = await this.countDocuments({
      verificationLevel: { $in: ['verified', 'admin'] },
    });
    console.log(`Verified users: ${verified}`);

    // Get banned users
    const banned = await this.countDocuments({ active: false });
    console.log(`Banned users: ${banned}`);

    // Calculate unverified users (excluding banned users)
    const activeUnverified = await this.countDocuments({
      verificationLevel: 'basic',
      active: true,
    });
    console.log(`Active unverified users: ${activeUnverified}`);

    return {
      total,
      verified,
      unverified: activeUnverified,
      banned,
    };
  } catch (error) {
    console.error('Error in getUserVerificationCounts:', error);
    return {
      total: 0,
      verified: 0,
      unverified: 0,
      banned: 0,
    };
  }
};

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser, UserModel>('User', userSchema);
