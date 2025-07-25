require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function findWorkingEndpoints() {
  console.log('🔍 Finding Working Bitnob Endpoints');
  console.log('===================================');
  
  const baseURL = process.env.BITNOB_BASE_URL;
  const secretKey = process.env.BITNOB_SECRET_KEY;
  
  // Common endpoints to test
  const endpoints = [
    '/wallets',
    '/wallet',
    '/payments',
    '/payment', 
    '/transactions',
    '/transfer',
    '/send',
    '/bitcoin/send',
    '/btc/send',
    '/lightning',
    '/ln/send',
    '/pin/create',
    '/user/create',
    '/account'
  ];

  for (const endpoint of endpoints) {
    try {
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString('hex');
      const message = `GET${endpoint}${timestamp}${nonce}`;
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(message)
        .digest('hex');

      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-timestamp': timestamp,
          'x-auth-nonce': nonce,
          'x-auth-signature': signature,
        },
      });

      const status = response.status;
      let result = '❌ Not Found';
      
      if (status === 200) {
        result = '✅ Available';
      } else if (status === 401 || status === 403) {
        result = '🔑 Auth Required (Available)';
      } else if (status === 400) {
        result = '📝 Bad Request (Available)';
      } else if (status === 500) {
        result = '🔥 Server Error (Available)';
      }
      
      console.log(`${endpoint.padEnd(20)} | ${status} | ${result}`);
      
    } catch (error) {
      console.log(`${endpoint.padEnd(20)} | ERR | ❌ Error: ${error.message.substring(0, 30)}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

findWorkingEndpoints();
