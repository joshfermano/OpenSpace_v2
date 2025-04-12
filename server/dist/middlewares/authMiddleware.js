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
exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Note: The type declaration has been moved to the types/express.d.ts file
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        // Check for token in Authorization header
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token found in Authorization header');
        }
        // Also check in cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
            console.log('Token found in cookies');
        }
        if (!token) {
            console.log('No token found in request');
            res.status(401).json({
                success: false,
                message: 'Not authorized, please login',
            });
            return;
        }
        // Log token first 10 chars for debugging
        console.log('Processing token:', token.substring(0, 10) + '...');
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('Token verified, user ID:', decoded.userId);
        // Find user by id
        const user = yield User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            console.log('User not found for ID:', decoded.userId);
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Check if user is banned
        if (user.active === false) {
            console.log('User is banned:', decoded.userId);
            res.status(403).json({
                success: false,
                message: 'Your account has been deactivated',
            });
            return;
        }
        // Attach user to request
        req.user = user;
        console.log('User attached to request, role:', user.role);
        next();
    }
    catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed',
        });
    }
});
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            message: 'Not authorized, admin access required',
        });
    }
};
exports.adminOnly = adminOnly;
