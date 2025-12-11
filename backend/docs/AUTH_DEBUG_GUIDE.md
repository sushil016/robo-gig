# Authentication Issues - Debugging Guide

## Problem: "User not authenticated" error even with admin token

### Common Causes

1. **Token Expired** ⏰
2. **Wrong Authorization Header Format** 📝
3. **Token from Different Environment** 🌍
4. **JWT_SECRET Mismatch** 🔐
5. **Role Case Mismatch** 📊

---

## Quick Checks

### 1. Check Authorization Header Format

**❌ WRONG:**
```
Authorization: your-token-here
Authorization: Bearer: your-token
Authorization:Bearer your-token
```

**✅ CORRECT:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                 ↑
            ONE SPACE
```

### 2. Check Token Expiry

Default token lifetime: **15 minutes**

If you logged in more than 15 minutes ago, your token is expired!

**Solution:** Login again to get a fresh token

```bash
POST /api/auth/login
{
  "email": "kingofmonster7@gmail.com",
  "password": "your-password"
}
```

### 3. Check Role Format

The role must be **uppercase**: `ADMIN` (not `admin`)

**Check your token payload:**
```json
{
  "userId": "...",
  "email": "kingofmonster7@gmail.com",
  "role": "ADMIN",  // ← Must be uppercase
  "sessionId": "...",
  "iat": 1234567890,
  "exp": 1234568790
}
```

---

## Step-by-Step Debug Process

### Step 1: Get Fresh Token

```bash
# Login to get fresh token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kingofmonster7@gmail.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "kingofmonster7@gmail.com",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

### Step 2: Copy the Access Token

Copy ONLY the `accessToken` value (not the whole JSON)

### Step 3: Test with the Token

```bash
# Test creating a project
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Project",
    "description": "Testing authentication",
    "category": "IOT",
    "difficulty": "BEGINNER"
  }'
```

---

## Debug Your Token (Manual)

### Option 1: Use jwt.io

1. Go to https://jwt.io
2. Paste your token in the "Encoded" section
3. Check the payload:
   - Is `role` present?
   - Is `role` value `"ADMIN"` (uppercase)?
   - Is `exp` (expiry) in the future?

### Option 2: Use Debug Script

1. Edit `scripts/debug-token.ts`
2. Replace `paste-your-token-here` with your actual token
3. Run:
```bash
cd backend
pnpm tsx scripts/debug-token.ts
```

**Output will show:**
- ✅ Token is valid or ❌ Token is invalid
- Role value and format
- Expiry time and remaining time
- Helpful error messages

---

## Postman Setup

### 1. Create Environment Variables

**Postman → Environments → Create New Environment**

Variables:
- `baseUrl`: `http://localhost:4000`
- `authToken`: (leave empty, will be set automatically)
- `adminEmail`: `kingofmonster7@gmail.com`
- `adminPassword`: `your-password`

### 2. Setup Login Request

**POST** `{{baseUrl}}/api/auth/login`

Body:
```json
{
  "email": "{{adminEmail}}",
  "password": "{{adminPassword}}"
}
```

**Tests Tab:**
```javascript
// Save token automatically
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("authToken", response.data.accessToken);
    console.log("✅ Token saved to environment");
}
```

### 3. Setup Create Project Request

**POST** `{{baseUrl}}/api/projects`

**Authorization Tab:**
- Type: Bearer Token
- Token: `{{authToken}}`

OR

**Headers Tab:**
- Key: `Authorization`
- Value: `Bearer {{authToken}}`

Body:
```json
{
  "title": "Arduino Weather Station",
  "description": "Build a weather station...",
  "category": "IOT",
  "difficulty": "BEGINNER",
  "components": [
    {
      "componentId": "cmixvbx2200019mv7k1tl7l2o",
      "quantity": 1,
      "notes": "Arduino Uno"
    }
  ]
}
```

---

## Common Error Messages & Solutions

