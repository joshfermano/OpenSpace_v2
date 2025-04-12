# Render Deployment Instructions

## TypeScript Configuration

This project uses TypeScript and requires several type definitions to build properly. Follow these steps to ensure a successful deployment:

1. **Installed TypeScript Declaration Files**:
   Make sure the following type declaration packages are installed as dev dependencies:

   ```
   @types/bcrypt
   @types/cookie-parser
   @types/cors
   @types/express
   @types/jsonwebtoken
   @types/multer
   @types/node
   ```

2. **Custom Type Declarations**:
   This project includes custom type declarations in:

   - `src/types/express.d.ts`
   - `src/types/module-declarations.d.ts`

3. **Deployment-specific TypeScript Config**:
   Use the `tsconfig.deploy.json` configuration for builds, which has:
   - Looser type checking rules
   - Explicitly includes required declaration files
   - Proper handling of third-party modules

## Recommended Build Command

Set the build command in Render to:

```
npm install --save-dev @types/express @types/bcrypt @types/cookie-parser @types/cors @types/jsonwebtoken @types/multer @types/node && npm run build
```

Or in your package.json, ensure the build script is:

```json
"build": "tsc -p tsconfig.deploy.json",
```

## Environment Variables

Make sure all required environment variables are properly set in the Render dashboard:

- MongoDB connection string
- JWT secret
- Email provider credentials
- Other service connections

## Post-Deployment Verification

After deployment, check the logs for any TypeScript compilation errors and fix them as needed.
