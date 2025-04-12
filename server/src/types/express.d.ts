import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      body: any;
      query: any;
      params: any;
      headers: any;
      cookies: any;
      files?: any;
      file?: any;
    }
  }
}

export {};
