#!/bin/bash

echo "====== Testing Raut Industries Login Flow ======"
echo ""

# Test 1: Login
echo "1. Testing Login Endpoint"
echo "   POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rautindustries.com","password":"Admin@123"}')

echo "Response:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token from response
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed - no token received"
  echo ""
  exit 1
else
  echo "✅ Login successful - Token: ${TOKEN:0:20}..."
  echo ""
fi

# Test 2: Get current user
echo "2. Testing Get Current User Endpoint"
echo "   GET /api/auth/me"
ME_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ME_RESPONSE" | jq . 2>/dev/null || echo "$ME_RESPONSE"
echo ""

# Test 3: Test with invalid token
echo "3. Testing 401 Response with Invalid Token"
echo "   GET /api/auth/me (invalid token)"
INVALID_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid_token")

echo "Response:"
echo "$INVALID_RESPONSE" | jq . 2>/dev/null || echo "$INVALID_RESPONSE"
echo ""

# Test 4: Test without token
echo "4. Testing 401 Response without Token"
echo "   GET /api/auth/me (no token)"
NO_TOKEN_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X GET http://localhost:3000/api/auth/me)

echo "Response:"
echo "$NO_TOKEN_RESPONSE"
echo ""

# Test 5: Test BMS integration endpoint
echo "5. Testing BMS Integration Endpoint"
echo "   GET /api/bms (with token)"
BMS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/bms \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$BMS_RESPONSE" | jq . 2>/dev/null || echo "$BMS_RESPONSE"
echo ""

# Test 6: Test dashboard endpoint
echo "6. Testing Reports Dashboard Endpoint"
echo "   GET /api/reports/dashboard (with token)"
DASHBOARD_RESPONSE=$(curl -s -X GET http://localhost:3000/api/reports/dashboard \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$DASHBOARD_RESPONSE" | jq . 2>/dev/null || echo "$DASHBOARD_RESPONSE"
echo ""

echo "====== All Tests Completed ======"
