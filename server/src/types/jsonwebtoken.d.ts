import jwt from 'jsonwebtoken';

declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    algorithm?: string;
    header?: object;
    encoding?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    keyid?: string;
    mutatePayload?: boolean;
    allowInsecureKeySizes?: boolean;
    allowInvalidAsymmetricKeyTypes?: boolean;
  }
}
