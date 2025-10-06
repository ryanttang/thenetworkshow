#!/bin/bash

echo "=== Testing NextAuth Flow Properly ==="

# Test 1: Get CSRF token
echo "1. Getting CSRF token..."
CSRF_RESPONSE=$(curl -s -c cookies.txt "http://localhost:3000/api/auth/csrf")
echo "   CSRF response: $CSRF_RESPONSE"

# Test 2: Sign in with CSRF token
echo "2. Signing in with CSRF token..."
SIGNIN_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -X POST "http://localhost:3000/api/auth/signin/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=network_admin@example.com&password=admin123!&callbackUrl=/dashboard&csrfToken=$(echo $CSRF_RESPONSE | jq -r '.csrfToken')")

echo "   Signin response length: ${#SIGNIN_RESPONSE}"

# Test 3: Check if we have a session
echo "3. Checking session..."
SESSION_CHECK=$(curl -s -b cookies.txt "http://localhost:3000/api/debug/dashboard-test")
echo "   Session check: $SESSION_CHECK"

# Test 4: Access dashboard
echo "4. Accessing dashboard..."
DASHBOARD_RESPONSE=$(curl -s -b cookies.txt "http://localhost:3000/dashboard")
echo "   Dashboard response length: ${#DASHBOARD_RESPONSE}"

# Test 5: Check for error in response
if echo "$DASHBOARD_RESPONSE" | grep -q "Something went wrong"; then
  echo "   ❌ ERROR FOUND: Dashboard returned error page"
  echo "$DASHBOARD_RESPONSE" | grep -A 5 -B 5 "Something went wrong"
elif echo "$DASHBOARD_RESPONSE" | grep -q "Welcome"; then
  echo "   ✅ Dashboard loaded successfully with welcome message"
else
  echo "   ⚠️ Dashboard loaded but no welcome message found"
fi

echo "=== Test Complete ==="
