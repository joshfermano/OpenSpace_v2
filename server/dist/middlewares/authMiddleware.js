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
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        console.log('Checking authentication...');
        console.log('Cookies:', req.cookies);
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log('Token found in cookies');
        }
        else if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token found in Authorization header');
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
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined in environment variables');
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            console.log('Token verified, user ID:', decoded.userId, 'role:', decoded.role);
            const user = yield User_1.default.findById(decoded.userId).select('-password');
            if (!user) {
                console.log('User not found for ID:', decoded.userId);
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            if (user.active === false) {
                console.log('User is banned:', decoded.userId);
                res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated',
                });
                return;
            }
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
const authenticateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        console.log('AUTH - Checking cookies:', req.cookies);
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log('AUTH - Token found in cookies');
        }
        else if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('AUTH - Token found in Authorization header');
        }
        if (!token) {
            console.log('AUTH - No token found in request');
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined in environment variables');
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const user = yield User_1.default.findById(decoded.userId).select('-password');
            if (!user) {
                console.log('User not found with ID:', decoded.userId);
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            if (user.active === false) {
                res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated',
                });
                return;
            }
            req.user = user;
            next();
        }
        catch (tokenError) {
            console.error('JWT verification error:', tokenError);
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }
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
