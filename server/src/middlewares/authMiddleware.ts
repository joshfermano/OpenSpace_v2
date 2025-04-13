import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import 'dotenv/config';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

type AuthRequest = Request & {
  user?: any;
};

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
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

      const decoded = jwt.verify(token, secret) as JwtPayload;
      console.log(
        'Token verified, user ID:',
        decoded.userId,
        'role:',
        decoded.role
      );

      // Find user by id
      const user = await User.findById(decoded.userId).select('-password');
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
      (req as AuthRequest).user = user;
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
      return;
    }
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    console.log(
      'Admin access denied for user:',
      req.user._id,
      'with role:',
      req.user.role
    );
    res.status(403).json({
      success: false,
      message: 'Not authorized, admin access required',
    });
  }
};

export type { AuthRequest };
