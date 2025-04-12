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
const emailVerificationController = __importStar(require("../controllers/emailVerificationController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
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
router.post('/email-verification/verify', emailVerificationController.verifyEmailWithOTP);
router.post('/email-verification/send', emailVerificationController.sendEmailVerificationOTP);
router.post('/email-verification/resend', emailVerificationController.resendEmailVerification);
// ===== Protected routes (require authentication) =====
router.use(authMiddleware_1.protect); // Apply authentication middleware to all routes below
// User profile
router.get('/me', authController.getCurrentUser);
// Password update (for authenticated users)
router.post('/update-password', authController.updatePassword);
// Protected email verification routes (for already authenticated users)
router.post('/email-verification/initiate', authController.initiateEmailVerification);
// Phone verification
router.post('/phone-verification/initiate', authController.initiatePhoneVerification);
router.post('/phone-verification/verify', authController.verifyPhoneWithOTP);
// ID verification
router.post('/id-verification/upload', authController.uploadIdVerification);
// Host functionality
router.post('/become-host', authController.becomeHost);
exports.default = router;
