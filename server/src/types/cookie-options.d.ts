declare interface CustomCookieOptions {
  sameSite: 'strict' | 'lax' | 'none' | boolean;
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
  path?: string;
}

export {};
