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
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            [, token] = req.headers.authorization.split(' ');
        }
        else if (req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Please log in.',
            });
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const user = yield User_1.default.findById(decoded.userId)
                .select('-password')
                .lean();
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found or session expired',
                });
                return;
            }
            if ('active' in user && user.active === false) {
                res.status(403).json({
                    success: false,
                    message: 'Your account has been suspended. Please contact support.',
                });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please log in again.',
                });
                return;
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    message: 'Session expired. Please log in again.',
                });
                return;
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Authentication error:', error instanceof Error ? error.message : error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
        });
    }
});
exports.protect = protect;
const adminOnly = (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Access denied: Admin privileges required',
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin authorization error:', error instanceof Error ? error.message : error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authorization',
        });
    }
};
exports.adminOnly = adminOnly;
