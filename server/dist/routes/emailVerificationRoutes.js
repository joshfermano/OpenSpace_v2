"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const emailVerificationController_1 = require("../controllers/emailVerificationController");
const router = express_1.default.Router();
// Test email route (for troubleshooting only)
router.post('/test-email', emailVerificationController_1.testEmailDelivery);
// Protected routes (require authentication)
router.post('/send-otp', authMiddleware_1.protect, emailVerificationController_1.sendEmailVerificationOTP);
router.post('/verify-otp', authMiddleware_1.protect, emailVerificationController_1.verifyEmailWithOTP);
router.post('/resend-otp', authMiddleware_1.protect, emailVerificationController_1.resendEmailVerification);
exports.default = router;
