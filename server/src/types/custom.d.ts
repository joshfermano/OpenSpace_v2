import { IUser } from '../models/User';
import { Express } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
