import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Define a custom Request type that includes the user property
interface AuthRequest extends Request {
  user?: IUser;
}

// Note: The type declaration has been moved to the types/express.d.ts file

export const protect = async (
  req: AuthRequest,
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    console.log('Token verified, user ID:', decoded.userId);

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

    // Attach user to request
    req.user = user;
    console.log('User attached to request, role:', user.role);
    next();
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
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized, admin access required',
    });
  }
};
