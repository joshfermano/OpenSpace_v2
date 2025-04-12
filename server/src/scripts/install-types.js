// Script to ensure TypeScript type definitions are properly installed
const { execSync } = require('child_process');

const requiredTypes = [
  '@types/express',
  '@types/bcrypt',
  '@types/cookie-parser',
  '@types/cors',
  '@types/jsonwebtoken',
  '@types/multer',
  '@types/node',
];

console.log('Checking TypeScript type definitions...');

try {
  const command = `npm install --save-dev ${requiredTypes.join(' ')}`;
  console.log(`Installing dependencies: ${command}`);
  execSync(command, { stdio: 'inherit' });
  console.log('TypeScript type definitions installed successfully.');
} catch (error) {
  console.error('Failed to install TypeScript type definitions:', error);
  // Continue with the process even if installation fails
  // as the dependencies might already be installed
}
