const fs = require('fs');
const path = require('path');

// Function to list all TypeScript files in a directory recursively
function listTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fileList = listTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to replace bcrypt with bcryptjs in a file
function replaceBcryptInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Replace import statements
    content = content.replace(
      /import\s+\*\s+as\s+bcrypt\s+from\s+['"]bcrypt['"]/g,
      "import * as bcrypt from 'bcryptjs'"
    );
    content = content.replace(
      /import\s+{\s*([^}]*)\s*}\s+from\s+['"]bcrypt['"]/g,
      "import { $1 } from 'bcryptjs'"
    );
    content = content.replace(
      /import\s+bcrypt\s+from\s+['"]bcrypt['"]/g,
      "import bcrypt from 'bcryptjs'"
    );

    // Replace require statements
    content = content.replace(
      /require\(['"]bcrypt['"]\)/g,
      "require('bcryptjs')"
    );

    // If content was changed, write back to the file
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated bcrypt imports in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main execution
console.log('Replacing bcrypt with bcryptjs in source files...');
const srcDir = path.join(__dirname, '..');
const tsFiles = listTsFiles(srcDir);

let updatedCount = 0;
tsFiles.forEach((file) => {
  if (replaceBcryptInFile(file)) {
    updatedCount++;
  }
});

console.log(`Replaced bcrypt with bcryptjs in ${updatedCount} files.`);
