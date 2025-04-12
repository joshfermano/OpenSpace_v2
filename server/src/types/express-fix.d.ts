import { IUser } from '../models/User';

// Re-export everything from express
import * as express from 'express';
export = express;

// Add our customizations
declare module 'express' {
  interface Request {
    user?: IUser;
  }
}