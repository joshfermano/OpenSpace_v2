#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Installing TypeScript declaration files...');

const typePackages = [
  '@types/express',
  '@types/bcrypt',
  '@types/cookie-parser',
  '@types/cors',
  '@types/jsonwebtoken',
  '@types/multer',
  '@types/node',
];

try {
  execSync(`npm install --save-dev ${typePackages.join(' ')}`, {
    stdio: 'inherit',
  });
  console.log('Successfully installed TypeScript declaration files');
} catch (error) {
  console.error(
    'Error installing TypeScript declaration files:',
    error.message
  );
  process.exit(1);
}
