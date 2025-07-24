#!/bin/bash

# Bitnob API Testing Script for SACCO Platform
# This script runs comprehensive tests using Newman (Postman CLI)

set -e

echo "🚀 Starting Bitnob API Integration Tests for SACCO Platform"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    echo -e "${RED}❌ Newman is not installed. Installing Newman...${NC}"
    npm install -g newman
fi

# Check if local server is running
echo -e "${BLUE}🔍 Checking if local development server is running...${NC}"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local server is running${NC}"
else
    echo -e "${YELLOW}⚠️ Local server is not running. Please start it with 'npm run dev'${NC}"
    echo -e "${BLUE}💡 You can still run Bitnob API tests without the local server${NC}"
fi

# Function to run tests with better output
run_test() {
    local collection=$1
    local environment=$2
    local name=$3
    
    echo -e "\n${BLUE}🧪 Running $name...${NC}"
    echo "----------------------------------------"
    
    if newman run "$collection" \
        -e "$environment" \
        --reporters cli,json \
        --reporter-json-export "test-results-$(date +%s).json" \
        --timeout-request 30000 \
        --delay-request 1000; then
        echo -e "${GREEN}✅ $name completed successfully${NC}"
    else
        echo -e "${RED}❌ $name failed${NC}"
        return 1
    fi
}

# Test 1: Core Bitnob API functionality
echo -e "\n${YELLOW}📋 Test Suite 1: Core Bitnob API Tests${NC}"
run_test "postman/bitnob-api-collection.json" \
         "postman/bitnob-sandbox-environment.json" \
         "Core Bitnob API Tests"

# Test 2: SACCO Platform Integration (only if local server is running)
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "\n${YELLOW}📋 Test Suite 2: SACCO Platform Integration Tests${NC}"
    run_test "postman/sacco-integration-tests.json" \
             "postman/bitnob-sandbox-environment.json" \
             "SACCO Integration Tests"
else
    echo -e "\n${YELLOW}⏭️ Skipping SACCO Integration Tests (local server not running)${NC}"
fi

echo -e "\n${GREEN}🎉 All available tests completed!${NC}"
echo "============================================="

# Generate summary report
echo -e "\n${BLUE}📊 Test Summary Report${NC}"
echo "- Bitnob API connectivity: Tested"
echo "- Wallet operations: Tested"
echo "- Lightning Network: Tested"
echo "- Bitcoin operations: Tested"
echo "- Exchange rates: Tested"

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "- SACCO Platform integration: Tested"
else
    echo "- SACCO Platform integration: Skipped (server not running)"
fi

echo -e "\n${BLUE}💡 Tips for testing:${NC}"
echo "1. Ensure your .env.local file has correct Bitnob API credentials"
echo "2. Use sandbox environment for safe testing"
echo "3. Replace dummy Lightning invoices with real testnet invoices for actual payment testing"
echo "4. Monitor your Bitnob dashboard for transaction confirmations"
echo "5. Run 'npm run dev' to test SACCO platform integration"

echo -e "\n${GREEN}✅ Testing script completed successfully!${NC}"
