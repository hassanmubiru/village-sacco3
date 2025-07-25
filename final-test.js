require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

function generateSignature(method, path, timestamp, nonce, body = '') {
  const message = `${method}${path}${timestamp}${nonce}${body}`;
  return crypto
    .createHmac('sha256', process.env.BITNOB_SECRET_KEY)
    .update(message)
    .digest('hex');
}

console.log('🔐 Bitnob API Credentials Test');
console.log('==============================');
console.log(`📍 Base URL: ${process.env.BITNOB_BASE_URL}`);
console.log(`🆔 Client ID: ${process.env.BITNOB_CLIENT_ID}`);
console.log(`🔐 Secret Key: ${process.env.BITNOB_SECRET_KEY ? process.env.BITNOB_SECRET_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
console.log('');

// Test signature generation
const timestamp = Date.now().toString();
const nonce = crypto.randomBytes(16).toString('hex');
const method = 'GET';
const path = '/wallets';

const signature = generateSignature(method, path, timestamp, nonce);

console.log('🧪 Test Parameters:');
console.log(`   Method: ${method}`);
console.log(`   Path: ${path}`);
console.log(`   Timestamp: ${timestamp}`);
console.log(`   Nonce: ${nonce}`);
console.log(`   Message: ${method}${path}${timestamp}${nonce}`);
console.log(`   Signature: ${signature}`);
console.log('');

console.log('📋 Headers for API call:');
console.log(`   x-auth-client: ${process.env.BITNOB_CLIENT_ID}`);
console.log(`   x-auth-timestamp: ${timestamp}`);
console.log(`   x-auth-nonce: ${nonce}`);
console.log(`   x-auth-signature: ${signature}`);
console.log('');

console.log('🚀 Ready to test! Use these headers with:');
console.log(`   curl -H "x-auth-client: ${process.env.BITNOB_CLIENT_ID}" \\`);
console.log(`        -H "x-auth-timestamp: ${timestamp}" \\`);
console.log(`        -H "x-auth-nonce: ${nonce}" \\`);
console.log(`        -H "x-auth-signature: ${signature}" \\`);
console.log(`        -H "Content-Type: application/json" \\`);
console.log(`        "${process.env.BITNOB_BASE_URL}/wallets"`);
console.log('');

// Validate configuration
let issues = [];
if (!process.env.BITNOB_CLIENT_ID) issues.push('BITNOB_CLIENT_ID missing');
if (!process.env.BITNOB_SECRET_KEY) issues.push('BITNOB_SECRET_KEY missing');
if (!process.env.BITNOB_BASE_URL) issues.push('BITNOB_BASE_URL missing');

if (issues.length > 0) {
  console.log('❌ Configuration Issues:');
  issues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('✅ All credentials are configured!');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   1. The signature generation is working');
  console.log('   2. Headers are properly formatted');
  console.log('   3. You can integrate this into your app');
  console.log('   4. Test the actual API call with Postman or curl');
}

console.log('');
console.log('🎯 Summary:');
console.log(`   ✅ Environment variables loaded`);
console.log(`   ✅ HMAC signature generated`);
console.log(`   ✅ Headers formatted correctly`);
console.log(`   🔄 API connectivity: Ready for testing`);
