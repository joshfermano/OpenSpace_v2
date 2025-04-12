const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Temporarily modify tsconfig.deploy.json to ignore type errors
const tsconfigPath = path.join(__dirname, 'tsconfig.deploy.json');
const tsconfig = require(tsconfigPath);

// Save the original config
const originalConfig = JSON.stringify(tsconfig, null, 2);

// Modify the config to ignore type errors
tsconfig.compilerOptions.noEmitOnError = false;
tsconfig.compilerOptions.skipLibCheck = true;

// Write the modified config
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

// Run the TypeScript compiler
console.log('Building with relaxed type checking...');
exec('tsc -p tsconfig.deploy.json', (error, stdout, stderr) => {
  // Restore the original config
  fs.writeFileSync(tsconfigPath, originalConfig);

  if (error) {
    console.error(`Build error: ${error.message}`);
    console.error('Standard output:', stdout);
    console.error('Standard error:', stderr);
    return;
  }

  console.log('Build completed successfully.');
  console.log(stdout);

  if (stderr) {
    console.error(stderr);
  }
});
