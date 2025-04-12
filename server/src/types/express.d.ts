import {
  Request,
  Response,
  NextFunction,
  CookieOptions,
  Router,
} from 'express';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export { Request, Response, NextFunction, CookieOptions, Router };
