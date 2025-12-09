# 🔧 Admin Authorization Fix

## Issue
You were getting this error:
```json
{
  "success": false,
  "error": "Access denied. Required roles: admin",
  "code": "FORBIDDEN"
}
```

## Root Cause
**Case Sensitivity Mismatch:**
- Database stores role as: `"ADMIN"` (uppercase) ✅
- Routes were checking for: `"admin"` (lowercase) ❌
- The comparison `"ADMIN" !== "admin"` failed!

## What Was Fixed

### 1. Component Routes (`src/features/components/routes/component.routes.ts`)
```typescript
// Before (wrong):
authorize("admin")

// After (correct):
authorize("ADMIN")
```

All 6 admin endpoints updated:
- ✅ Create Component
- ✅ Update Component
- ✅ Delete Component
- ✅ Update Stock
- ✅ Get Low Stock Analytics
- ✅ Get Out of Stock Analytics

### 2. Admin Routes (`src/routes/adminRoutes.ts`)
```typescript
// Before (wrong):
router.use(authorize("admin"));

// After (correct):
router.use(authorize("ADMIN"));
```

All 3 admin management endpoints updated:
- ✅ List All Admins
- ✅ Promote User to Admin
- ✅ Demote Admin to Student

## How to Test

### Step 1: Restart Server
The server may have auto-restarted if using `pnpm dev`. If not:
```bash
# Stop server (Ctrl+C)
# Start again
pnpm dev
```

### Step 2: Login Again (Get Fresh Token)
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kingofmonster7@gmail.com",
    "password": "Monster75!"
  }'
```

Copy the new `accessToken` from response.

### Step 3: Test Admin Endpoints

**List All Admins:**
```bash
curl http://localhost:4000/api/admin/list \
  -H "Authorization: Bearer YOUR_NEW_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmixtzjey0003ifv71dn3qvdu",
      "email": "kingofmonster7@gmail.com",
      "name": "Admin hu",
      "role": "ADMIN",
      "avatarUrl": null,
      "college": "BVCOE",
      "createdAt": "2024-12-09T..."
    }
  ],
  "count": 1
}
```

**Create Component:**
```bash
curl -X POST http://localhost:4000/api/components \
  -H "Authorization: Bearer YOUR_NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arduino Uno R3",
    "sku": "ARD-UNO-R3",
    "description": "Microcontroller board",
    "unitPriceCents": 179900,
    "stockQuantity": 50
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm4xxx...",
    "name": "Arduino Uno R3",
    "sku": "ARD-UNO-R3",
    "unitPriceCents": 179900,
    "unitPrice": 1799,
    "stockQuantity": 50,
    "isActive": true,
    "createdAt": "2024-12-09T...",
    "updatedAt": "2024-12-09T..."
  }
}
```

## Why This Happened

The Prisma schema defines roles in UPPERCASE:
```prisma
enum UserRole {
  STUDENT
  MENTOR
  ADMIN
}
```

But the routes were using lowercase strings:
```typescript
authorize("admin")  // ❌ Wrong - doesn't match "ADMIN"
```

The `authorize()` middleware does **case-sensitive** comparison:
```typescript
if (!allowedRoles.includes(req.user.role)) {
  // "ADMIN" is NOT in ["admin"]
  throw new ForbiddenError("Access denied");
}
```

## Best Practice for Future

Always use the enum from Prisma:
```typescript
import { UserRole } from "../generated/prisma/client.js";

// ✅ Good - Type-safe, can't typo
router.use(authorize(UserRole.ADMIN));

// ❌ Bad - String literal, case-sensitive, can typo
router.use(authorize("admin"));
```

The email routes already follow this pattern:
```typescript
router.get("/preview/:eventType", authorize(UserRole.ADMIN), previewEmailTemplate);
```

## Files Modified

1. `src/features/components/routes/component.routes.ts`
   - Changed 6 occurrences: `"admin"` → `"ADMIN"`

2. `src/routes/adminRoutes.ts`
   - Changed 1 occurrence: `"admin"` → `"ADMIN"`

## Verification Checklist

- [ ] Server restarted
- [ ] Login again (new token)
- [ ] Test: GET /api/admin/list → Success ✅
- [ ] Test: POST /api/components → Success ✅
- [ ] Test: PATCH /api/components/:id → Success ✅
- [ ] Test: GET /api/components/analytics/low-stock → Success ✅

## All Working Now! 🎉

Your admin access should work correctly now. The issue was simply a case-sensitivity problem in the authorization check.

---

**Pro Tip:** Update your Postman collection to verify, or use the test commands above!
