const { execSync } = require('child_process');

console.log('Running custom Vercel build script...');

try {
  // Install TypeScript declarations
  console.log('Installing TypeScript types...');
  execSync(
    'npx -y npm install --save-dev @types/express @types/bcrypt @types/cookie-parser @types/cors @types/jsonwebtoken @types/multer @types/node',
    {
      stdio: 'inherit',
    }
  );

  // Run TypeScript compiler using npx
  console.log('Compiling TypeScript...');
  execSync('npx tsc -p tsconfig.deploy.json', {
    stdio: 'inherit',
  });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build error:', error.message);
  process.exit(1);
}
