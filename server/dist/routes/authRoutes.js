"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController = __importStar(require("../controllers/authController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../uploads/verifications'));
    },
    filename: (req, file, cb) => {
        cb(null, `user-verification-${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    fileFilter: (_req, file, cb) => {
        // Accept images and PDFs only
        if (file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
});
// Public routes (no authentication required)
router.post('/register', upload.single('governmentId'), authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/me', authMiddleware_1.authenticateJWT, authController.getCurrentUser);
// Password reset (public)
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.get('/validate-reset-token/:token', authController.validateResetToken);
// Email verification - PUBLIC routes
router.post('/email-verification/verify', (req, res) => authController.verifyEmailWithOTP(req, res));
router.post('/email-verification/send', (req, res) => {
    var _a;
    // Extract email from the request body
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required',
        });
    }
    // Get the user ID if available - this route may be used by non-authenticated users
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || null;
    authController
        .sendEmailVerificationOTP(userId, email)
        .then((success) => {
        if (success) {
            res.status(200).json({
                success: true,
                message: 'Verification email sent successfully',
            });
        }
        else {
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
router.post('/email-verification/resend', (req, res) => authController.resendEmailVerification(req, res));
// ===== Protected routes (require authentication) =====
router.use(authMiddleware_1.protect);
// Email verification (authenticated)
router.post('/email-verification/initiate', (req, res) => authController.initiateEmailVerification(req, res));
// Phone verification (authenticated)
router.post('/phone-verification/initiate', (req, res) => authController.initiatePhoneVerification(req, res));
router.post('/phone-verification/verify', (req, res) => authController.verifyPhoneWithOTP(req, res));
// ID verification (authenticated)
router.post('/id-verification/upload', upload.single('idImage'), (req, res) => authController.uploadIdVerification(req, res));
// Password update (authenticated)
router.post('/update-password', (req, res) => authController.updatePassword(req, res));
// Host functionality (authenticated)
router.post('/become-host', (req, res) => authController.becomeHost(req, res));
exports.default = router;