### Error: "No authorization header provided"

**Cause:** Missing Authorization header

**Solution:** Add header: `Authorization: Bearer <token>`

---

### Error: "Invalid authorization header format"

**Cause:** Wrong format (missing "Bearer" or space)

**Fix these:**
- ❌ `Authorization: token123`
- ❌ `Authorization: Bearer:token123`
- ❌ `Authorization:Bearer token123`

**Use this:**
- ✅ `Authorization: Bearer token123`
  (Note the space after Bearer)

---

### Error: "Access token expired"

**Cause:** Token older than 15 minutes

**Solution:** Login again to get fresh token

---

### Error: "User not authenticated"

**Cause:** `req.user` is undefined in authorize middleware

**Possible reasons:**
1. Token verification failed silently
2. authenticate middleware not called before authorize
3. Token doesn't have required fields

**Check routes file:**
```typescript
// ✅ CORRECT ORDER
router.post('/', authenticate, authorize('ADMIN'), handleCreateProject);

// ❌ WRONG - authorize before authenticate
router.post('/', authorize('ADMIN'), authenticate, handleCreateProject);
```

---

### Error: "Access denied. Required roles: ADMIN"

**Cause:** Role mismatch

**Check:**
1. Is user role in database `ADMIN` (uppercase)?
2. Is role in token `ADMIN` (uppercase)?
3. Is authorize checking for `'ADMIN'` (uppercase)?

**Verify in database:**
```sql
SELECT email, role FROM "User" WHERE email = 'kingofmonster7@gmail.com';
```

Should show: `ADMIN` (not `admin`)

---

## Testing Checklist

- [ ] Login successful, token received
- [ ] Token copied correctly (no extra spaces/quotes)
- [ ] Authorization header format correct: `Bearer <token>`
- [ ] Token not expired (< 15 minutes old)
- [ ] User role is `ADMIN` (uppercase) in database
- [ ] JWT_SECRET matches between token generation and verification
- [ ] Route has both `authenticate` and `authorize` middlewares
- [ ] Middleware order is correct: `authenticate` before `authorize`

---

## Environment Variables Check

Make sure these are set in your `.env` file:

```bash
# JWT Settings
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**⚠️ If you changed JWT_SECRET after login:**
- Old tokens won't work
- Need to login again

---

## Quick Fix Commands

### 1. Check User Role in Database
```bash
cd backend
pnpm tsx -e "
import { prisma } from './src/lib/prisma.js';
const user = await prisma.user.findUnique({
  where: { email: 'kingofmonster7@gmail.com' }
});
console.log('User role:', user?.role);
prisma.\$disconnect();
"
```

### 2. Ensure User is Admin
```bash
cd backend
pnpm tsx scripts/promote-admin.ts kingofmonster7@gmail.com
```

### 3. Test Token Verification
```bash
cd backend
# Edit scripts/debug-token.ts with your token first
pnpm tsx scripts/debug-token.ts
```

---

## Still Not Working?

### Enable Debug Logging

Add console logs to auth middleware:

```typescript
// In src/middlewares/auth.middleware.ts

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header:', authHeader); // DEBUG
    
    // ... rest of code
    
    const decoded = verifyAccessToken(token);
    console.log('✅ Decoded token:', decoded); // DEBUG
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error); // DEBUG
    // ... error handling
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 req.user:', req.user); // DEBUG
    console.log('🔍 Allowed roles:', allowedRoles); // DEBUG
    console.log('🔍 User role:', req.user?.role); // DEBUG
    
    // ... rest of code
  };
}
```

Restart server and watch console output.

---

## Contact Points

If still having issues, check:

1. **Server logs** - Look for authentication errors
2. **Network tab** - Verify headers being sent
3. **Postman console** - Check actual request details
4. **Token payload** - Decode at jwt.io
5. **Database** - Verify user role is ADMIN

---

**Last Updated:** December 11, 2025  
**Status:** Active Debugging Guide
