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

async function testConnection() {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const method = 'GET';
  
  console.log('🔗 Testing Bitnob API connection...');
  console.log('📋 Configuration:');
  console.log(`   Base URL: ${process.env.BITNOB_BASE_URL}`);
  console.log(`   Client ID: ${process.env.BITNOB_CLIENT_ID}`);
  console.log(`   Secret Key: ${process.env.BITNOB_SECRET_KEY ? '***hidden***' : 'NOT SET'}`);
  console.log('');
  
  // Try different endpoints
  const endpoints = ['/me', '/users/me', '/auth/me', '/account'];
  
  for (const path of endpoints) {
    console.log(`🧪 Testing endpoint: ${path}`);
    const signature = generateSignature(method, path, timestamp, nonce);
    
    try {
      const response = await axios.get(`${process.env.BITNOB_BASE_URL}${path}`, {
        headers: {
          'x-auth-client': process.env.BITNOB_CLIENT_ID,
          'x-auth-timestamp': timestamp,
          'x-auth-nonce': nonce,
          'x-auth-signature': signature,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Success with endpoint: ${path}`);
      console.log('📊 Response data:');
      console.log('   Status:', response.status);
      console.log('   Data:', JSON.stringify(response.data, null, 2));
      return; // Exit on first success
      
    } catch (error) {
      console.log(`❌ Failed with endpoint: ${path} (Status: ${error.response?.status || 'Network Error'})`);
      
      if (error.response?.status === 401) {
        console.log('   🔑 Authentication issue - check credentials');
      } else if (error.response?.status === 404) {
        console.log('   🔍 Endpoint not found - trying next...');
      } else {
        console.log('   📝 Error:', error.response?.data?.message || error.message);
      }
    }
  }
  
  console.log('');
  console.log('❌ All endpoints failed. Let\'s try basic connectivity...');
  
  // Try a simple GET to the base URL
  try {
    const response = await axios.get(process.env.BITNOB_BASE_URL.replace('/api/v1', ''));
    console.log('✅ Base URL is reachable');
    console.log('   Status:', response.status);
  } catch (error) {
    console.log('❌ Cannot reach base URL');
    console.log('   Error:', error.message);
  }
}

// Check environment variables first
function checkEnvironment() {
  console.log('🔧 Checking environment variables...');
  const required = ['BITNOB_CLIENT_ID', 'BITNOB_SECRET_KEY', 'BITNOB_BASE_URL'];
  let missing = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

// Run the test
if (checkEnvironment()) {
  testConnection();
} else {
  console.log('Please check your .env.local file and ensure all Bitnob variables are set.');
}
