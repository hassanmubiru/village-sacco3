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

async function discoverEndpoints() {
  console.log('🔍 Bitnob API Discovery Tool');
  console.log('================================================');
  
  const baseUrl = process.env.BITNOB_BASE_URL;
  console.log(`Base URL: ${baseUrl}`);
  console.log('');
  
  // Test different base URLs and common endpoints
  const testUrls = [
    // Different base URL patterns
    'https://sandboxapi.bitnob.co',
    'https://sandboxapi.bitnob.co/api',
    'https://sandboxapi.bitnob.co/v1',
    // Common API endpoints
    'https://sandboxapi.bitnob.co/api/v1/wallets',
    'https://sandboxapi.bitnob.co/api/v1/transactions',
    'https://sandboxapi.bitnob.co/api/v1/auth',
    'https://sandboxapi.bitnob.co/api/v1/user',
    'https://sandboxapi.bitnob.co/api/v1/profile',
    'https://sandboxapi.bitnob.co/api/v1/balance',
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`🧪 Testing: ${url}`);
      const response = await axios.get(url, { 
        timeout: 5000,
        validateStatus: function (status) {
          return status < 500; // Accept any status less than 500
        }
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      if (response.data) {
        console.log(`   📄 Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Status: ${error.response.status} - ${error.response.statusText}`);
        if (error.response.status === 401) {
          console.log('   🔑 Requires authentication (this is good - endpoint exists!)');
        }
      } else {
        console.log(`   💀 Network error: ${error.message}`);
      }
    }
    console.log('');
  }
  
  // Try with authentication headers
  console.log('🔐 Testing with authentication headers...');
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const authEndpoints = [
    '/wallets',
    '/transactions', 
    '/user',
    '/profile',
    '/me',
    '/auth/user'
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const signature = generateSignature('GET', endpoint, timestamp, nonce);
      
      console.log(`🔐 Testing authenticated: ${baseUrl}${endpoint}`);
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: {
          'x-auth-client': process.env.BITNOB_CLIENT_ID,
          'x-auth-timestamp': timestamp,
          'x-auth-nonce': nonce,
          'x-auth-signature': signature,
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      if (response.data) {
        console.log(`   📄 Response: ${JSON.stringify(response.data, null, 2)}`);
      }
      break; // Stop on first success
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Status: ${error.response.status}`);
        if (error.response.data) {
          console.log(`   📄 Error data: ${JSON.stringify(error.response.data)}`);
        }
      } else {
        console.log(`   💀 Error: ${error.message}`);
      }
    }
  }
}

discoverEndpoints();
