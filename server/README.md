# OpenSpace Server

Backend server for the OpenSpace booking application.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create environment file:
   ```
   cp .env.example .env
   ```
   Then fill in your environment variables.

## Development

Start the development server:

```
npm run dev
```

This will run the server with nodemon, which will automatically restart when you make changes.

## Building for Production

### Option 1: Standard Build

This will compile TypeScript files and keep all dependencies:

```
npm run deploy-build
```

### Option 2: Production Build

This will compile TypeScript files and remove development dependencies:

```
npm run prod-build
```

## TypeScript Type Declarations

Custom type declarations are located in `src/types/`. If you encounter type errors with third-party libraries, check these files:

- `src/types/module-declarations.d.ts`: Contains declarations for libraries without proper TypeScript support
- `src/types/express.d.ts`: Extends Express Request interface
- `src/types/multer.d.ts`: Contains multer-specific declarations like FileFilterCallback
- `src/types/bcrypt.d.ts`: Adds missing bcrypt function declarations
- `src/types/jsonwebtoken.d.ts`: Adds missing JWT interfaces

### Common TypeScript Issues

If you encounter the following error when using multer:

```
Argument of type 'Error' is not assignable to parameter of type 'null'
```

This is caused by how FileFilterCallback is implemented. There are two solutions:

1. Update the code to use null instead of an Error object:

```typescript
// Instead of:
cb(new Error('Not an image! Please upload only images.'), false);

// Use:
cb(null, false);
```

2. Or if you want to show error details, update the module-declarations.d.ts to accept Error:

```typescript
interface FileFilterCallback {
  (error: Error | null, acceptFile: boolean): void;
}
```

## Scripts

- `npm run dev`: Start development server with hot-reloading
- `npm run build`: Compile TypeScript files
- `npm start`: Start the compiled server
- `npm test`: Run tests
- `npm run deploy-build`: Build for deployment environments
- `npm run prod-build`: Build for production with minimal dependencies
