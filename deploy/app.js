// sPanel Node.js Manager compatible entry point
// This wraps the Next.js standalone server with the correct port/host binding

const path = require('path');
const fs = require('fs');

// Load .env file (standalone mode doesn't auto-load it)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
  console.log('Loaded .env file');
}

// sPanel Node.js Manager sets PORT, or Passenger uses passenger port
const PORT = process.env.PORT || process.env.PASSENGER_BASE_PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

// Set environment variables for the Next.js standalone server
process.env.PORT = String(PORT);
process.env.HOSTNAME = HOSTNAME;
process.env.NODE_ENV = 'production';

// The standalone server.js is in the same directory
const serverPath = path.join(__dirname, 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('ERROR: server.js not found at', serverPath);
  process.exit(1);
}

console.log(`Starting Wilson Premier on port ${PORT}...`);
console.log(`Node.js ${process.version}`);
console.log(`Working directory: ${__dirname}`);

// Load and run the Next.js standalone server
require(serverPath);
