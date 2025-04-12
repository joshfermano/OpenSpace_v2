const fs = require('fs');
const path = require('path');

console.log('Copying express.d.ts to src/types directory...');

// Ensure the target directory exists
const targetDir = path.join(__dirname, '..', 'types');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Source and destination paths
const sourcePath = path.join(__dirname, '..', '..', 'express.d.ts');
const targetPath = path.join(targetDir, 'express.d.ts');

try {
  // Read the source file
  const content = fs.readFileSync(sourcePath, 'utf8');

  // Fix the import path to be relative to the new location
  const fixedContent = content.replace(
    "import { IUser } from './src/models/User';",
    "import { IUser } from '../models/User';"
  );

  // Write the fixed content to the target file
  fs.writeFileSync(targetPath, fixedContent);
  console.log(`Successfully copied and fixed express.d.ts to ${targetPath}`);
} catch (error) {
  console.error(`Error copying file: ${error.message}`);
  process.exit(1);
}
