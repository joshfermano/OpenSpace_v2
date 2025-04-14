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
exports.hostOnly = exports.adminOnly = exports.authenticateJWT = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
require("dotenv/config");
// The original protect middleware
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
        else if (req.cookies && req.cookies.token) {
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
        try {
            // Verify token
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined in environment variables');
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            console.log('Token verified, user ID:', decoded.userId, 'role:', decoded.role);
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
            // Make sure the role in the database matches the role in the token
            if (user.role !== decoded.role) {
                console.log('Role mismatch. Token:', decoded.role, 'DB:', user.role);
            }
            // Always use the role from the database
            req.user = user;
            next();
        }
        catch (error) {
            console.error('JWT verification error:', error);
            res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
            });
            return;
        }
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
// Add the authenticateJWT function that's being used in routes
const authenticateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        // Check for token in Authorization header
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Also check in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        // Verify token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Find user by id
        const user = yield User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Check if user is banned
        if (user.active === false) {
            res.status(403).json({
                success: false,
                message: 'Your account has been deactivated',
            });
            return;
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        console.error('JWT authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
});
exports.authenticateJWT = authenticateJWT;
const adminOnly = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
        });
        return;
    }
    if (req.user.role === 'admin') {
        next();
    }
    else {
        console.log('Admin access denied for user:', req.user._id, 'with role:', req.user.role);
        res.status(403).json({
            success: false,
            message: 'Not authorized, admin access required',
        });
    }
};
exports.adminOnly = adminOnly;
// Add hostOnly middleware for host-specific routes
const hostOnly = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
        });
        return;
    }
    if (req.user.role === 'host' || req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            message: 'Host access required',
        });
    }
};
exports.hostOnly = hostOnly;
