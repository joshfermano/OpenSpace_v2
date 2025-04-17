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
router.post('/send-email', sendVerificationByEmail);
router.post('/verify-otp', verifyEmailWithOTP);
router.post('/resend-otp', resendEmailVerification);

router.post('/send-otp', protect, sendEmailVerificationOTP);

export default router;
