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

    console.log('Checking authentication...');
    console.log('Cookies:', req.cookies);

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token found in cookies');
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
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

      const decoded = jwt.verify(token, secret) as JwtPayload;
      console.log(
        'Token verified, user ID:',
        decoded.userId,
        'role:',
        decoded.role
      );

      const user = await User.findById(decoded.userId).select('-password');
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

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    console.log('AUTH - Checking cookies:', req.cookies);

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('AUTH - Token found in cookies');
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
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

      const decoded = jwt.verify(token, secret) as JwtPayload;

      const user = await User.findById(decoded.userId).select('-password');
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

      (req as AuthRequest).user = user;
      next();
    } catch (tokenError) {
      console.error('JWT verification error:', tokenError);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('JWT authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
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

export const hostOnly = (
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

  if (req.user.role === 'host' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Host access required',
    });
  }
};

export type { AuthRequest };
