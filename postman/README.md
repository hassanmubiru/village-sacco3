# Bitnob API Testing with Postman

⚠️ **IMPORTANT NOTE**: As of July 24, 2025, most Bitnob API endpoints are returning 404 errors. Only the `/health` endpoint is working. This may be due to API changes, access restrictions, or endpoint modifications. Please refer to `BITNOB_API_STATUS.md` for detailed investigation results.

## 🔍 Current API Status

✅ **Working**: `/health` endpoint only  
❌ **Not Working**: `/ping`, `/wallets`, `/lightning/*`, `/bitcoin/*`, `/rates`, etc.

**Recommendation**: Contact Bitnob support for updated API documentation and endpoint information.

This directory contains comprehensive Postman collections and scripts for testing the Bitnob API integration with the Village SACCO platform.

## 📁 Files Overview

- **`bitnob-api-collection.json`** - Core Bitnob API tests (wallet, Lightning, Bitcoin operations)
- **`sacco-integration-tests.json`** - SACCO platform specific integration tests
- **`bitnob-sandbox-environment.json`** - Environment variables for sandbox testing
- **`run-tests.sh`** - Automated test runner script using Newman CLI

## 🚀 Quick Start

### Method 1: Using Postman GUI

1. **Import Collections**
   ```bash
   # Open Postman and import these files:
   - bitnob-api-collection.json
   - sacco-integration-tests.json
   - bitnob-sandbox-environment.json
   ```

2. **Set Environment**
   - Select "Bitnob Sandbox Environment" in Postman
   - Update the `BITNOB_API_KEY` with your actual API key

3. **Run Tests**
   - Execute requests individually or run the entire collection
   - Check the Console tab for detailed logs

### Method 2: Using Newman CLI (Automated)

1. **Install Newman**
   ```bash
   npm install -g newman
   ```

2. **Run Automated Tests**
   ```bash
   ./postman/run-tests.sh
   ```

## 🧪 Test Suites

### 1. Core Bitnob API Tests (`bitnob-api-collection.json`)

Tests the fundamental Bitnob API functionality:

- ✅ **Health Check** - Verify API connectivity
- ✅ **Ping API** - Basic connectivity test
- ✅ **Create Wallet** - Create a new Bitcoin wallet
- ✅ **Get Wallet Details** - Retrieve wallet information
- ✅ **Get Wallet Balance** - Check current balance
- ✅ **Create Lightning Invoice** - Generate Lightning payment request
- ✅ **Send Lightning Payment** - Send Lightning payment (requires valid invoice)
- ✅ **Generate Bitcoin Address** - Create Bitcoin receiving address
- ✅ **Get Exchange Rates** - Fetch current BTC exchange rates
- ✅ **Get Transaction History** - Retrieve wallet transaction history

### 2. SACCO Integration Tests (`sacco-integration-tests.json`)

Tests the integration between SACCO platform and Bitnob:

- ✅ **Add Money to Savings** - Test personal savings deposit via Lightning
- ✅ **Get Savings Balance** - Retrieve current savings balance
- ✅ **Withdraw from Savings** - Test savings withdrawal

## 🔧 Configuration

### Environment Variables

Update `bitnob-sandbox-environment.json` with your credentials:

```json
{
  "BITNOB_API_KEY": "your_actual_api_key_here",
  "BITNOB_BASE_URL": "https://sandboxapi.bitnob.co/api/v1",
  "BITNOB_ENVIRONMENT": "sandbox"
}
```

### Local Development Server

For SACCO integration tests, ensure your local server is running:

```bash
npm run dev
```

The server should be accessible at `http://localhost:3001`

## 📊 Test Features

### Automated Logging
- All requests include detailed console logging
- Response times and status codes are tracked
- Error responses are captured for debugging

### Dynamic Data Generation
- Unique wallet names and references are generated automatically
- Timestamps are used for unique identifiers
- Variables are shared between requests

### Error Handling
- Graceful handling of failed requests
- Detailed error messages for debugging
- Validation of response structure and data

## 🔍 Monitoring and Debugging

### Console Logs
Each test includes comprehensive logging:
```javascript
console.log('🚀 Starting test:', pm.info.requestName);
console.log('💰 Wallet ID:', response.data.id);
console.log('⚡ Payment Request:', response.data.payment_request);
```

### Test Assertions
All requests include validation tests:
```javascript
pm.test('Response status is successful', function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 202]);
});

pm.test('Response contains required data', function () {
    pm.expect(response).to.have.property('data');
});
```

## 💡 Testing Tips

1. **Start with Health Check** - Always begin with basic connectivity tests
2. **Use Sandbox Environment** - Never test with production credentials
3. **Real Lightning Invoices** - Replace dummy invoices with real testnet invoices for payment testing
4. **Monitor Bitnob Dashboard** - Check your Bitnob dashboard for transaction confirmations
5. **Check Console Logs** - Use Postman console for detailed debugging information

## 🚨 Important Notes

### Security
- ⚠️ Never commit real API keys to version control
- ⚠️ Always use sandbox environment for testing
- ⚠️ Keep your API keys secure and rotate them regularly

### Lightning Network Testing
- Lightning payment tests require valid testnet invoices
- Dummy invoices in the collection will fail (this is expected)
- Use testnet Lightning wallets for safe testing

### Rate Limiting
- Tests include 1-second delays between requests
- Sandbox environment may have rate limits
- Adjust delays if you encounter rate limiting

## 🔄 Continuous Integration

The `run-tests.sh` script can be integrated into CI/CD pipelines:

```bash
# In your CI/CD pipeline
chmod +x postman/run-tests.sh
./postman/run-tests.sh
```

## 📈 Test Results

Newman generates detailed test reports:
- CLI output with pass/fail status
- JSON reports with detailed metrics
- Test execution times and response data

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API key is correct
   - Ensure you're using sandbox credentials

2. **Connection Timeouts**
   - Check internet connectivity
   - Verify Bitnob API status

3. **SACCO Integration Failures**
   - Ensure local development server is running
   - Check that all required environment variables are set

4. **Lightning Payment Failures**
   - Replace dummy invoices with real testnet invoices
   - Ensure sufficient wallet balance for payments

### Getting Help

If you encounter issues:
1. Check the console logs in Postman
2. Verify your environment configuration
3. Ensure API credentials are valid
4. Check Bitnob API documentation for updates

## 📚 Additional Resources

- [Bitnob API Documentation](https://docs.bitnob.com)
- [Postman Documentation](https://learning.postman.com)
- [Newman CLI Documentation](https://github.com/postmanlabs/newman)
- [Lightning Network Testing Guide](https://developer.lightning.engineering/guides/python-grpc/testing/)
