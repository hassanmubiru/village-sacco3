require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function checkApiVersions() {
  console.log('🔍 Checking Different Bitnob API Versions');
  console.log('==========================================');
  
  const secretKey = process.env.BITNOB_SECRET_KEY;
  
  // Different API base URLs to try
  const apiVersions = [
    'https://sandboxapi.bitnob.co/api/v1',
    'https://sandboxapi.bitnob.co/api/v2', 
    'https://sandboxapi.bitnob.co/v1',
    'https://sandboxapi.bitnob.co/v2',
    'https://api.bitnob.co/api/v1',
    'https://api.bitnob.co/api/v2',
    'https://api.bitnob.co/v1',
    'https://api.bitnob.co/v2'
  ];
  
  for (const baseURL of apiVersions) {
    try {
      console.log(`\n🧪 Testing: ${baseURL}`);
      
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString('hex');
      const message = `GET/wallets${timestamp}${nonce}`;
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(message)
        .digest('hex');

      const response = await fetch(`${baseURL}/wallets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-timestamp': timestamp,
          'x-auth-nonce': nonce,
          'x-auth-signature': signature,
        },
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('   ✅ This version is working!');
        
        // Test for Lightning endpoints on working version
        const lightningTests = ['/lightning', '/lightning/send', '/lightning/invoice'];
        for (const endpoint of lightningTests) {
          try {
            const ts = Date.now().toString();
            const n = crypto.randomBytes(16).toString('hex');
            const msg = `GET${endpoint}${ts}${n}`;
            const sig = crypto.createHmac('sha256', secretKey).update(msg).digest('hex');
            
            const testResp = await fetch(`${baseURL}${endpoint}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-timestamp': ts,
                'x-auth-nonce': n,
                'x-auth-signature': sig,
              },
            });
            
            if (testResp.status !== 404) {
              console.log(`   🌟 ${endpoint}: Status ${testResp.status} (Available!)`);
            }
          } catch (e) {}
        }
      } else if (response.status === 401 || response.status === 403) {
        console.log('   🔑 Auth issue (but API exists)');
      } else {
        console.log(`   ❌ Not available`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message.substring(0, 50)}`);
    }
  }
}

checkApiVersions();
