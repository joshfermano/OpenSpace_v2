import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import OtpVerification from '../models/OtpVerification';
import {
  sendOtpVerificationEmail,
  sendTestEmail,
} from '../services/emailService';

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to safely get and verify the user
const verifyUserAuth = (req: Request, res: Response): IUser | null => {
  const user = req.user as IUser;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return null;
  }

  return user;
};

// Send OTP for email verification
export const sendEmailVerificationOTP = async (
  req: Request,
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
  req: Request,
  res: Response
): Promise<void> => {
  return sendEmailVerificationOTP(req, res);
};

// Verify email with OTP
export const verifyEmailWithOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { otp } = req.body;

    // Get authenticated user
    const user = verifyUserAuth(req, res);
    if (!user) return;

    if (!otp) {
      res.status(400).json({
        success: false,
        message: 'OTP is required',
      });
      return;
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
      return;
    }

    // Find the OTP verification record
    const otpRecord = await OtpVerification.findOne({
      user: user._id,
      type: 'email',
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP',
      });
      return;
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP',
      });
      return;
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again',
      });
      return;
    }

    // Mark user's email as verified
    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
    });

    // Delete the OTP record
    await OtpVerification.findByIdAndDelete(otpRecord._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Verify email with OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
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
