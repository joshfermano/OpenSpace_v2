const fs = require('fs');
const path = require('path');

console.log('Copying express.d.ts to src/types directory...');

// Ensure the target directory exists
const targetDir = path.join(__dirname, '..', 'types');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Write a proper module declaration file
const fixPath = path.join(targetDir, 'express-fix.d.ts');
const fixContent = `import { IUser } from '../models/User';

// Re-export everything from express
import * as express from 'express';
export = express;

// Add our customizations
declare module 'express' {
  interface Request {
    user?: IUser;
  }
}`;

// Also update the standard express.d.ts
const expressPath = path.join(targetDir, 'express.d.ts');
const expressContent = `import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
}

// Re-export express module to make it accessible
import * as express from 'express';
export = express;`;

try {
  // Write both files
  fs.writeFileSync(fixPath, fixContent);
  fs.writeFileSync(expressPath, expressContent);
  console.log(`Successfully created express-fix.d.ts at ${fixPath}`);
  console.log(`Successfully created express.d.ts at ${expressPath}`);
} catch (error) {
  console.error(`Error creating file: ${error.message}`);
  process.exit(1);
}
