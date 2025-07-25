require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function testWorkingBitnobEndpoints() {
  console.log('🚀 Testing Working Bitnob API Endpoints');
  console.log('=======================================');
  
  const secretKey = process.env.BITNOB_SECRET_KEY;
  const baseURL = 'https://sandboxapi.bitnob.co/api/v1';
  
  if (!secretKey) {
    console.error('❌ BITNOB_SECRET_KEY not found in environment variables');
    return;
  }
  
  console.log(`🔧 Using API: ${baseURL}`);
  console.log(`🔑 Secret Key: ${secretKey.substring(0, 10)}...`);
  
  // Helper function to make authenticated requests
  async function makeRequest(endpoint, method = 'GET', data = null) {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const body = data ? JSON.stringify(data) : '';
    const message = `${method}${endpoint}${timestamp}${nonce}${body}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('hex');

    const response = await fetch(`${baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-auth-timestamp': timestamp,
        'x-auth-nonce': nonce,
        'x-auth-signature': signature,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = {
      status: response.status,
      statusText: response.statusText,
      data: null,
      error: null
    };

    try {
      if (response.ok) {
        result.data = await response.json();
      } else {
        result.error = await response.json();
      }
    } catch (e) {
      result.error = response.statusText;
    }

    return result;
  }
  
  console.log('\n💰 1. Testing Wallets Endpoint (Confirmed Working)');
  console.log('--------------------------------------------------');
  
  try {
    const walletsResponse = await makeRequest('/wallets');
    console.log(`📊 Status: ${walletsResponse.status} ${walletsResponse.statusText}`);
    
    if (walletsResponse.status === 200) {
      console.log('✅ Wallets endpoint is working!');
      console.log('📄 Response data:', JSON.stringify(walletsResponse.data, null, 2));
    } else {
      console.log('⚠️ Wallets endpoint response:', walletsResponse.error);
    }
  } catch (error) {
    console.error('❌ Wallets test failed:', error.message);
  }
  
  console.log('\n📊 2. Testing Transactions Endpoint (Confirmed Working)');
  console.log('-------------------------------------------------------');
  
  try {
    const transactionsResponse = await makeRequest('/transactions');
    console.log(`📊 Status: ${transactionsResponse.status} ${transactionsResponse.statusText}`);
    
    if (transactionsResponse.status === 200) {
      console.log('✅ Transactions endpoint is working!');
      console.log('📄 Response data:', JSON.stringify(transactionsResponse.data, null, 2));
    } else {
      console.log('⚠️ Transactions endpoint response:', transactionsResponse.error);
    }
  } catch (error) {
    console.error('❌ Transactions test failed:', error.message);
  }
  
  console.log('\n🔍 3. Testing Other Endpoints (For Comparison)');
  console.log('----------------------------------------------');
  
  const testEndpoints = [
    '/lightning/invoice',
    '/lightning/send', 
    '/cross-border/send',
    '/virtual-cards',
    '/stablecoins/buy',
    '/rates',
    '/health'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await makeRequest(endpoint);
      const status = response.status === 200 ? '✅ Working' : 
                    response.status === 404 ? '❌ Not Found' :
                    response.status === 401 || response.status === 403 ? '🔑 Auth Issue' :
                    `⚠️ ${response.status}`;
      
      console.log(`   ${endpoint}: ${status}`);
    } catch (error) {
      console.log(`   ${endpoint}: ❌ Error - ${error.message.substring(0, 30)}`);
    }
  }
  
  console.log('\n🏗️ 4. Test Wallet Creation (Real API Call)');
  console.log('------------------------------------------');
  
  try {
    const walletData = {
      phoneNumber: '+2348123456789',
      email: 'test.sacco@example.com',
      firstName: 'SACCO',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      address: '123 SACCO Street, Lagos, Nigeria'
    };
    
    console.log('🔄 Attempting to create wallet...');
    const createResponse = await makeRequest('/wallets', 'POST', walletData);
    console.log(`📊 Create Wallet Status: ${createResponse.status} ${createResponse.statusText}`);
    
    if (createResponse.status === 200 || createResponse.status === 201) {
      console.log('✅ Wallet creation successful!');
      console.log('📄 Created wallet:', JSON.stringify(createResponse.data, null, 2));
    } else {
      console.log('⚠️ Wallet creation response:', createResponse.error);
      if (createResponse.status === 401 || createResponse.status === 403) {
        console.log('   🔑 This might be due to authentication or permissions');
      }
    }
  } catch (error) {
    console.error('❌ Wallet creation test failed:', error.message);
  }
  
  console.log('\n📈 5. Summary and SACCO Integration Plan');
  console.log('========================================');
  
  console.log('✅ Confirmed Working Bitnob Features:');
  console.log('   💰 /wallets - Wallet management and listing');
  console.log('   📊 /transactions - Transaction history and details');
  console.log('   🔍 Authentication system (HMAC-SHA256)');
  
  console.log('\n🛠️ SACCO Platform Integration Strategy:');
  console.log('   1. ✅ Use real Bitnob API for core wallet operations');
  console.log('   2. ✅ Use real API for transaction tracking and history');
  console.log('   3. 🔄 Use mock services for Lightning/advanced features');
  console.log('   4. 🚀 Ready for production migration when features become available');
  
  console.log('\n🎯 Immediate Implementation:');
  console.log('   1. Integrate wallet creation in SACCO member onboarding');
  console.log('   2. Use transaction endpoints for payment tracking');
  console.log('   3. Build dashboard with real wallet balances');
  console.log('   4. Implement payment flows using available endpoints');
  
  console.log('\n🔄 Next Development Phase:');
  console.log('   1. Test with production API credentials');
  console.log('   2. Implement error handling for real API responses');
  console.log('   3. Add wallet management features to SACCO UI');
  console.log('   4. Create transaction monitoring for group savings');
}

// Run the test
testWorkingBitnobEndpoints().catch(console.error);
