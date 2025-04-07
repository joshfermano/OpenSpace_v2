import { IUser } from '../models/User';
import { ObjectId } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
