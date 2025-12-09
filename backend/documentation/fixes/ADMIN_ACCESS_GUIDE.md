# Admin Access Management - Security Guide

## 🔒 Why Role Cannot Be Set During Signup

For **security reasons**, users should NEVER be able to set their own role during signup. This prevents:
- Unauthorized users creating admin accounts
- Privilege escalation attacks
- Security breaches

All users are created as `STUDENT` by default. Admin access must be granted through secure methods.

---

## 🛡️ Secure Methods to Create Admin Users

### **Method 1: Promote Existing User (Recommended)**

#### Option A: Using CLI Script
The **simplest and most secure** method for your first admin:

```bash
cd backend

# First, create a regular account at POST /api/auth/signup
# Then promote that user to admin:
pnpm run promote-admin kingofmonster7@gmail.com
```

**Output:**
```
✅ User promoted to admin successfully!
   ID: cmixtzjey0003ifv71dn3qvdu
   Email: kingofmonster7@gmail.com
   Name: Admin hu
   Role: ADMIN

They can now access admin endpoints.
```

#### Option B: Using Prisma Studio (GUI)
```bash
cd backend
pnpm prisma studio
```

1. Open `http://localhost:5555`
2. Click on `User` table
3. Find your user by email
4. Change `role` from `STUDENT` to `ADMIN`
5. Click **Save**

#### Option C: Using Direct SQL
```bash
# Connect to your database
psql "postgresql://..."

# Update user role
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'kingofmonster7@gmail.com';
```

---

### **Method 2: Bootstrap Script (First Admin Only)**

For creating the very first admin interactively:

```bash
cd backend
pnpm run bootstrap
```

**Interactive prompts:**
```
🚀 BuildWise Bootstrap - Create First Admin

Enter admin email: admin@buildwise.com
Enter admin password (min 8 chars): SecurePassword123!
Enter admin name (optional): Super Admin

✅ Admin user created successfully!
   ID: cm4xxx...
   Email: admin@buildwise.com
   Name: Super Admin
   Role: ADMIN
```

**Note:** This script will exit if an admin already exists.

---

### **Method 3: Admin Promotion API (Production)**

Once you have at least one admin, they can promote other users via API:

#### Promote User to Admin
```bash
POST /api/admin/promote
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
Content-Type: application/json

{
  "email": "newadmin@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User promoted to admin successfully",
  "data": {
    "id": "cm4xxx...",
    "email": "newadmin@example.com",
    "name": "New Admin",
    "role": "ADMIN"
  }
}
```

#### Demote Admin to Student
```bash
POST /api/admin/demote
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
Content-Type: application/json

{
  "email": "oldadmin@example.com"
}
```

**Note:** You cannot demote yourself!

#### List All Admins
```bash
GET /api/admin/list
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm4xxx...",
      "email": "admin@buildwise.com",
      "name": "Super Admin",
      "role": "ADMIN",
      "avatarUrl": null,
      "college": null,
      "createdAt": "2024-12-09T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 📋 Quick Start Guide

### Step 1: Create Your Account
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kingofmonster7@gmail.com",
    "password": "Monster75!",
    "name": "Admin User",
    "college": "BVCOE"
  }'
```

### Step 2: Promote to Admin
```bash
cd backend
pnpm run promote-admin kingofmonster7@gmail.com
```

### Step 3: Login and Get Access Token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kingofmonster7@gmail.com",
    "password": "Monster75!"
  }'
```

**Copy the `accessToken` from response.**

### Step 4: Test Admin Access
```bash
# Create a component (admin-only operation)
curl -X POST http://localhost:4000/api/components \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arduino Uno R3",
    "sku": "ARD-UNO-R3",
    "unitPriceCents": 179900,
    "stockQuantity": 50
  }'
```

If successful, you have admin access! ✅

---

## 🔑 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Bootstrap** | `pnpm run bootstrap` | Create first admin interactively |
| **Promote** | `pnpm run promote-admin <email>` | Promote existing user to admin |
| **Prisma Studio** | `pnpm prisma studio` | Open GUI database editor |

---

## 🚨 Security Best Practices

### ✅ DO:
- ✅ Use CLI scripts to create first admin
- ✅ Use API endpoints to promote subsequent admins
- ✅ Require existing admin authentication for promotions
- ✅ Log all admin role changes
- ✅ Use strong passwords (min 8 chars)
- ✅ Limit number of admin accounts
- ✅ Review admin list regularly

### ❌ DON'T:
- ❌ Allow role parameter in signup endpoint
- ❌ Create hardcoded admin credentials
- ❌ Share admin credentials
- ❌ Allow self-promotion to admin
- ❌ Skip authentication for promotion endpoints
- ❌ Create admin accounts via public APIs

---

## 🔍 Troubleshooting

### Problem: "User not found"
**Solution:** Create account first via `/api/auth/signup`, then promote.

### Problem: "User is already an admin"
**Solution:** User already has admin role. Try logging in.

### Problem: "Unauthorized"
**Solution:** 
1. Check if you're using the correct access token
2. Verify token hasn't expired (valid for 15 minutes)
3. Refresh token if needed via `/api/auth/refresh`

### Problem: "Forbidden - Access denied"
**Solution:** Your account doesn't have admin role. Get promoted first.

---

## 📊 Admin Role Capabilities

Admin users can:
- ✅ Create/Update/Delete components
- ✅ Manage component stock
- ✅ View low-stock and out-of-stock analytics
- ✅ Promote/Demote other users
- ✅ View all admin accounts
- ✅ Create/Approve featured projects
- ✅ Manage kits and bundles
- ✅ View order analytics
- ✅ Access admin dashboard

Student users can:
- ✅ Browse components (read-only)
- ✅ Create projects
- ✅ Place orders
- ✅ View their own data
- ❌ Cannot access admin endpoints

---

## 🎯 Your Current Situation

You created account: `kingofmonster7@gmail.com`

**To get admin access, run:**
```bash
cd backend
pnpm run promote-admin kingofmonster7@gmail.com
```

Then login again to get a new token with admin role.

---

## 📝 Environment-Specific Notes

### Development
- Use CLI scripts freely
- Prisma Studio is convenient
- Test admin endpoints locally

### Staging
- Use admin promotion API
- Limit admin accounts
- Log all role changes

### Production
- **NEVER** expose role promotion without auth
- Use 2FA for admin accounts (future)
- Monitor admin activities
- Regular security audits
- Rotate admin credentials

---

## 🔗 Related Endpoints

- `POST /api/auth/signup` - Create student account
- `POST /api/auth/login` - Get access token
- `POST /api/admin/promote` - Promote to admin (admin only)
- `POST /api/admin/demote` - Demote from admin (admin only)
- `GET /api/admin/list` - List all admins (admin only)

---

**Need help?** Check the logs or open an issue! 🚀
