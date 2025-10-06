#!/bin/bash

echo "=== Testing Dashboard Authentication Flow ==="

# Test 1: Check if signin page loads
echo "1. Testing signin page..."
SIGNIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/signin")
echo "   Signin page status: $SIGNIN_RESPONSE"

# Test 2: Try to authenticate with admin user
echo "2. Testing authentication..."
AUTH_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt -X POST "http://localhost:3000/api/auth/signin/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=network_admin@example.com&password=admin123&callbackUrl=/dashboard")

echo "   Auth response length: ${#AUTH_RESPONSE}"

# Test 3: Try to access dashboard with session
echo "3. Testing dashboard access..."
DASHBOARD_RESPONSE=$(curl -s -b cookies.txt -w "%{http_code}" "http://localhost:3000/dashboard")
echo "   Dashboard response length: ${#DASHBOARD_RESPONSE}"

# Test 4: Test dashboard API endpoint
echo "4. Testing dashboard API..."
API_RESPONSE=$(curl -s -b cookies.txt "http://localhost:3000/api/debug/dashboard-test")
echo "   API response: $API_RESPONSE"

echo "=== Test Complete ==="
