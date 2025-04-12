import { IUser } from '../models/User';

declare global {
  namespace Express {
    // Extend the Request interface
    interface Request {
      user?: IUser;
      query: any;
      body: any;
      params: any;
      cookies: any;
      headers: any;
      files?: any;
      file?: any;
    }
  }
}

export {};
