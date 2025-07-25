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

async function testBitnobEndpoints() {
  console.log('🔍 Comprehensive Bitnob API Test');
  console.log('================================');
  console.log(`📍 Base URL: ${process.env.BITNOB_BASE_URL}`);
  console.log(`🆔 Client ID: ${process.env.BITNOB_CLIENT_ID}`);
  console.log(`🔐 Secret Key: ${process.env.BITNOB_SECRET_KEY ? process.env.BITNOB_SECRET_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log('');

  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Test different endpoints and methods
  const tests = [
    { method: 'GET', path: '/wallets', description: 'Get Wallets' },
    { method: 'GET', path: '/transactions', description: 'Get Transactions' },
    { method: 'GET', path: '/auth/user', description: 'Get User Auth' },
    { method: 'GET', path: '/me', description: 'Get User Profile' },
    { method: 'GET', path: '/balance', description: 'Get Balance' },
    { method: 'GET', path: '/customers', description: 'Get Customers' },
    { method: 'GET', path: '/virtualcards', description: 'Get Virtual Cards' },
    { method: 'GET', path: '/checkout', description: 'Get Checkout' }
  ];
  
  for (const test of tests) {
    console.log(`🧪 Testing: ${test.description}`);
    console.log(`   ${test.method} ${test.path}`);
    
    try {
      const signature = generateSignature(test.method, test.path, timestamp, nonce);
      
      const config = {
        method: test.method.toLowerCase(),
        url: `${process.env.BITNOB_BASE_URL}${test.path}`,
        headers: {
          'x-auth-client': process.env.BITNOB_CLIENT_ID,
          'x-auth-timestamp': timestamp,
          'x-auth-nonce': nonce,
          'x-auth-signature': signature,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 2000, // 2 second timeout
        validateStatus: function (status) {
          return status < 500; // Accept any status less than 500
        }
      };
      
      console.log(`   🔐 Signature: ${signature.substring(0, 16)}...`);
      
      const response = await axios(config);
      
      console.log(`   ✅ Status: ${response.status}`);
      if (response.data) {
        console.log(`   📊 Response:`, JSON.stringify(response.data, null, 2));
      }
      
      if (response.status === 200) {
        console.log('   🎉 SUCCESS! Authentication working!');
        return true;
      } else if (response.status === 401) {
        console.log('   🔑 Unauthorized - check credentials');
      } else if (response.status === 403) {
        console.log('   🔒 Forbidden - check permissions');
      }
      
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('   ⏰ Timeout (2s) - API not responding');
      } else if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📄 Data:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log('   💀 DNS/Connection error - check URL');
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    console.log('');
  }
  
  return false;
}

// Test basic connectivity first
async function testConnectivity() {
  console.log('🌐 Testing Basic Connectivity');
  console.log('=============================');
  
  const baseUrls = [
    'https://sandboxapi.bitnob.co',
    'https://api.bitnob.co',
    'https://bitnob.co'
  ];
  
  for (const url of baseUrls) {
    try {
      console.log(`🔗 Testing: ${url}`);
      const response = await axios.get(url, { timeout: 2000 });
      console.log(`   ✅ Reachable - Status: ${response.status}`);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('   ⏰ Timeout');
      } else if (error.response) {
        console.log(`   📊 Status: ${error.response.status} (${error.response.statusText})`);
      } else {
        console.log(`   ❌ ${error.message}`);
      }
    }
  }
  console.log('');
}

async function main() {
  try {
    // Test connectivity first
    await testConnectivity();
    
    // Then test API endpoints
    const success = await testBitnobEndpoints();
    
    if (success) {
      console.log('🎉 SUCCESS! Bitnob API is working correctly!');
    } else {
      console.log('⚠️  API tests completed. Check results above for details.');
      console.log('');
      console.log('💡 Troubleshooting tips:');
      console.log('   1. Verify your Bitnob sandbox account is active');
      console.log('   2. Check if credentials are for sandbox vs production');
      console.log('   3. Ensure your IP is whitelisted (if required)');
      console.log('   4. Try testing from Postman/curl directly');
    }
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

main();
