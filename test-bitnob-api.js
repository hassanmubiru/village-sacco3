#!/usr/bin/env node

// Bitnob API Testing Script with updated credentials
const https = require('https');
const fs = require('fs');

const CLIENT_ID = '25b14d45-273f-4d10-9847-1887286025dc';
const SECRET_KEY = 'hsk.4c1881eb1ac8.5156fc3bca15d21c12a453082';
const BASE_URL = 'https://sandboxapi.bitnob.co';

console.log('🔐 Using Updated Credentials:');
console.log('Client ID:', CLIENT_ID);
console.log('Secret Key:', SECRET_KEY.substring(0, 10) + '...');
console.log('Base URL:', BASE_URL);
console.log('=' .repeat(60));

const endpoints = [
  // Basic endpoints
  { path: '/health', method: 'GET', auth: 'secret' },
  { path: '/ping', method: 'GET', auth: 'secret' },
  
  // Wallet endpoints
  { path: '/wallets', method: 'GET', auth: 'secret' },
  { path: '/wallets', method: 'POST', auth: 'secret', data: { name: 'Test SACCO Wallet' } },
  
  // Lightning endpoints
  { path: '/lightning/invoice', method: 'POST', auth: 'secret', data: { amount: 1000, description: 'Test invoice' } },
  { path: '/lightning/send', method: 'POST', auth: 'secret', data: { invoice: 'test', amount: 1000 } },
  
  // Bitcoin endpoints
  { path: '/bitcoin/send', method: 'POST', auth: 'secret', data: { amount: 1000, address: 'test' } },
  { path: '/bitcoin/address', method: 'POST', auth: 'secret' },
  
  // Other endpoints
  { path: '/rates', method: 'GET', auth: 'secret' },
  { path: '/transactions', method: 'GET', auth: 'secret' },
  
  // Try with client ID auth
  { path: '/health', method: 'GET', auth: 'client' },
  { path: '/wallets', method: 'GET', auth: 'client' },
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const authToken = endpoint.auth === 'client' ? CLIENT_ID : SECRET_KEY;
    const postData = endpoint.data ? JSON.stringify(endpoint.data) : null;
    
    const options = {
      hostname: 'sandboxapi.bitnob.co',
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let response = data;
        try {
          response = JSON.parse(data);
        } catch (e) {
          // Keep as string if not JSON
        }
        
        resolve({
          endpoint: `${endpoint.method} ${endpoint.path}`,
          auth: endpoint.auth,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400,
          response: typeof response === 'object' ? JSON.stringify(response, null, 2) : response
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        auth: endpoint.auth,
        status: 'ERROR',
        success: false,
        response: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        auth: endpoint.auth,
        status: 'TIMEOUT',
        success: false,
        response: 'Request timeout'
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing Bitnob API endpoints...');
  console.log('Time:', new Date().toISOString());
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    const authIcon = result.auth === 'client' ? '🔑' : '🗝️';
    
    console.log(`${status} ${authIcon} ${result.endpoint.padEnd(25)} | Status: ${result.status}`);
    
    if (result.success && result.response && result.response.length < 500) {
      console.log(`   📄 ${result.response}`);
    } else if (!result.success) {
      console.log(`   ❌ ${result.response.substring(0, 200)}${result.response.length > 200 ? '...' : ''}`);
    }
    
    console.log(''); // Empty line for readability
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('📊 SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful requests: ${successful.length}`);
  successful.forEach(r => console.log(`   - ${r.endpoint} (${r.auth} auth)`));
  
  console.log(`\n❌ Failed requests: ${failed.length}`);
  failed.forEach(r => console.log(`   - ${r.endpoint} (${r.auth} auth) - ${r.status}`));
  
  console.log('\n🔍 ANALYSIS');
  console.log('=' .repeat(60));
  
  if (successful.length === 0) {
    console.log('❌ No endpoints are working. Possible issues:');
    console.log('   - API credentials are invalid');
    console.log('   - API access is restricted');
    console.log('   - Bitnob service is down');
    console.log('   - Network connectivity issues');
  } else if (successful.some(r => r.endpoint.includes('health'))) {
    console.log('✅ Basic connectivity works (health endpoint)');
    
    if (successful.some(r => r.endpoint.includes('wallets'))) {
      console.log('✅ Wallet operations are available');
    } else {
      console.log('⚠️ Wallet operations may require different authentication or endpoints');
    }
    
    if (successful.some(r => r.endpoint.includes('lightning'))) {
      console.log('✅ Lightning Network operations are available');
    } else {
      console.log('⚠️ Lightning Network operations may not be available or require different endpoints');
    }
  }
  
  console.log('\n💡 RECOMMENDATIONS');
  console.log('=' .repeat(60));
  
  if (successful.length > 0) {
    console.log('1. Use working endpoints for implementation');
    console.log('2. Update Bitnob service to use correct endpoint patterns');
    console.log('3. Implement proper error handling for unavailable endpoints');
  } else {
    console.log('1. Contact Bitnob support for API access verification');
    console.log('2. Check if additional API permissions are needed');
    console.log('3. Verify credentials are correct and active');
  }
  
  // Save results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    credentials: {
      clientId: CLIENT_ID,
      secretKey: SECRET_KEY.substring(0, 10) + '...',
      baseUrl: BASE_URL
    },
    results,
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length
    }
  };
  
  fs.writeFileSync('bitnob-api-test-results.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Detailed results saved to: bitnob-api-test-results.json');
}

main().catch(console.error);
