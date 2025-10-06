#!/bin/bash

echo "=== Testing Dashboard with Correct Authentication ==="

# Test 1: Sign in with correct password
echo "1. Signing in with correct password..."
curl -s -c cookies.txt -b cookies.txt -X POST "http://localhost:3000/api/auth/signin/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=network_admin@example.com&password=admin123!&callbackUrl=/dashboard" > /dev/null

# Test 2: Check if we have a session
echo "2. Checking session..."
SESSION_CHECK=$(curl -s -b cookies.txt "http://localhost:3000/api/debug/dashboard-test")
echo "   Session check: $SESSION_CHECK"

# Test 3: Access dashboard
echo "3. Accessing dashboard..."
DASHBOARD_RESPONSE=$(curl -s -b cookies.txt "http://localhost:3000/dashboard")
echo "   Dashboard response length: ${#DASHBOARD_RESPONSE}"

# Test 4: Check for error in response
if echo "$DASHBOARD_RESPONSE" | grep -q "Something went wrong"; then
  echo "   ❌ ERROR FOUND: Dashboard returned error page"
  echo "$DASHBOARD_RESPONSE" | grep -A 5 -B 5 "Something went wrong"
elif echo "$DASHBOARD_RESPONSE" | grep -q "Welcome"; then
  echo "   ✅ Dashboard loaded successfully with welcome message"
else
  echo "   ⚠️ Dashboard loaded but no welcome message found"
fi

echo "=== Test Complete ==="
