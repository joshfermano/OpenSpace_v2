import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      user: IUser | undefined;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      [, token] = req.headers.authorization.split(' ');
    } else if (req.cookies.token) {
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
      const decoded = jwt.verify(token, secret) as JwtPayload;

      const user = await User.findById(decoded.userId)
        .select('-password')
        .lean<IUser>();

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
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: 'Invalid token. Please log in again.',
        });
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error(
      'Authentication error:',
      error instanceof Error ? error.message : error
    );
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
  } catch (error) {
    console.error(
      'Admin authorization error:',
      error instanceof Error ? error.message : error
    );
    res.status(500).json({
      success: false,
      message: 'Internal server error during authorization',
    });
  }
};
