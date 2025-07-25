require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const axios = require('axios');

// Quick signature test
function generateSignature(method, path, timestamp, nonce, body = '') {
  const message = `${method}${path}${timestamp}${nonce}${body}`;
  return crypto
    .createHmac('sha256', process.env.BITNOB_SECRET_KEY)
    .update(message)
    .digest('hex');
}

async function quickTest() {
  console.log('⚡ Quick Bitnob API Test');
  console.log('========================');
  
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(8).toString('hex'); // Shorter nonce
  const signature = generateSignature('GET', '/wallets', timestamp, nonce);
  
  console.log(`Client ID: ${process.env.BITNOB_CLIENT_ID}`);
  console.log(`Base URL: ${process.env.BITNOB_BASE_URL}`);
  console.log(`Signature: ${signature.substring(0, 16)}...`);
  console.log('');
  
  try {
    console.log('🚀 Making API call...');
    
    const response = await axios.get(`${process.env.BITNOB_BASE_URL}/wallets`, {
      headers: {
        'x-auth-client': process.env.BITNOB_CLIENT_ID,
        'x-auth-timestamp': timestamp,
        'x-auth-nonce': nonce,
        'x-auth-signature': signature,
        'Content-Type': 'application/json'
      },
      timeout: 3000
    });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ Timeout - API is slow but credentials may be correct');
    } else if (error.response) {
      console.log(`📊 Response Status: ${error.response.status}`);
      console.log(`📄 Response Data:`, JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('🔑 Authentication failed - check your credentials');
      } else if (error.response.status === 403) {
        console.log('🔒 Forbidden - account may need activation');
      } else {
        console.log('ℹ️  Got response - API is reachable');
      }
    } else {
      console.log('💀 Network error:', error.message);
    }
  }
}

quickTest();
