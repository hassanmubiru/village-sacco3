require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function exploreAlternativeEndpoints() {
  console.log('🔍 Exploring Alternative Bitnob Endpoints');
  console.log('=========================================');
  
  const baseURL = process.env.BITNOB_BASE_URL;
  const secretKey = process.env.BITNOB_SECRET_KEY;
  
  // Extended list of potential endpoints
  const endpoints = [
    // Lightning alternatives
    '/lightning',
    '/ln',
    '/bolt11',
    '/invoice',
    '/invoices',
    
    // Payment alternatives
    '/payment',
    '/payments',
    '/pay',
    '/send',
    '/transfer',
    '/transfers',
    
    // Cross-border alternatives
    '/remittance',
    '/international',
    '/forex',
    '/exchange',
    '/convert',
    '/conversion',
    
    // Virtual card alternatives
    '/cards',
    '/card',
    '/virtual',
    '/debit',
    
    // Stablecoin alternatives
    '/usdt',
    '/stablecoin',
    '/stable',
    '/crypto',
    '/bitcoin',
    '/btc',
    
    // Other potential endpoints
    '/balance',
    '/balances',
    '/wallet/balance',
    '/user',
    '/users',
    '/profile',
    '/kyc',
    '/verification',
    '/rates',
    '/market',
    '/price'
  ];

  const workingEndpoints = [];
  const authRequiredEndpoints = [];
  
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
      
      if (status === 200) {
        workingEndpoints.push({ endpoint, status, note: 'Working' });
      } else if (status === 401 || status === 403) {
        authRequiredEndpoints.push({ endpoint, status, note: 'Auth Required (Available)' });
      } else if (status === 400) {
        workingEndpoints.push({ endpoint, status, note: 'Bad Request (Available)' });
      } else if (status === 500) {
        workingEndpoints.push({ endpoint, status, note: 'Server Error (Available)' });
      }
      
    } catch (error) {
      // Skip network errors
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n✅ Working Endpoints:');
  workingEndpoints.forEach(ep => {
    console.log(`   ${ep.endpoint.padEnd(20)} | ${ep.status} | ${ep.note}`);
  });
  
  console.log('\n🔑 Auth Required Endpoints:');
  authRequiredEndpoints.forEach(ep => {
    console.log(`   ${ep.endpoint.padEnd(20)} | ${ep.status} | ${ep.note}`);
  });
  
  console.log(`\n📊 Total Found: ${workingEndpoints.length + authRequiredEndpoints.length} endpoints`);
}

exploreAlternativeEndpoints();
