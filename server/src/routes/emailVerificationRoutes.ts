import express, { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  sendEmailVerificationOTP,
  verifyEmailWithOTP,
  testEmailDelivery,
  resendEmailVerification,
} from '../controllers/emailVerificationController';

const router: Router = express.Router();

// Test email route (for troubleshooting only)
router.post('/test-email', testEmailDelivery);

// Protected routes (require authentication)
router.use(protect);

router.post('/send-otp', protect, sendEmailVerificationOTP);
router.post('/verify-otp', protect, verifyEmailWithOTP);
router.post('/resend-otp', protect, resendEmailVerification);

export default router;
