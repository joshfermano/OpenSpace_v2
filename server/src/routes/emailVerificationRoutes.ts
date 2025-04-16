import express, { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  sendEmailVerificationOTP,
  verifyEmailWithOTP,
  testEmailDelivery,
  resendEmailVerification,
  sendVerificationByEmail,
} from '../controllers/emailVerificationController';

const router: Router = express.Router();

// Public routes (no authentication required)
router.post('/test-email', testEmailDelivery);
router.post('/send-email', sendVerificationByEmail); // For non-authenticated users
router.post('/verify-otp', verifyEmailWithOTP); // Works for both auth and non-auth
router.post('/resend-otp', resendEmailVerification); // Works for both auth and non-auth

// Protected routes (require authentication)
router.post('/send-otp', protect, sendEmailVerificationOTP);

export default router;
