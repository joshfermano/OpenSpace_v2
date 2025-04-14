import express, { Request, Response } from 'express';
import * as authController from '../controllers/authController';
import { protect, authenticateJWT } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, path.join(__dirname, '../uploads/verifications'));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `user-verification-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    // Accept images and PDFs only
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Public routes (no authentication required)
router.post(
  '/register',
  upload.single('governmentId'),
  authController.register
);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/me', authenticateJWT, authController.getCurrentUser);

// Password reset (public)
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.get('/validate-reset-token/:token', authController.validateResetToken);

// Email verification - PUBLIC routes
router.post('/email-verification/verify', (req, res) =>
  authController.verifyEmailWithOTP(req, res)
);

router.post('/email-verification/send', (req: Request, res: Response) => {
  // Extract email from the request body
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  // Get the user ID if available - this route may be used by non-authenticated users
  const userId = req.user?._id || null;

  authController
    .sendEmailVerificationOTP(userId, email)
    .then((success) => {
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Verification email sent successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send verification email',
        });
      }
    })
    .catch((error) => {
      console.error('Error sending verification email:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending verification email',
      });
    });
});

router.post('/email-verification/resend', (req, res) =>
  authController.resendEmailVerification(req, res)
);

// ===== Protected routes (require authentication) =====
router.use(protect);

// Email verification (authenticated)
router.post('/email-verification/initiate', (req, res) =>
  authController.initiateEmailVerification(req, res)
);

// Phone verification (authenticated)
router.post('/phone-verification/initiate', (req, res) =>
  authController.initiatePhoneVerification(req, res)
);

router.post('/phone-verification/verify', (req, res) =>
  authController.verifyPhoneWithOTP(req, res)
);

// ID verification (authenticated)
router.post('/id-verification/upload', upload.single('idImage'), (req, res) =>
  authController.uploadIdVerification(req, res)
);

// Password update (authenticated)
router.post('/update-password', (req, res) =>
  authController.updatePassword(req, res)
);

// Host functionality (authenticated)
router.post('/become-host', (req, res) => authController.becomeHost(req, res));

export default router;
