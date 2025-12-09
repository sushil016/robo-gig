# Authentication API Testing Guide

## Prerequisites

1. Server running on `http://localhost:4000`
2. Database is up and migrated
3. Environment variables are configured

## Test Sequence

Follow this sequence to test all authentication flows:

---

## 1. Health Check

Verify server is running:

```bash
curl http://localhost:4000/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

---

## 2. Signup (Email/Password)

Create a new user account:

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "college": "MIT"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "STUDENT",
      "avatarUrl": null,
      "college": "MIT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Save the tokens for later tests!**

### Validation Tests

**Missing Email:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecurePass123!"
  }'
```
Expected: `400 - Email is required`

**Weak Password:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "weak"
  }'
```
Expected: `400 - Password must be at least 8 characters long`

**Duplicate Email:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```
Expected: `409 - User with this email already exists`

---

## 3. Login (Email/Password)

Login with existing credentials:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "STUDENT",
      "avatarUrl": null,
      "college": "MIT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### Login Error Tests

**Wrong Password:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword123!"
  }'
```
Expected: `401 - Invalid email or password`

**Non-existent User:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123!"
  }'
```
Expected: `401 - Invalid email or password`

---

## 4. Get Current User (Protected Route)

Access protected endpoint with JWT token:

```bash
# Replace YOUR_ACCESS_TOKEN with the token from login/signup
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "avatarUrl": null,
    "college": "MIT",
    "isActive": true,
    "createdAt": "2025-12-09T10:30:00.000Z",
    "updatedAt": "2025-12-09T10:30:00.000Z"
  }
}
```

### Authentication Error Tests

**No Token:**
```bash
curl http://localhost:4000/api/auth/me
```
Expected: `401 - No authorization header provided`

**Invalid Token:**
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer invalid.token.here"
```
Expected: `401 - Invalid access token`

**Expired Token:**
Wait 15 minutes after getting token, then:
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```
Expected: `401 - Access token expired`

---

## 5. Refresh Access Token

Get new access token using refresh token:

```bash
# Replace YOUR_REFRESH_TOKEN with the refresh token from login/signup
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "STUDENT",
      "avatarUrl": null,
      "college": "MIT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

## 6. Logout

Invalidate current session:

```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

After logout, trying to use the same token should fail:
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
Expected: `401 - Session not found` (if session-based) or token still works until expiration (if stateless)

---

## 7. Google OAuth Flow

### Step 1: Get Auth URL

```bash
curl http://localhost:4000/api/auth/google
```

This will redirect to Google OAuth consent screen. In browser, visit:
```
http://localhost:4000/api/auth/google
```

### Step 2: Callback Handling

After user authenticates with Google, Google redirects to:
```
http://localhost:4000/api/auth/google/callback?code=AUTHORIZATION_CODE
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "user@gmail.com",
      "name": "Google User",
      "role": "STUDENT",
      "avatarUrl": "https://lh3.googleusercontent.com/...",
      "college": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

## 8. GitHub OAuth Flow

### Step 1: Get Auth URL

In browser, visit:
```
http://localhost:4000/api/auth/github
```

This will redirect to GitHub OAuth authorization screen.

### Step 2: Callback Handling

After user authorizes, GitHub redirects to:
```
http://localhost:4000/api/auth/github/callback?code=AUTHORIZATION_CODE
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "GitHub authentication successful",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "user@github.com",
      "name": "GitHub User",
      "role": "STUDENT",
      "avatarUrl": "https://avatars.githubusercontent.com/...",
      "college": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

## Complete Test Script (Bash)

Save as `test-auth.sh` and run with `bash test-auth.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:4000"
API_URL="$BASE_URL/api/auth"

echo "=== Testing RoboGig Authentication API ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Health Check
echo "1. Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Server is healthy${NC}"
else
    echo -e "${RED}✗ Server health check failed${NC}"
    exit 1
fi
echo ""

# 2. Signup
echo "2. Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }')

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✓ Signup successful${NC}"
    ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
    REFRESH_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"refreshToken":"[^"]*' | sed 's/"refreshToken":"//')
else
    echo -e "${RED}✗ Signup failed${NC}"
    echo "$SIGNUP_RESPONSE"
    exit 1
fi
echo ""

# 3. Get Me (Protected Route)
echo "3. Testing Get Me (Protected)..."
ME_RESPONSE=$(curl -s "$API_URL/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$ME_RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✓ Get Me successful${NC}"
else
    echo -e "${RED}✗ Get Me failed${NC}"
    echo "$ME_RESPONSE"
fi
echo ""

# 4. Refresh Token
echo "4. Testing Refresh Token..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✓ Refresh Token successful${NC}"
    NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
else
    echo -e "${RED}✗ Refresh Token failed${NC}"
    echo "$REFRESH_RESPONSE"
fi
echo ""

# 5. Logout
echo "5. Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/logout" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q "Logout successful"; then
    echo -e "${GREEN}✓ Logout successful${NC}"
else
    echo -e "${RED}✗ Logout failed${NC}"
    echo "$LOGOUT_RESPONSE"
fi
echo ""

echo "=== All Tests Completed ==="
```

Make it executable:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## Testing with Postman

1. Import `RoboGig-Auth-API.postman_collection.json`
2. Set the `baseUrl` variable to `http://localhost:4000/api/auth`
3. Run requests in this order:
   - Signup
   - Login (saves tokens automatically)
   - Get Me
   - Refresh Token
   - Logout

---

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution:** Check DATABASE_URL in .env and ensure database is running

### Issue: "Google OAuth not configured"
**Solution:** Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env

### Issue: "Token verification failed"
**Solution:** Check JWT_SECRET is set and consistent

### Issue: "CORS error"
**Solution:** Add your frontend URL to FRONTEND_URL in .env

### Issue: "Session not found"
**Solution:** Session might have expired (7 days), login again

---

## Performance Testing

Test with multiple concurrent requests using Apache Bench:

```bash
# Test signup endpoint
ab -n 100 -c 10 \
  -H "Content-Type: application/json" \
  -p signup.json \
  http://localhost:4000/api/auth/signup

# Test login endpoint
ab -n 1000 -c 50 \
  -H "Content-Type: application/json" \
  -p login.json \
  http://localhost:4000/api/auth/login
```

Create `signup.json`:
```json
{"email":"test@example.com","password":"SecurePass123!"}
```

Create `login.json`:
```json
{"email":"test@example.com","password":"SecurePass123!"}
```

---

## Security Testing

### Test SQL Injection Protection
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com OR 1=1--",
    "password": "anything"
  }'
```
Expected: Should fail safely with validation error

### Test XSS Protection
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "<script>alert(\"XSS\")</script>"
  }'
```
Expected: Should sanitize or reject input

### Test JWT Tampering
1. Get a valid token
2. Modify the payload
3. Try to use modified token
Expected: Should reject with "Invalid access token"

---

## Monitoring & Logging

Check server logs for:
- Authentication attempts
- Failed login attempts (potential brute force)
- Token generation
- Errors and exceptions

Example log search:
```bash
# Check recent authentication activity
tail -f server.log | grep "auth"

# Check for errors
tail -f server.log | grep "error"
```

---

## Next Steps After Testing

1. ✅ All tests passing? Great!
2. 📝 Document any issues found
3. 🔒 Add rate limiting for production
4. 📧 Implement email verification
5. 🔄 Add password reset flow
6. 📊 Set up monitoring and analytics
7. 🚀 Deploy to staging/production

---

**Happy Testing! 🎉**
