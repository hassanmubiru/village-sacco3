#!/usr/bin/env node

// Simple script to test Bitnob API endpoints
const https = require('https');

const API_KEY = 'hsk.d550cb2465fe.d92cf979e734a2baae0470a48';
const BASE_URL = 'https://sandboxapi.bitnob.co';

const endpoints = [
  '/health',
  '/ping',
  '/wallets',
  '/wallet', 
  '/lightning/invoice',
  '/lightning/send',
  '/lightning',
  '/bitcoin/send',
  '/bitcoin',
  '/rates',
  '/rate',
  '/transactions',
  '/transaction',
  '/kyc',
  '/convert'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'sandboxapi.bitnob.co',
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          endpoint,
          status: res.statusCode,
          available: res.statusCode !== 404,
          response: data.length > 500 ? data.substring(0, 500) + '...' : data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint,
        status: 'ERROR',
        available: false,
        response: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        endpoint,
        status: 'TIMEOUT',
        available: false,
        response: 'Request timeout'
      });
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Testing Bitnob API endpoints...');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const status = result.available ? '✅' : '❌';
    console.log(`${status} ${endpoint.padEnd(20)} | Status: ${result.status}`);
    
    if (result.available && result.response) {
      try {
        const json = JSON.parse(result.response);
        console.log(`   📄 Response: ${JSON.stringify(json, null, 2).substring(0, 200)}...`);
      } catch {
        console.log(`   📄 Response: ${result.response.substring(0, 100)}...`);
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Summary:');
  console.log('=' .repeat(60));
  
  const available = results.filter(r => r.available);
  const unavailable = results.filter(r => !r.available);
  
  console.log(`✅ Available endpoints: ${available.length}`);
  available.forEach(r => console.log(`   - ${r.endpoint}`));
  
  console.log(`\n❌ Unavailable endpoints: ${unavailable.length}`);
  unavailable.forEach(r => console.log(`   - ${r.endpoint}`));
  
  console.log('\n💡 Recommendations:');
  if (available.length === 0) {
    console.log('   - Check if API key is valid');
    console.log('   - Verify Bitnob API documentation for correct endpoints');
    console.log('   - Contact Bitnob support for API access');
  } else {
    console.log('   - Use available endpoints for implementation');
    console.log('   - Update service to use correct endpoint names');
  }
}

main().catch(console.error);
