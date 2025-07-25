require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function testLightningPayment() {
  console.log('⚡ Testing Lightning Payment Endpoint');
  console.log('====================================');
  
  const baseURL = process.env.BITNOB_BASE_URL;
  const secretKey = process.env.BITNOB_SECRET_KEY;
  
  console.log(`📍 Base URL: ${baseURL}`);
  console.log(`🔐 Secret Key: ${secretKey ? '***configured***' : '❌ NOT SET'}`);
  console.log('');

  try {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Test data for Lightning payment
    const testPayment = {
      amount: 1000, // 1000 sats
      reference: `test-${Date.now()}`,
      narration: 'SACCO Platform Test Payment'
    };
    
    const body = JSON.stringify(testPayment);
    const message = `POST/api/v1/lightning/send${timestamp}${nonce}${body}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('hex');

    console.log('🧪 Testing Lightning Send Endpoint');
    console.log(`📊 Test Payment: ${testPayment.amount} sats`);
    console.log(`🔐 Signature: ${signature.substring(0, 16)}...`);
    console.log('');

    const response = await fetch(`${baseURL}/lightning/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-timestamp': timestamp,
        'x-auth-nonce': nonce,
        'x-auth-signature': signature,
      },
      body: body,
    });

    console.log(`📈 Response Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`📄 Response: ${responseText.substring(0, 300)}${responseText.length > 300 ? '...' : ''}`);
    
    if (response.status === 200) {
      console.log('✅ Lightning payment endpoint is working!');
    } else if (response.status === 404) {
      console.log('❌ Lightning payment endpoint not found - may not be available');
    } else if (response.status === 401 || response.status === 403) {
      console.log('🔑 Authentication issue - check credentials');
    } else {
      console.log(`⚠️ Unexpected status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Lightning payment test failed:', error.message);
  }
}

testLightningPayment();
