#!/bin/bash

# Exit on error
set -e

echo "Installing TypeScript type definitions..."
npm install --save-dev @types/express @types/bcrypt @types/cookie-parser @types/cors @types/jsonwebtoken @types/multer @types/node

echo "Building with deployment TypeScript configuration..."
npm run build

echo "Build completed successfully!" 