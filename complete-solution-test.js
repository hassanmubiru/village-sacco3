require('dotenv').config({ path: '.env.local' });

// Test the complete solution with mock services
async function testMockServices() {
  console.log('🚀 Testing Complete SACCO Platform Solution');
  console.log('============================================');
  
  // Import the mock services
  const { MockBitnobServices } = require('./src/services/mock-bitnob.service.ts');
  const mockServices = MockBitnobServices.getInstance();
  
  console.log('\n⚡ Testing Lightning Network Mock Services');
  console.log('-------------------------------------------');
  
  try {
    // Test Lightning invoice creation
    const invoice = await mockServices.createLightningInvoice(50000, 'SACCO Group Payment');
    console.log('✅ Lightning Invoice Created:', {
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
      invoice: invoice.invoice?.substring(0, 20) + '...'
    });
    
    // Test Lightning payment
    const payment = await mockServices.sendLightningPayment(invoice.invoice, invoice.amount);
    console.log('✅ Lightning Payment Sent:', {
      id: payment.id,
      amount: payment.amount,
      status: payment.status
    });
    
    // Wait for status updates
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const payments = await mockServices.getLightningPayments();
    console.log(`📊 Total Lightning Transactions: ${payments.length}`);
    
  } catch (error) {
    console.error('❌ Lightning Test Failed:', error.message);
  }
  
  console.log('\n🌍 Testing Cross-Border Transfer Mock Services');
  console.log('----------------------------------------------');
  
  try {
    // Test cross-border transfers to different countries
    const transfers = [
      await mockServices.initiateCrossBorderTransfer(100, 'NGN', 'Nigeria'),
      await mockServices.initiateCrossBorderTransfer(75, 'KES', 'Kenya'),
      await mockServices.initiateCrossBorderTransfer(50, 'GHS', 'Ghana')
    ];
    
    transfers.forEach((transfer, index) => {
      console.log(`✅ Cross-Border Transfer ${index + 1}:`, {
        id: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        country: transfer.recipientCountry,
        status: transfer.status,
        rate: transfer.exchangeRate
      });
    });
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    const allTransfers = await mockServices.getCrossBorderTransfers();
    console.log(`📊 Total Cross-Border Transfers: ${allTransfers.length}`);
    
  } catch (error) {
    console.error('❌ Cross-Border Test Failed:', error.message);
  }
  
  console.log('\n💳 Testing Virtual Card Mock Services');
  console.log('-------------------------------------');
  
  try {
    // Create virtual cards
    const visaCard = await mockServices.createVirtualCard('visa');
    const mastercardCard = await mockServices.createVirtualCard('mastercard');
    
    console.log('✅ Visa Card Created:', {
      id: visaCard.id,
      cardNumber: visaCard.cardNumber,
      expiry: visaCard.expiryDate,
      status: visaCard.status,
      type: visaCard.type
    });
    
    console.log('✅ Mastercard Created:', {
      id: mastercardCard.id,
      cardNumber: mastercardCard.cardNumber,
      expiry: mastercardCard.expiryDate,
      status: mastercardCard.status,
      type: mastercardCard.type
    });
    
    // Fund the cards
    await mockServices.fundVirtualCard(visaCard.id, 500);
    await mockServices.fundVirtualCard(mastercardCard.id, 300);
    
    // Freeze one card
    await mockServices.freezeVirtualCard(visaCard.id);
    
    const allCards = await mockServices.getVirtualCards();
    console.log(`📊 Total Virtual Cards: ${allCards.length}`);
    allCards.forEach(card => {
      console.log(`   💳 ${card.type.toUpperCase()}: $${card.balance} - ${card.status}`);
    });
    
  } catch (error) {
    console.error('❌ Virtual Card Test Failed:', error.message);
  }
  
  console.log('\n🪙 Testing USDT/Stablecoin Mock Services');
  console.log('---------------------------------------');
  
  try {
    // Test USDT operations
    const buyOperation = await mockServices.buyUSDT(100);
    const sellOperation = await mockServices.sellUSDT(50);
    const transferOperation = await mockServices.transferUSDT(25, 'recipient-wallet-address');
    
    console.log('✅ USDT Buy Operation:', {
      id: buyOperation.id,
      amount: buyOperation.amount,
      type: buyOperation.type,
      status: buyOperation.status,
      rate: buyOperation.rate
    });
    
    console.log('✅ USDT Sell Operation:', {
      id: sellOperation.id,
      amount: sellOperation.amount,
      type: sellOperation.type,
      status: sellOperation.status,
      rate: sellOperation.rate
    });
    
    console.log('✅ USDT Transfer Operation:', {
      id: transferOperation.id,
      amount: transferOperation.amount,
      type: transferOperation.type,
      status: transferOperation.status
    });
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const allOperations = await mockServices.getUSDTOperations();
    console.log(`📊 Total USDT Operations: ${allOperations.length}`);
    
    // Show final statuses
    const finalOperations = await mockServices.getUSDTOperations();
    finalOperations.forEach(op => {
      console.log(`   🪙 ${op.type.toUpperCase()}: $${op.amount} - ${op.status}`);
    });
    
  } catch (error) {
    console.error('❌ USDT Test Failed:', error.message);
  }
  
  console.log('\n📈 Summary and Next Steps');
  console.log('=========================');
  
  console.log('✅ Mock Services Implemented:');
  console.log('   ⚡ Lightning Network (Invoice creation, payments)');
  console.log('   🌍 Cross-Border Transfers (Multi-currency support)');
  console.log('   💳 Virtual Cards (Visa/Mastercard, funding, freeze/unfreeze)');
  console.log('   🪙 USDT Operations (Buy, sell, transfer)');
  
  console.log('\n🛠️ Integration Options:');
  console.log('   1. ✅ Sandbox Development: Use mock services (current)');
  console.log('   2. 🚀 Production Ready: Switch to https://api.bitnob.co/api/v1');
  console.log('   3. 🔄 Hybrid Mode: Mock for unavailable features, real for available ones');
  
  console.log('\n🎯 Production Migration Path:');
  console.log('   1. Contact Bitnob support for production API access');
  console.log('   2. Update BITNOB_BASE_URL to production endpoint'); 
  console.log('   3. Test production endpoints for Lightning/advanced features');
  console.log('   4. Replace mock services with real implementations');
  
  console.log('\n💡 Development Benefits:');
  console.log('   ✅ Full SACCO platform functionality during development');
  console.log('   ✅ Realistic payment flows and user experience');
  console.log('   ✅ Error handling and edge case testing');
  console.log('   ✅ No dependency on external service availability');
}

// Run the test
testMockServices().catch(console.error);
