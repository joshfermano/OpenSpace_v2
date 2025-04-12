#!/bin/bash

# Exit on error
set -e

echo "====== Starting Render Build Process ======"

echo "Node version:"
node --version

echo "NPM version:"
npm --version

echo "Installing dependencies..."
npm install

# Make TypeScript available globally to ensure it's accessible during build
echo "Installing TypeScript globally..."
npm install -g typescript

echo "Running TypeScript build..."
npx tsc -p tsconfig.deploy.json

echo "Creating required directories..."
node dist/scripts/create-directories.js

echo "====== Build completed successfully! ======"