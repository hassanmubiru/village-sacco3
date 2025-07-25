require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const axios = require('axios');

function generateSignature(method, path, timestamp, nonce, body = '') {
  const message = `${method}${path}${timestamp}${nonce}${body}`;
  return crypto
    .createHmac('sha256', process.env.BITNOB_SECRET_KEY)
    .update(message)
    .digest('hex');
}

async function testBitnobAPI() {
  console.log('🚀 Bitnob API Authentication Test');
  console.log('=======================================');
  console.log(`📍 Base URL: ${process.env.BITNOB_BASE_URL}`);
  console.log(`🆔 Client ID: ${process.env.BITNOB_CLIENT_ID}`);
  console.log(`🔐 Secret Key: ${process.env.BITNOB_SECRET_KEY ? '***configured***' : '❌ MISSING'}`);
  console.log('');

  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Test endpoints that we know exist (return 401 when unauthenticated)
  const endpoints = [
    { path: '/wallets', description: 'Get user wallets' },
    { path: '/transactions', description: 'Get transactions' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`🧪 Testing: ${endpoint.description}`);
    console.log(`   Endpoint: ${endpoint.path}`);
    
    try {
      const signature = generateSignature('GET', endpoint.path, timestamp, nonce);
      
      console.log(`   🔐 HMAC Signature: ${signature.substring(0, 16)}...`);
      console.log(`   🕒 Timestamp: ${timestamp}`);
      console.log(`   🎲 Nonce: ${nonce.substring(0, 8)}...`);
      
      const response = await axios.get(`${process.env.BITNOB_BASE_URL}${endpoint.path}`, {
        headers: {
          'x-auth-client': process.env.BITNOB_CLIENT_ID,
          'x-auth-timestamp': timestamp,
          'x-auth-nonce': nonce,
          'x-auth-signature': signature,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });
      
      console.log(`   ✅ SUCCESS! Status: ${response.status}`);
      console.log(`   📊 Response:`, JSON.stringify(response.data, null, 2));
      console.log('');
      
      return true; // Authentication successful
      
    } catch (error) {
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📄 Response:`, JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 401) {
          console.log(`   🔍 Authentication failed - check credentials`);
        } else if (error.response.status === 403) {
          console.log(`   🔒 Forbidden - check permissions`);
        } else if (error.response.status === 200 || error.response.status === 404) {
          console.log(`   ✅ Unexpected success or valid error`);
        }
      } else {
        console.log(`   💀 Network Error: ${error.message}`);
      }
      console.log('');
    }
  }
  
  return false;
}

// Helper function to verify signature generation
function verifySignatureGeneration() {
  console.log('🔧 Signature Generation Verification');
  console.log('====================================');
  
  const testData = {
    method: 'GET',
    path: '/wallets',
    timestamp: '1640995200000',
    nonce: 'test-nonce-12345',
    body: ''
  };
  
  const message = `${testData.method}${testData.path}${testData.timestamp}${testData.nonce}${testData.body}`;
  console.log(`Message to sign: "${message}"`);
  
  const signature = crypto
    .createHmac('sha256', process.env.BITNOB_SECRET_KEY)
    .update(message)
    .digest('hex');
    
  console.log(`Generated signature: ${signature}`);
  console.log('');
}

async function main() {
  // First verify signature generation
  verifySignatureGeneration();
  
  // Then test the API
  const success = await testBitnobAPI();
  
  if (success) {
    console.log('🎉 SUCCESS! Your Bitnob API setup is working correctly!');
    console.log('');
    console.log('✅ Next steps:');
    console.log('   1. Your credentials are valid');
    console.log('   2. HMAC signature generation is working');
    console.log('   3. You can now integrate Bitnob services into your app');
  } else {
    console.log('❌ Setup needs attention. Please check:');
    console.log('   1. Your Bitnob sandbox account is active');
    console.log('   2. Client ID and Secret Key are correct');
    console.log('   3. Your account has the necessary permissions');
    console.log('');
    console.log('💡 Tip: Contact Bitnob support if credentials are correct but still failing');
  }
}

main().catch(console.error);
