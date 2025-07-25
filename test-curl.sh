#!/bin/bash

# Load environment variables
source .env.local

# Generate timestamp and nonce
TIMESTAMP=$(date +%s%3N)
NONCE=$(openssl rand -hex 16)

# API details
METHOD="GET"
PATH="/api/v1/wallets"
BODY=""

# Create message to sign
MESSAGE="${METHOD}${PATH}${TIMESTAMP}${NONCE}${BODY}"

# Generate HMAC signature
SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -hmac "$BITNOB_SECRET_KEY" | cut -d' ' -f2)

echo "🔧 Bitnob API Test with HMAC Authentication"
echo "==========================================="
echo "Client ID: $BITNOB_CLIENT_ID"
echo "Timestamp: $TIMESTAMP"
echo "Nonce: $NONCE"
echo "Message: $MESSAGE"
echo "Signature: $SIGNATURE"
echo ""

echo "🚀 Making authenticated API call..."

# Make the API call with proper headers
curl -v \
  -H "x-auth-client: $BITNOB_CLIENT_ID" \
  -H "x-auth-timestamp: $TIMESTAMP" \
  -H "x-auth-nonce: $NONCE" \
  -H "x-auth-signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  --connect-timeout 10 \
  --max-time 15 \
  "$BITNOB_BASE_URL/wallets"
