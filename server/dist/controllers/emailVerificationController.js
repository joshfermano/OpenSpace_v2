"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailDelivery = exports.verifyEmailWithOTP = exports.resendEmailVerification = exports.sendEmailVerificationOTP = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const OtpVerification_1 = __importDefault(require("../models/OtpVerification"));
const emailService_1 = require("../services/emailService");
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jsonwebtoken_1.default.sign({
        userId: user._id,
        email: user.email,
        role: user.role,
    }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
};
// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Helper function to safely get and verify the user
const verifyUserAuth = (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
        });
        return null;
    }
    return req.user;
};
// Send OTP for email verification
const sendEmailVerificationOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Send OTP endpoint called');
        console.log('Request cookies:', req.cookies);
        console.log('Authorization header:', req.headers.authorization);
        // Get authenticated user
        const user = verifyUserAuth(req, res);
        if (!user)
            return;
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
        const otpRecord = yield OtpVerification_1.default.findOneAndUpdate({ user: user._id, type: 'email' }, {
            otp,
            expiresAt,
        }, { upsert: true, new: true });
        console.log('OTP stored in database with ID:', otpRecord._id);
        console.log('Sending verification email with OTP');
        try {
            // Send the verification email with OTP
            yield (0, emailService_1.sendOtpVerificationEmail)(user.email, user.firstName, otp);
            console.log('OTP email sent successfully');
        }
        catch (emailError) {
            console.error('Error sending OTP email, but continuing:', emailError);
            // We'll continue even if email sending fails,
            // since we've already stored the OTP in the database
        }
        console.log('OTP process completed successfully');
        res.status(200).json(Object.assign({ success: true, message: 'Verification OTP sent successfully' }, (process.env.NODE_ENV !== 'production' ? { otp } : {})));
    }
    catch (error) {
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
});
exports.sendEmailVerificationOTP = sendEmailVerificationOTP;
// Resend verification OTP (alias for sendEmailVerificationOTP)
const resendEmailVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.sendEmailVerificationOTP)(req, res);
});
exports.resendEmailVerification = resendEmailVerification;
const verifyEmailWithOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        if (!otp) {
            res.status(400).json({
                success: false,
                message: 'OTP is required',
            });
            return;
        }
        // Find the OTP record
        const otpRecord = yield OtpVerification_1.default.findOne({
            otp,
            type: 'email',
        });
        if (!otpRecord) {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
            return;
        }
        // Check if OTP is expired
        if (otpRecord.expiresAt < new Date()) {
            yield OtpVerification_1.default.deleteOne({ _id: otpRecord._id });
            res.status(400).json({
                success: false,
                message: 'OTP has expired, please request a new one',
            });
            return;
        }
        // Find the user associated with this OTP
        const user = yield User_1.default.findById(otpRecord.user);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        user.isEmailVerified = true;
        yield user.save();
        // Delete used OTP
        yield OtpVerification_1.default.deleteOne({ _id: otpRecord._id });
        // Generate new token using our local function instead of importing
        const token = generateToken(user);
        // Set the token in a cookie
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
            path: '/',
        };
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
        });
    }
    catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying email',
            error: error.message,
        });
    }
});
exports.verifyEmailWithOTP = verifyEmailWithOTP;
// Test email delivery (for troubleshooting)
const testEmailDelivery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield (0, emailService_1.sendTestEmail)(email);
        res.status(200).json({
            success: true,
            message: `Test email sent successfully to ${email}`,
        });
    }
    catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message,
        });
    }
});
exports.testEmailDelivery = testEmailDelivery;
