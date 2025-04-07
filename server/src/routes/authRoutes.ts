import express from 'express';
import * as authController from '../controllers/authController';
import * as emailVerificationController from '../controllers/emailVerificationController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

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

// Email verification public routes
router.post(
  '/email-verification/send',
  emailVerificationController.sendEmailVerificationOTP
);
router.post(
  '/email-verification/verify',
  emailVerificationController.verifyEmailWithOTP
);
router.post(
  '/email-verification/resend',
  emailVerificationController.resendEmailVerification
);

// ===== Protected routes (require authentication) =====
router.use(protect); // Apply authentication middleware to all routes below

// User profile
router.get('/me', authController.getCurrentUser as express.RequestHandler);

router.post(
  '/email-verification/initiate',
  authController.initiateEmailVerification
);
router.post(
  '/email-verification/resend',
  authController.resendEmailVerification
);
router.post('/email-verification/verify', authController.verifyEmailWithOTP);

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

// ===== Admin routes =====
// All routes below will require admin role
router.use('/admin', adminOnly);

// Admin user management
router.post(
  '/admin/create',
  authController.createAdmin as express.RequestHandler
);
router.get('/admin/id-verifications', authController.getPendingIdVerifications);
router.patch(
  '/admin/id-verification/:userId',
  authController.verifyUserIdDocument
);
router.patch('/admin/ban/:userId', authController.banUser);
router.patch('/admin/unban/:userId', authController.unbanUser);
router.delete('/admin/user/:userId', authController.deleteUser);

export default router;
