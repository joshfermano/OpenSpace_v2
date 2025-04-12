const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Checking for TypeScript errors...');

try {
  // Run TypeScript compiler in noEmit mode to just check for errors
  const result = execSync('npx tsc --noEmit --project tsconfig.deploy.json', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  console.log('No TypeScript errors found!');
} catch (error) {
  console.log('TypeScript errors detected:');
  console.log(error.stdout || error.stderr || error.message);

  // Extract file paths with errors
  const errorLines = (error.stdout || '').split('\n');
  const errorFiles = new Set();

  errorLines.forEach((line) => {
    const match = line.match(/^([^(]+)\(\d+,\d+\):/);
    if (match && match[1]) {
      errorFiles.add(match[1].trim());
    }
  });

  if (errorFiles.size > 0) {
    console.log('\nFiles with errors:');
    Array.from(errorFiles).forEach((file) => console.log(file));
  }
}
