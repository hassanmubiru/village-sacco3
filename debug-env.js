require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Debug ===');
console.log('Raw dotenv result:', require('dotenv').config({ path: '.env.local' }));
console.log('\nBITNOB Environment Variables:');
console.log('BITNOB_CLIENT_ID:', JSON.stringify(process.env.BITNOB_CLIENT_ID));
console.log('BITNOB_SECRET_KEY:', process.env.BITNOB_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('BITNOB_BASE_URL:', process.env.BITNOB_BASE_URL);

console.log('\nAll environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('BITNOB')) {
    console.log(`${key}:`, JSON.stringify(process.env[key]));
  }
});

console.log('\nFile content check:');
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('BITNOB_CLIENT_ID')) {
    console.log(`Line ${index + 1}:`, JSON.stringify(line));
  }
});
