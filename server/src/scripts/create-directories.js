// Script to create necessary upload directories after build on Render
const fs = require('fs');
const path = require('path');

console.log('Creating upload directories...');

const directories = [
  './dist/uploads',
  './dist/uploads/rooms',
  './dist/uploads/profiles',
  './dist/uploads/reviews',
  './dist/uploads/verifications',
  './public/uploads',
  './public/uploads/profiles',
  './tmp',
];

directories.forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory exists: ${dir}`);
    }
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error);
  }
});

console.log('Directory creation completed.');
