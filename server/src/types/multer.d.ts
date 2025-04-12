import multer from 'multer';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

declare module 'multer' {
  namespace multer {
    interface FileFilterCallback {
      (error: Error | null, acceptFile: boolean): void;
    }
  }

  interface FileFilterCallback {
    (error: Error | null, acceptFile: boolean): void;
  }
}

export {};
