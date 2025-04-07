import { Request, Response, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../services/emailService';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import OtpVerification from '../models/OtpVerification';
import { sendVerificationEmail } from '../services/emailService';
import mongoose from 'mongoose';
import 'dotenv/config';

interface CustomCookieOptions extends CookieOptions {
  sameSite: 'strict' | 'lax' | 'none' | boolean;
  expires: Date;
}

interface SafeUserResponse extends Omit<IUser, 'password'> {
  password?: undefined;
}

interface IUserWithBan extends IUser {
  active: boolean;
  banReason?: string;
}

function ensureAuthenticated(req: Request, res: Response): IUser | null {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return null;
  }
  return req.user as IUser;
}

function ensureAdmin(req: Request, res: Response): IUser | null {
  const user = ensureAuthenticated(req, res);
  if (!user) return null;

  if (user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized, admin access required',
    });
    return null;
  }

  return user;
}

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    } as jwt.SignOptions
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Request body:', req.body);

    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        message:
          'Please provide all required fields: email, password, firstName, lastName',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber: phoneNumber || '',
      role: 'user',
      active: true,
      verificationLevel: 'basic',
      isEmailVerified: false,
      isPhoneVerified: true,
      isHostVerified: false,
      savedRooms: [],
    });

    const token = generateToken(user);

    const cookieOptions: CustomCookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    };

    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(201)
      .cookie('token', token, cookieOptions as CookieOptions)
      .json({
        success: true,
        message: 'Registration successful',
        data: userResponse,
        token,
      });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if account is active
    if (user.active === false) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const token = generateToken(user);

    const cookieOptions: CustomCookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    };

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).cookie('token', token, cookieOptions).json({
      success: true,
      message: 'Login successful',
      data: userResponse,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// Get current user
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = ensureAuthenticated(req, res);
    if (!user) return;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

// Create admin user (accessible only by existing admins)
export const createAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // First ensure the requester is authenticated and is an admin
    const requestingUser = ensureAdmin(req, res);

    if (!requestingUser) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const { email, password, firstName, lastName, phoneNumber, profileImage } =
      req.body;

    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Create new admin user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      profileImage: profileImage || '',
      role: 'admin',
      verificationLevel: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    // Change delete operation
    const userResponse = user.toObject() as SafeUserResponse;
    userResponse.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: userResponse,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      error: error.message,
    });
  }
};

// Send email verification OTP
export const sendEmailVerificationOTP = async (
  userId: mongoose.Types.ObjectId,
  email: string
): Promise<boolean> => {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Delete any existing OTPs for this user and type
    await OtpVerification.deleteMany({ user: userId, type: 'email' });

    // Create new OTP verification record
    await OtpVerification.create({
      user: userId,
      otp,
      type: 'email',
      expiresAt,
    });

    // Send verification email
    await sendVerificationEmail(email, otp, otp);

    return true;
  } catch (error) {
    console.error('Error sending email verification OTP:', error);
    return false;
  }
};

// Initiate email verification
export const initiateEmailVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUser = ensureAuthenticated(req, res);
    if (!currentUser) return;

    const userId = new mongoose.Types.ObjectId(currentUser._id);
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // If email is different from current email, update it
    if (email !== user.email) {
      user.email = email;
      user.isEmailVerified = false;
      await user.save();
    }

    // Send OTP
    const result = await sendEmailVerificationOTP(userId, email);

    if (result) {
      res.status(200).json({
        success: true,
        message: 'Verification OTP sent to email',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification OTP',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error initiating email verification',
      error: error.message,
    });
  }
};

// Resend email verification OTP
export const resendEmailVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUser = ensureAuthenticated(req, res);
    if (!currentUser) return;

    const userId = new mongoose.Types.ObjectId(currentUser._id);

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Send OTP
    const result = await sendEmailVerificationOTP(userId, user.email);

    if (result) {
      res.status(200).json({
        success: true,
        message: 'Verification OTP resent to email',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification OTP',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error resending email verification',
      error: error.message,
    });
  }
};

// Verify email with OTP
export const verifyEmailWithOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = ensureAuthenticated(req, res);
    if (!user) return;

    const userId = user._id;
    const { otp } = req.body;

    if (!otp) {
      res.status(400).json({
        success: false,
        message: 'OTP is required',
      });
      return;
    }

    // Find the OTP record
    const otpRecord = await OtpVerification.findOne({
      user: userId,
      type: 'email',
      otp,
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
      return;
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
        success: false,
        message: 'OTP has expired, please request a new one',
      });
      return;
    }

    // Update user's email verification status
    await User.findByIdAndUpdate(userId, { isEmailVerified: true });

    // Delete used OTP
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message,
    });
  }
};

// Send phone verification OTP
export const sendPhoneVerificationOTP = async (
  userId: mongoose.Types.ObjectId,
  phoneNumber: string
): Promise<boolean> => {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Delete any existing OTPs for this user and type
    await OtpVerification.deleteMany({ user: userId, type: 'phone' });

    // Create new OTP verification record
    await OtpVerification.create({
      user: userId,
      otp,
      type: 'phone',
      expiresAt,
    });

    // In a real application, you would send an SMS here
    console.log(`[SMS SIMULATION] Sending OTP ${otp} to ${phoneNumber}`);

    return true;
  } catch (error) {
    console.error('Error sending phone verification OTP:', error);
    return false;
  }
};

