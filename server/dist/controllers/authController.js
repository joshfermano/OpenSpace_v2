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
exports.updatePassword = exports.resetPassword = exports.validateResetToken = exports.requestPasswordReset = exports.becomeHost = exports.uploadIdVerification = exports.verifyPhoneWithOTP = exports.initiatePhoneVerification = exports.sendPhoneVerificationOTP = exports.verifyEmailWithOTP = exports.resendEmailVerification = exports.initiateEmailVerification = exports.sendEmailVerificationOTP = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const imageService_1 = require("../services/imageService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService_1 = require("../services/emailService");
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const OtpVerification_1 = __importDefault(require("../models/OtpVerification"));
const emailService_2 = require("../services/emailService");
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
function ensureAuthenticated(req, res) {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
        });
        return null;
    }
    return req.user;
}
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
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Request body:', req.body);
        const { email, password, firstName, lastName, phoneNumber } = req.body;
        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields: email, password, firstName, lastName',
            });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
            return;
        }
        // Validate password strength
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long',
            });
            return;
        }
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
            return;
        }
        // Create user data
        const userData = {
            email,
            password,
            firstName,
            lastName,
            phoneNumber: phoneNumber || '',
            role: 'user',
            active: true,
            verificationLevel: 'basic',
            isEmailVerified: false,
            isPhoneVerified: false, // This should be false initially
            isHostVerified: false,
            savedRooms: [],
        };
        if (req.file) {
            // Upload file to Supabase
            const supabaseImageUrl = yield (0, imageService_1.uploadImage)(req.file.path, 'verifications', `user-id-${Date.now()}-${path_1.default.basename(req.file.originalname)}`);
            if (supabaseImageUrl) {
                userData.identificationDocument = {
                    idType: 'Passport',
                    idNumber: 'Pending Review',
                    idImage: supabaseImageUrl,
                    uploadDate: new Date(),
                    verificationStatus: 'pending',
                };
            }
            else {
                console.error('Failed to upload ID to Supabase, using local path as fallback');
                userData.identificationDocument = {
                    idType: 'Passport',
                    idNumber: 'Pending Review',
                    idImage: req.file.path, // Fallback to local path
                    uploadDate: new Date(),
                    verificationStatus: 'pending',
                };
            }
        }
        const user = yield User_1.default.create(userData);
        // Generate JWT token
        const token = generateToken(user);
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        };
        const userResponse = user.toObject();
        delete userResponse.password;
        // Send verification email
        yield (0, exports.sendEmailVerificationOTP)(user._id, user.email);
        res
            .status(201)
            .cookie('token', token, cookieOptions)
            .json({
            success: true,
            message: 'Registration successful',
            data: userResponse,
            token,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration',
            error: error.message,
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        // Check if account is active
        if (user.active === false) {
            res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.',
            });
            return;
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        const token = generateToken(user);
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        };
        const userResponse = user.toObject();
        delete userResponse.password;
        console.log(`User logged in: ${user.email} with role: ${user.role}`);
        res.status(200).cookie('token', token, cookieOptions).json({
            success: true,
            message: 'Login successful',
            data: userResponse,
            token, // Include token in response for localStorage
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message,
        });
    }
});
exports.login = login;
const logout = (_req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
exports.logout = logout;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }
        // Return a fresh copy of the user
        const freshUser = yield User_1.default.findById(req.user._id).select('-password');
        if (!freshUser) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: freshUser,
        });
    }
    catch (error) {
        console.error('Error in getCurrentUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message,
        });
    }
});
exports.getCurrentUser = getCurrentUser;
// Send email verification OTP
const sendEmailVerificationOTP = (userId, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set expiry time (10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        // Delete any existing OTPs for this user and type
        yield OtpVerification_1.default.deleteMany({ user: userId, type: 'email' });
        // Create new OTP verification record
        yield OtpVerification_1.default.create({
            user: userId,
            otp,
            type: 'email',
            expiresAt,
        });
        // Send verification email
        yield (0, emailService_2.sendVerificationEmail)(email, otp, otp);
        return true;
    }
    catch (error) {
        console.error('Error sending email verification OTP:', error);
        return false;
    }
});
exports.sendEmailVerificationOTP = sendEmailVerificationOTP;
// Initiate email verification
const initiateEmailVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = ensureAuthenticated(req, res);
        if (!currentUser)
            return;
        const userId = new mongoose_1.default.Types.ObjectId(currentUser._id);
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // If email is different from current email, update it
        if (email !== user.email) {
            user.email = email;
            user.isEmailVerified = false;
            yield user.save();
        }
        // Send OTP
        const result = yield (0, exports.sendEmailVerificationOTP)(userId, email);
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Verification OTP sent to email',
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to send verification OTP',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error initiating email verification',
            error: error.message,
        });
    }
});
exports.initiateEmailVerification = initiateEmailVerification;
const resendEmailVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If we have a logged-in user, use their details
        if (req.user) {
            const userId = new mongoose_1.default.Types.ObjectId(req.user._id);
            const email = req.user.email;
            const result = yield (0, exports.sendEmailVerificationOTP)(userId, email);
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Verification OTP sent to email',
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send verification OTP',
                });
            }
            return;
        }
        // For cases where we don't have a logged-in user but have the email in the request
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required for unauthenticated verification',
            });
            return;
        }
        // Find user by email
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found with this email',
            });
            return;
        }
        // Check if email is already verified
        if (user.isEmailVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
            return;
        }
        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // OTP expires in 15 minutes
        // Store OTP in database
        yield OtpVerification_1.default.findOneAndUpdate({ user: user._id, type: 'email' }, {
            otp,
            expiresAt,
        }, { upsert: true, new: true });
        const sendOtpVerificationEmail = (email, firstName, otp) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, emailService_2.sendVerificationEmail)(email, firstName, otp);
                return true;
            }
            catch (error) {
                console.error('Error sending verification email:', error);
                return false;
            }
        });
        // Send verification email with OTP
        yield sendOtpVerificationEmail(user.email, user.firstName, otp);
        res.status(200).json({
            success: true,
            message: 'Verification OTP resent successfully',
        });
    }
    catch (error) {
        console.error('Resend email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification OTP',
            error: error.message,
        });
    }
});
exports.resendEmailVerification = resendEmailVerification;
// Verify email with OTP
const verifyEmailWithOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }
        const { otp } = req.body;
        if (!otp) {
            res.status(400).json({
                success: false,
                message: 'OTP is required',
            });
            return;
        }
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
        if (otpRecord.expiresAt < new Date()) {
            yield OtpVerification_1.default.deleteOne({ _id: otpRecord._id });
            res.status(400).json({
                success: false,
                message: 'OTP has expired, please request a new one',
            });
            return;
        }
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
        yield OtpVerification_1.default.deleteOne({ _id: otpRecord._id });
        const token = generateToken(user);
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        };
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            token,
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
// Send phone verification OTP
const sendPhoneVerificationOTP = (userId, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set expiry time (10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        // Delete any existing OTPs for this user and type
        yield OtpVerification_1.default.deleteMany({ user: userId, type: 'phone' });
        // Create new OTP verification record
        yield OtpVerification_1.default.create({
            user: userId,
            otp,
            type: 'phone',
            expiresAt,
        });
        // In a real application, you would send an SMS here
        console.log(`[SMS SIMULATION] Sending OTP ${otp} to ${phoneNumber}`);
        return true;
    }
    catch (error) {
        console.error('Error sending phone verification OTP:', error);
        return false;
    }
});
exports.sendPhoneVerificationOTP = sendPhoneVerificationOTP;
// Initiate phone verification
const initiatePhoneVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = ensureAuthenticated(req, res);
        if (!currentUser)
            return;
        const userId = new mongoose_1.default.Types.ObjectId(currentUser._id);
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            res.status(400).json({
                success: false,
                message: 'Phone number is required',
            });
            return;
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (phoneNumber !== user.phoneNumber) {
            user.phoneNumber = phoneNumber;
            user.isPhoneVerified = false;
            yield user.save();
        }
        // Send OTP
        const result = yield (0, exports.sendPhoneVerificationOTP)(userId, phoneNumber);
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Verification OTP sent to phone',
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to send verification OTP',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error initiating phone verification',
            error: error.message,
        });
    }
});
exports.initiatePhoneVerification = initiatePhoneVerification;
// Verify phone with OTP
const verifyPhoneWithOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = ensureAuthenticated(req, res);
        if (!user)
            return;
        const userId = user._id;
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
            user: userId,
            type: 'phone',
            otp,
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
        // Update user's phone verification status
        yield User_1.default.findByIdAndUpdate(userId, { isPhoneVerified: true });
        // Delete used OTP
        yield OtpVerification_1.default.deleteOne({ _id: otpRecord._id });
        res.status(200).json({
            success: true,
            message: 'Phone verified successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying phone',
            error: error.message,
        });
    }
});
exports.verifyPhoneWithOTP = verifyPhoneWithOTP;
const uploadIdVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = ensureAuthenticated(req, res);
        if (!user)
            return;
        const userId = user._id;
        const { idType, idNumber, idImage } = req.body;
        if (!idType || !idNumber || !idImage) {
            res.status(400).json({
                success: false,
                message: 'ID type, number, and image are required',
            });
            return;
        }
        const userDoc = yield User_1.default.findById(userId);
        if (!userDoc) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        userDoc.identificationDocument = {
            idType,
            idNumber,
            idImage,
            uploadDate: new Date(),
            verificationStatus: 'pending',
        };
        yield userDoc.save();
        res.status(200).json({
            success: true,
            message: 'ID verification document uploaded successfully, pending approval',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading ID verification',
            error: error.message,
        });
    }
});
exports.uploadIdVerification = uploadIdVerification;
const becomeHost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }
        const { bio, languagesSpoken } = req.body;
        if (req.user.verificationLevel !== 'verified') {
            res.status(400).json({
                success: false,
                message: 'User must be fully verified to become a host',
            });
            return;
        }
        req.user.role = 'host';
        req.user.hostInfo = {
            bio: bio || '',
            languagesSpoken: languagesSpoken || [],
            hostSince: new Date(),
        };
        yield req.user.save();
        res.status(200).json({
            success: true,
            message: 'Successfully upgraded to host',
            user: Object.assign(Object.assign({}, req.user.toObject()), { password: undefined }),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error becoming a host',
            error: error.message,
        });
    }
});
exports.becomeHost = becomeHost;
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }
        // Find user by email
        const user = yield User_1.default.findOne({ email });
        // Standardize response time to prevent timing attacks
        if (!user) {
            yield new Promise((resolve) => setTimeout(resolve, 500));
            res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive a password reset link',
            });
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        // Hash token before saving to database
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        // Set token and expiry
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        yield user.save();
        try {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            yield (0, emailService_1.sendPasswordResetEmail)(user.email, resetUrl);
            res.status(200).json({
                success: true,
                message: 'Password reset email sent',
            });
        }
        catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            yield user.save();
            res.status(500).json({
                success: false,
                message: 'Email could not be sent',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error requesting password reset',
            error: error.message,
        });
    }
});
exports.requestPasswordReset = requestPasswordReset;
const validateResetToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        // Hash the token from the URL
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find user with matching token and valid expiry
        const user = yield User_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: {
                email: user.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating reset token',
            error: error.message,
        });
    }
});
exports.validateResetToken = validateResetToken;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            res.status(400).json({
                success: false,
                message: 'Token and password are required',
            });
            return;
        }
        // Validate password strength
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long',
            });
            return;
        }
        // Hash the token from the request
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find user with matching token and valid expiry
        const user = yield User_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
            return;
        }
        // Update password and clear reset token fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        yield user.save();
        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message,
        });
    }
});
exports.resetPassword = resetPassword;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Since this is now in the protected routes section, req.user should be available
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const user = req.user; // Cast to your User interface type
        const { currentPassword, newPassword } = req.body;
        // Validate required fields
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
            return;
        }
        // Validate password strength
        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long',
            });
            return;
        }
        // Regex for password requirements
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        if (!hasUpperCase || !hasNumber || !hasSpecial) {
            res.status(400).json({
                success: false,
                message: 'Password must contain at least one uppercase letter, one number, and one special character',
            });
            return;
        }
        // Check if new password is same as current
        if (currentPassword === newPassword) {
            res.status(400).json({
                success: false,
                message: 'New password cannot be the same as current password',
            });
            return;
        }
        // Find the user with password
        const userWithPassword = yield User_1.default.findById(user._id).select('+password');
        if (!userWithPassword) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Verify current password
        const isMatch = yield userWithPassword.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
            return;
        }
        // Update password
        userWithPassword.password = newPassword;
        yield userWithPassword.save();
        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    }
    catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password',
            error: error.message,
        });
    }
});
exports.updatePassword = updatePassword;
