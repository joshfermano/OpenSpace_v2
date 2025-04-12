const fs = require('fs');
const path = require('path');

// Path to the file to delete
const filePath = path.join(__dirname, '..', '..', 'express.d.ts');

try {
  // Check if file exists before deleting
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Successfully deleted ${filePath}`);
  } else {
    console.log(`File ${filePath} does not exist, no need to delete`);
  }
} catch (error) {
  console.error(`Error deleting file: ${error.message}`);
}
