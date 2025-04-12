import { IUser } from '../models/User';

// Re-export everything from express, then add our customizations
declare module 'express' {
  interface Request {
    user?: IUser;
  }
}

// This ensures the module is treated as a module declaration
export {};