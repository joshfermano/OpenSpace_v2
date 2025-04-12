import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import OtpVerification from '../models/OtpVerification';
import {
  sendOtpVerificationEmail,
  sendTestEmail,
} from '../services/emailService';

// Use Express namespace types instead of importing directly
type Request = express.Request;
type Response = express.Response;

// Define a custom Request type that includes the user property
interface AuthRequest extends express.Request {
  user?: IUser;
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
    } as SignOptions
  );
};

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to safely get and verify the user
const verifyUserAuth = (req: AuthRequest, res: Response): IUser | null => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return null;
  }

  return req.user;
};

// Send OTP for email verification
export const sendEmailVerificationOTP = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log('Send OTP endpoint called');
    console.log('Request cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);

    // Get authenticated user
    const user = verifyUserAuth(req, res);
    if (!user) return;

    // Check if email is already verified
    if (user.isEmailVerified) {
      console.log('Email already verified - returning 400');
      res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
      return;
    }

    console.log(`Generating OTP for user ${user.email}`);
    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // OTP expires in 15 minutes

    console.log('Storing OTP in database');
    // Store OTP in database
    const otpRecord = await OtpVerification.findOneAndUpdate(
      { user: user._id, type: 'email' },
      {
        otp,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    console.log('OTP stored in database with ID:', otpRecord._id);
    console.log('Sending verification email with OTP');

    try {
      // Send the verification email with OTP
      await sendOtpVerificationEmail(user.email, user.firstName, otp);
      console.log('OTP email sent successfully');
    } catch (emailError) {
      console.error('Error sending OTP email, but continuing:', emailError);
      // We'll continue even if email sending fails,
      // since we've already stored the OTP in the database
    }

    console.log('OTP process completed successfully');
    res.status(200).json({
      success: true,
      message: 'Verification OTP sent successfully',
      // In development mode, send back the OTP to simplify testing
      ...(process.env.NODE_ENV !== 'production' ? { otp } : {}),
    });
  } catch (error: any) {
    console.error('Send email verification OTP error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to send verification OTP',
      error: error.message,
    });
  }
};

// Resend verification OTP (alias for sendEmailVerificationOTP)
export const resendEmailVerification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  return sendEmailVerificationOTP(req, res);
};

export const verifyEmailWithOTP = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
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
      otp,
      type: 'email',
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

    // Find the user associated with this OTP
    const user = await User.findById(otpRecord.user);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.isEmailVerified = true;
    await user.save();

    // Delete used OTP
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    // Generate new token using our local function instead of importing
    const token = generateToken(user);

    // Set the token in a cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as
        | 'strict'
        | 'lax'
        | 'none',
      path: '/',
    };

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message,
    });
  }
};

// Test email delivery (for troubleshooting)
export const testEmailDelivery = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
      return;
    }

    // Send a test email
    await sendTestEmail(email);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}`,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
    });
  }
};
