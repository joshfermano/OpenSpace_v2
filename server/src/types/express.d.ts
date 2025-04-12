import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Re-export express module to make it accessible
import * as express from 'express';
export = express;
