import express from 'express';
import * as authController from '../controllers/authController';
import * as emailVerificationController from '../controllers/emailVerificationController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// ===== Public routes =====
// Authentication
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Password reset (public)
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.get('/validate-reset-token/:token', authController.validateResetToken);

// Email verification - PUBLIC routes (no authentication required)
// Use these endpoints for initial verification
router.post(
  '/email-verification/verify',
  emailVerificationController.verifyEmailWithOTP
);
router.post(
  '/email-verification/send',
  emailVerificationController.sendEmailVerificationOTP
);
router.post(
  '/email-verification/resend',
  emailVerificationController.resendEmailVerification
);

// ===== Protected routes (require authentication) =====
router.use(protect); // Apply authentication middleware to all routes below

// User profile
router.get('/me', authController.getCurrentUser);

// Password update (for authenticated users)
router.post('/update-password', authController.updatePassword);

// Protected email verification routes (for already authenticated users)
router.post(
  '/email-verification/initiate',
  authController.initiateEmailVerification
);

// Phone verification
router.post(
  '/phone-verification/initiate',
  authController.initiatePhoneVerification
);
router.post('/phone-verification/verify', authController.verifyPhoneWithOTP);

// ID verification
router.post('/id-verification/upload', authController.uploadIdVerification);

// Host functionality
router.post('/become-host', authController.becomeHost);

export default router;
