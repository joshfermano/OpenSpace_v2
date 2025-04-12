#!/bin/bash

# Exit on error
set -e

echo "Installing dependencies..."
npm install

echo "Installing TypeScript globally..."
npm install -g typescript

echo "Installing TypeScript type definitions..."
npm install --save-dev @types/express @types/bcrypt @types/cookie-parser @types/cors @types/jsonwebtoken @types/multer @types/node

echo "Building with deployment TypeScript configuration..."
npx tsc -p tsconfig.deploy.json

echo "Creating necessary directories..."
node dist/scripts/create-directories.js

echo "Build completed successfully!"