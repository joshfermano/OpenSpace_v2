const os = require('os');
const { execSync } = require('child_process');

console.log('=== Environment Debug Info ===');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${os.platform()}`);
console.log(`Architecture: ${os.arch()}`);
console.log(`CPU: ${os.cpus()[0].model}`);

try {
  console.log('=== System Info ===');
  console.log(execSync('uname -a').toString());
  console.log('=== GCC Version ===');
  console.log(execSync('gcc --version').toString());
  console.log('=== Python Version ===');
  console.log(execSync('python --version').toString());
} catch (error) {
  console.log('Error running system commands:', error.message);
}

console.log('=== Environment Variables ===');
console.log(JSON.stringify(process.env, null, 2));
