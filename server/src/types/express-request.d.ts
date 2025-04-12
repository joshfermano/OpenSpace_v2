import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id?: string;
        email?: string;
        role?: string;
        isVerified?: boolean;
      } & Partial<IUser>;
    }
  }
}

export {};
