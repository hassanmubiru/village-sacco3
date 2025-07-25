require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

function generateSignature(method, path, timestamp, nonce, body = '') {
  const message = `${method}${path}${timestamp}${nonce}${body}`;
  return crypto
    .createHmac('sha256', process.env.BITNOB_SECRET_KEY)
    .update(message)
    .digest('hex');
}

function makeHttpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testBitnobAuth() {
  console.log('🔐 Testing Bitnob API Authentication');
  console.log('====================================');
  
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const method = 'GET';
  const path = '/wallets'; // Just the endpoint path, base URL already has /api/v1
  
  const signature = generateSignature(method, path, timestamp, nonce);
  
  console.log(`📍 Base URL: ${process.env.BITNOB_BASE_URL}`);
  console.log(`📍 Full URL: ${process.env.BITNOB_BASE_URL}${path}`);
  console.log(`🆔 Client ID: ${process.env.BITNOB_CLIENT_ID}`);
  console.log(`🕒 Timestamp: ${timestamp}`);
  console.log(`🎲 Nonce: ${nonce}`);
  console.log(`🔐 Signature: ${signature}`);
  console.log('');
  
  const url = new URL(`${process.env.BITNOB_BASE_URL}${path}`);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: method,
    headers: {
      'x-auth-client': process.env.BITNOB_CLIENT_ID,
      'x-auth-timestamp': timestamp,
      'x-auth-nonce': nonce,
      'x-auth-signature': signature,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  try {
    console.log('🚀 Making HTTPS request...');
    const response = await makeHttpsRequest(options);
    
    console.log(`📊 Status Code: ${response.statusCode}`);
    console.log(`📄 Response Body: ${response.body}`);
    
    if (response.statusCode === 200) {
      console.log('✅ SUCCESS! Authentication working perfectly!');
      try {
        const data = JSON.parse(response.body);
        console.log('📋 Parsed Data:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('⚠️  Response is not valid JSON');
      }
    } else if (response.statusCode === 401) {
      console.log('🔑 Unauthorized - Check your credentials');
      console.log('💡 This could mean:');
      console.log('   - Client ID is incorrect');
      console.log('   - Secret key is incorrect');
      console.log('   - Signature generation is wrong');
      console.log('   - Account is not activated');
    } else if (response.statusCode === 403) {
      console.log('🔒 Forbidden - Account may need permissions');
    } else {
      console.log(`ℹ️  Got response code: ${response.statusCode}`);
    }
    
  } catch (error) {
    if (error.message === 'Request timeout') {
      console.log('⏰ Request timed out (5s) - API may be slow');
    } else {
      console.log('💀 Error:', error.message);
    }
  }
}

testBitnobAuth();