// Initiate phone verification
export const initiatePhoneVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUser = ensureAuthenticated(req, res);
    if (!currentUser) return;

    const userId = new mongoose.Types.ObjectId(currentUser._id);
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (phoneNumber !== user.phoneNumber) {
      user.phoneNumber = phoneNumber;
      user.isPhoneVerified = false;
      await user.save();
    }

    // Send OTP
    const result = await sendPhoneVerificationOTP(userId, phoneNumber);

    if (result) {
      res.status(200).json({
        success: true,
        message: 'Verification OTP sent to phone',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification OTP',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error initiating phone verification',
      error: error.message,
    });
  }
};

// Verify phone with OTP
export const verifyPhoneWithOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = ensureAuthenticated(req, res);
    if (!user) return;

    const userId = user._id;
    const { otp } = req.body;

    if (!otp) {
      res.status(400).json({
        success: false,
        message: 'OTP is required',
      });
      return;
    }

    // Find the OTP record
    const otpRecord = await OtpVerification.findOne({
      user: userId,
      type: 'phone',
      otp,
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
      return;
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
        success: false,
        message: 'OTP has expired, please request a new one',
      });
      return;
    }

    // Update user's phone verification status
    await User.findByIdAndUpdate(userId, { isPhoneVerified: true });

    // Delete used OTP
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying phone',
      error: error.message,
    });
  }
};

export const uploadIdVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = ensureAuthenticated(req, res);
    if (!user) return;

    const userId = user._id;
    const { idType, idNumber, idImage } = req.body;

    if (!idType || !idNumber || !idImage) {
      res.status(400).json({
        success: false,
        message: 'ID type, number, and image are required',
      });
      return;
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update user's ID verification document
    userDoc.identificationDocument = {
      idType,
      idNumber,
      idImage,
      uploadDate: new Date(),
      verificationStatus: 'pending',
    };

    await userDoc.save();

    res.status(200).json({
      success: true,
      message:
        'ID verification document uploaded successfully, pending approval',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error uploading ID verification',
      error: error.message,
    });
  }
};

// Verify user ID document (admin only)
export const verifyUserIdDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const admin = ensureAdmin(req, res);
    if (!admin) return;

    const { userId, isApproved, rejectionReason } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (!user.identificationDocument) {
      res.status(400).json({
        success: false,
        message: 'User has not uploaded an ID document',
      });
      return;
    }

    if (isApproved) {
      // Approve the ID verification
      user.identificationDocument.verificationStatus = 'approved';
      user.identificationDocument.verificationDate = new Date();

      // If email and phone are also verified, upgrade verification level
      if (user.isEmailVerified && user.isPhoneVerified) {
        user.verificationLevel = 'verified';
      }
    } else {
      // Reject the ID verification
      user.identificationDocument.verificationStatus = 'rejected';
      user.identificationDocument.verificationDate = new Date();
      user.identificationDocument.rejectionReason =
        rejectionReason || 'Document verification failed';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ID document ${
        isApproved ? 'approved' : 'rejected'
      } successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying user ID document',
      error: error.message,
    });
  }
};

// Get list of users with pending ID verification (admin only)
export const getPendingIdVerifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const admin = ensureAdmin(req, res);
    if (!admin) return;

    const users = await User.find({
      'identificationDocument.verificationStatus': 'pending',
    }).select('_id firstName lastName email identificationDocument');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting pending ID verifications',
      error: error.message,
    });
  }
};

export const banUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = ensureAdmin(req, res);
    if (!admin) return;

    const { userId, reason } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({
        success: false,
        message: 'Cannot ban an admin user',
      });
      return;
    }

    const userWithBan = user as unknown as IUserWithBan;
    userWithBan.active = false;
    userWithBan.banReason = reason || 'Banned by admin';
    await userWithBan.save();

    res.status(200).json({
      success: true,
      message: 'User banned successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error banning user',
      error: error.message,
    });
  }
};

export const unbanUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = ensureAdmin(req, res);
    if (!admin) return;

    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const userWithBan = user as unknown as IUserWithBan;
    userWithBan.active = true;
    userWithBan.banReason = undefined;
    await userWithBan.save();

    res.status(200).json({
      success: true,
      message: 'User unbanned successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error unbanning user',
      error: error.message,
    });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const admin = ensureAdmin(req, res);
    if (!admin) return;

    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({
        success: false,
        message: 'Cannot delete an admin user',
      });
      return;
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

export const becomeHost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const { bio, languagesSpoken } = req.body;

    if (req.user.verificationLevel !== 'verified') {
      res.status(400).json({
        success: false,
        message: 'User must be fully verified to become a host',
      });
      return;
    }

    req.user.role = 'host';
    req.user.hostInfo = {
      bio: bio || '',
      languagesSpoken: languagesSpoken || [],
      hostSince: new Date(),
    };

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully upgraded to host',
      user: {
        ...req.user.toObject(),
        password: undefined,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error becoming a host',
      error: error.message,
    });
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Standardize response time to prevent timing attacks
    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      res.status(200).json({
        success: true,
        message:
          'If your email is registered, you will receive a password reset link',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before saving to database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry (1 hour)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    // Save to user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = tokenExpiry;
    await user.save();

    try {
      // Send password reset email with token
      await sendPasswordResetEmail(email, resetToken);

      res.status(200).json({
        success: true,
        message:
          'If your email is registered, you will receive a password reset link',
      });
    } catch (error) {
      // If email sending fails, clear the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error('Error sending password reset email:', error);

      // Don't expose error details to client
      res.status(500).json({
        success: false,
        message: 'There was a problem processing your request',
      });
    }
  } catch (error: any) {
    console.error('Password reset request error:', error);

    res.status(500).json({
      success: false,
      message: 'Error processing request',
    });
  }
};

// Reset password with token
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with the token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error: any) {
    console.error('Password reset error:', error);

    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};

export const validateResetToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token is required',
      });
      return;
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with the token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error validating reset token',
      error: error.message,
    });
  }
};
