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
exports.validateResetToken = exports.resetPassword = exports.requestPasswordReset = exports.becomeHost = exports.deleteUser = exports.unbanUser = exports.banUser = exports.getPendingIdVerifications = exports.verifyUserIdDocument = exports.uploadIdVerification = exports.verifyPhoneWithOTP = exports.initiatePhoneVerification = exports.sendPhoneVerificationOTP = exports.verifyEmailWithOTP = exports.resendEmailVerification = exports.initiateEmailVerification = exports.sendEmailVerificationOTP = exports.createAdmin = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService_1 = require("../services/emailService");
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const OtpVerification_1 = __importDefault(require("../models/OtpVerification"));
const emailService_2 = require("../services/emailService");
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
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
function ensureAdmin(req, res) {
    const user = ensureAuthenticated(req, res);
    if (!user)
        return null;
    if (user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Not authorized, admin access required',
        });
        return null;
    }
    return user;
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
        const user = yield User_1.default.create({
            email,
            password,
            firstName,
            lastName,
            phoneNumber: phoneNumber || '',
            role: 'user',
            active: true,
            verificationLevel: 'basic',
            isEmailVerified: false,
            isPhoneVerified: true,
            isHostVerified: false,
            savedRooms: [],
        });
        const token = generateToken(user);
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
        };
        const userResponse = user.toObject();
        delete userResponse.password;
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
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
        };
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(200).cookie('token', token, cookieOptions).json({
            success: true,
            message: 'Login successful',
            data: userResponse,
            token,
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
// Get current user
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = ensureAuthenticated(req, res);
        if (!user)
            return;
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message,
        });
    }
});
exports.getCurrentUser = getCurrentUser;
// Create admin user (accessible only by existing admins)
const createAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First ensure the requester is authenticated and is an admin
        const requestingUser = ensureAdmin(req, res);
        if (!requestingUser) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }
        const { email, password, firstName, lastName, phoneNumber, profileImage } = req.body;
        // Check if admin already exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
            return;
        }
        // Create new admin user
        const user = yield User_1.default.create({
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            profileImage: profileImage || '',
            role: 'admin',
            verificationLevel: 'admin',
            isEmailVerified: true,
            isPhoneVerified: true,
        });
        // Change delete operation
        const userResponse = user.toObject();
        userResponse.password = undefined;
        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: userResponse,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating admin user',
            error: error.message,
        });
    }
});
exports.createAdmin = createAdmin;
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
// Resend email verification OTP
const resendEmailVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = ensureAuthenticated(req, res);
        if (!currentUser)
            return;
        const userId = new mongoose_1.default.Types.ObjectId(currentUser._id);
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Send OTP
        const result = yield (0, exports.sendEmailVerificationOTP)(userId, user.email);
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Verification OTP resent to email',
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to resend verification OTP',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resending email verification',
            error: error.message,
        });
    }
});
exports.resendEmailVerification = resendEmailVerification;
// Verify email with OTP
const verifyEmailWithOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            type: 'email',
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
        // Update user's email verification status
        yield User_1.default.findByIdAndUpdate(userId, { isEmailVerified: true });
        // Delete used OTP
        yield OtpVerification_1.default.deleteOne({ _id: otpRecord._id });
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
        });
    }
    catch (error) {
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
        // Update user's ID verification document
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
// Verify user ID document (admin only)
const verifyUserIdDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = ensureAdmin(req, res);
        if (!admin)
            return;
        const { userId, isApproved, rejectionReason } = req.body;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required',
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
        if (!user.identificationDocument) {
            res.status(400).json({
                success: false,
                message: 'User has not uploaded an ID document',
            });
            return;
        }
        if (isApproved) {
            // Approve the ID verification
            user.identificationDocument.verificationStatus = 'approved';
            user.identificationDocument.verificationDate = new Date();
            // If email and phone are also verified, upgrade verification level
            if (user.isEmailVerified && user.isPhoneVerified) {
                user.verificationLevel = 'verified';
            }
        }
        else {
            // Reject the ID verification
            user.identificationDocument.verificationStatus = 'rejected';
            user.identificationDocument.verificationDate = new Date();
            user.identificationDocument.rejectionReason =
                rejectionReason || 'Document verification failed';
        }
        yield user.save();
        res.status(200).json({
            success: true,
            message: `User ID document ${isApproved ? 'approved' : 'rejected'} successfully`,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying user ID document',
            error: error.message,
        });
    }
});
exports.verifyUserIdDocument = verifyUserIdDocument;
// Get list of users with pending ID verification (admin only)
const getPendingIdVerifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = ensureAdmin(req, res);
        if (!admin)
            return;
        const users = yield User_1.default.find({
            'identificationDocument.verificationStatus': 'pending',
        }).select('_id firstName lastName email identificationDocument');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting pending ID verifications',
            error: error.message,
        });
    }
});
exports.getPendingIdVerifications = getPendingIdVerifications;
const banUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = ensureAdmin(req, res);
        if (!admin)
            return;
        const { userId, reason } = req.body;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required',
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
        if (user.role === 'admin') {
            res.status(400).json({
                success: false,
                message: 'Cannot ban an admin user',
            });
            return;
        }
        const userWithBan = user;
        userWithBan.active = false;
        userWithBan.banReason = reason || 'Banned by admin';
        yield userWithBan.save();
        res.status(200).json({
            success: true,
            message: 'User banned successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error banning user',
            error: error.message,
        });
    }
});
exports.banUser = banUser;
const unbanUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = ensureAdmin(req, res);
        if (!admin)
            return;
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required',
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
        const userWithBan = user;
        userWithBan.active = true;
        userWithBan.banReason = undefined;
        yield userWithBan.save();
        res.status(200).json({
            success: true,
            message: 'User unbanned successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error unbanning user',
            error: error.message,
        });
    }
});
exports.unbanUser = unbanUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = ensureAdmin(req, res);
        if (!admin)
            return;
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required',
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
        if (user.role === 'admin') {
            res.status(400).json({
                success: false,
                message: 'Cannot delete an admin user',
            });
            return;
        }
        yield User_1.default.findByIdAndDelete(userId);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message,
        });
    }
});
exports.deleteUser = deleteUser;
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
        // Hash the token before saving to database
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        // Set token expiry (1 hour)
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1);
        // Save to user document
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = tokenExpiry;
        yield user.save();
        try {
            // Send password reset email with token
            yield (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
            res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive a password reset link',
            });
        }
        catch (error) {
            // If email sending fails, clear the reset token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            yield user.save();
            console.error('Error sending password reset email:', error);
            // Don't expose error details to client
            res.status(500).json({
                success: false,
                message: 'There was a problem processing your request',
            });
        }
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing request',
        });
    }
});
exports.requestPasswordReset = requestPasswordReset;
// Reset password with token
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            res.status(400).json({
                success: false,
                message: 'Token and new password are required',
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
        // Hash the token to compare with stored hash
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find user with the token and valid expiry
        const user = yield User_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: new Date() },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
            return;
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        yield user.save();
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully',
        });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
        });
    }
});
exports.resetPassword = resetPassword;
const validateResetToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Token is required',
            });
            return;
        }
        // Hash the token to compare with stored hash
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find user with the token and valid expiry
        const user = yield User_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: new Date() },
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
