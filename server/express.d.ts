import {
  Request,
  Response,
  NextFunction,
  CookieOptions,
  Router,
} from 'express';
import { IUser } from './src/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
