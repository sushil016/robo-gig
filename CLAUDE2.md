# CLAUDE2.md — RoboRoot Production Fix Guide
> Auto-generated from the RoboRoot Production Audit Report (2026-05-16)
> Purpose: Claude Code task instructions — fix issues one by one in priority order
> Rule: Complete and verify each task before moving to the next. Do not skip ahead.
> Check The target Architecture , flows
---

SECURITY AUDIT — DETAILED

  Authentication & Sessions

  ✓ Passwords hashed with bcrypt
  ✓ JWT with short expiry (15m access / 7d refresh)
  ✓ Session table tracks userAgent + IP
  ✗ No refresh token rotation — stolen refresh token usable for 7 days
  ✗ No account lockout after N failed login attempts
  ✗ No MFA support
  ✗ No email verification after signup
  ✗ Tokens in localStorage — XSS exfiltration risk
  ✗ No device management UI

  API Security

  ✓ Helmet middleware enabled
  ✓ Role-based authorization on admin endpoints
  ✓ Zod/custom validation on inputs
  ✗ No rate limiting on any endpoint
  ✗ No request size limits per endpoint (only global 10MB)
  ✗ No idempotency keys on payment/order endpoints
  ✗ Wildcard CORS origin for preview deployments
  ✗ No IP allowlist for admin endpoints
  ✗ Component analytics endpoints unreachable (routing bug)

  Payment Security

  ✗ No real gateway integration — TEST only
  ✗ No webhook signature validation (no webhooks)
  ✗ No idempotency keys to prevent duplicate charges
  ✗ Any user can confirm payment on any order ID
  ✗ No PCI-DSS considerations documented
  ✗ No payment event audit log

  Data Leakage

  ✓ Passwords never returned in responses
  ✓ Soft delete on Component (isActive flag)
  ✗ Hard delete on Project — data unrecoverable
  ✗ Admin action logs never written
  ✗ No PII encryption at rest
  ✗ Raw payment gateway payload stored in DB without masking


Target Architecture

  ┌─────────────────────────────────────────────────────────────┐
  │                        CDN / Cloudflare                     │
  └────────────────────┬────────────────────────────────────────┘
                       │
  ┌────────────────────▼───────────────────────────────────────┐
  │              Next.js (Vercel / Docker)                     │
  │   App Router · SSG for catalog · SSR for auth-gated pages  │
  └────────────────────┬───────────────────────────────────────┘
                       │ HTTPS + httpOnly cookies
  ┌────────────────────▼───────────────────────────────────────┐
  │              Express API (Node.js)                         │
  │   Auth · Catalog · Orders · Payments · Addresses           │
  │   Rate limiting · Helmet · Request ID middleware           │
  └──┬──────────┬──────────┬──────────┬─────────────────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
  PostgreSQL  Redis      BullMQ    Azure Blob
  (primary)  (sessions  (email +  (product
             cart,      webhook +  images)
             product    job queues)
             cache)
                       │
          ┌────────────▼──────────┐
          │   Workers (Docker)    │
          │  EmailWorker          │
          │  WebhookRetryWorker   │
          │  StockSyncWorker      │
          │  TrackingPollWorker   │
          └───────────────────────┘

  ---


PAYMENT FLOW DIAGRAM

  User clicks "Place Order"
           │
           ▼
  POST /api/orders
    └─ Validate items & stock (inside transaction)
    └─ Reserve stock (decrement + add to reservedQty)
    └─ Create Order (PENDING_PAYMENT)
    └─ Create Payment record (CREATED)
           │
           ▼
  POST /api/payments/initiate/:orderId
    └─ Call Razorpay createOrder API
    └─ Store gatewayOrderId on Payment record
    └─ Return { paymentUrl, gatewayOrderId, keyId }
           │
           ▼
  Frontend opens Razorpay Checkout modal
           │
      ┌────┴────┐
      ▼         ▼
   Success    Failure
      │         │
      │         ▼
      │   User sees failure page
      │   Order stays PENDING_PAYMENT
      │   Stock reservation released after TTL
      │
      ▼
  Razorpay POSTs to:
  POST /api/payments/webhook/razorpay
    └─ Verify X-Razorpay-Signature (HMAC-SHA256)
    └─ Find Payment by gatewayOrderId
    └─ Inside transaction:
         Order → PAID
         Payment → SUCCESS / FAILED
         Send order confirmation email
    └─ Return 200 (immediately, before processing)
           │
           ▼
  Admin changes status to PROCESSING → SHIPPED
    └─ Generate AWB via Shiprocket API
    └─ Store trackingAwb, trackingUrl on Order
    └─ Email customer: "Your order has shipped"
           │
           ▼
  Shiprocket webhook:
  POST /api/shipping/webhook
    └─ Order → DELIVERED
    └─ Email customer: "Delivered!"
    └─ Release stock reservation permanently

  ---
  ORDER LIFECYCLE DIAGRAM

  CREATE ORDER
       │
       ▼
  PENDING_PAYMENT ──(timeout 30min)──► CANCELLED (stock restored)
       │
       │ Payment gateway webhook (SUCCESS)
       ▼
     PAID
       │
       │ Admin reviews, confirms items available
       ▼
  PROCESSING
       │
       │ Admin packs, generates shipping label
       ▼
    PACKED
       │
       │ Courier picks up, AWB assigned
       ▼
   SHIPPED ──── user/admin can view tracking
       │
       │ Shiprocket webhook: out for delivery
       ▼
  OUT_FOR_DELIVERY
       │
       │ Shiprocket webhook: delivered
       ▼
  DELIVERED ───── trigger review request email (T+2 days)
       │
       │ (within return window)
       ▼
  RETURN_REQUESTED
       │
       ▼
  RETURNED → REFUND_INITIATED → REFUNDED



## HOW TO USE THIS FILE

Work through each task sequentially. For every task:
1. Read the **Problem**, **Location**, and **Fix** sections
2. Make the change
3. Run the listed **Verify** command
4. Mark the checkbox `[x]` when done
5. Move to the next task

Never start a new task while the previous one is broken. If a fix requires a migration, run it before proceeding.

---

## SPRINT 1 — Unblock Production
> These are non-negotiable. Fix all of these before writing any new features.

---

### TASK 01 — Fix Express Analytics Routing Bug
- **Priority:** P0-CRITICAL
- **Effort:** ~30 min
- **Status:** [x] DONE

**Problem:**
In `component.routes.ts`, the dynamic route `GET /:id` is registered before
`GET /analytics/low-stock` and `GET /analytics/out-of-stock`. Express matches
`/analytics/low-stock` against `:id` first, so the analytics endpoints return
404 forever. Admin inventory alerts are completely broken.

**Location:**
```
backend/src/features/components/routes/component.routes.ts
```

**Fix:**
Move ALL `/analytics/*` route registrations ABOVE the `/:id` route.

```typescript
// CORRECT ORDER — analytics routes FIRST
router.get('/analytics/low-stock', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getComponentsLowStock);
router.get('/analytics/out-of-stock', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getComponentsOutOfStock);

// Dynamic param route LAST
router.get('/:id', getComponentById);
```

**Verify:**
```bash
# Start the backend dev server, then:
curl http://localhost:5000/api/components/analytics/low-stock \
  -H "Authorization: Bearer <admin_token>"
# Expected: 200 with data array, NOT 404
```

---

### TASK 02 — Fix SUPER_ADMIN Login in Admin Panel
- **Priority:** P0-CRITICAL
- **Effort:** ~30 min
- **Status:** [x] DONE

**Problem:**
The admin login handler checks `role !== "ADMIN"` — meaning any user with role
`SUPER_ADMIN` is rejected and cannot log in to the admin panel at all.

**Location:**
```
admin-frontend/src/components/AdminConsole.tsx
```
Search for: `This account is not an admin`

**Fix:**
```typescript
// BEFORE
if (payload.data.user.role !== "ADMIN") {
  throw new Error("This account is not an admin.");
}

// AFTER
if (!["ADMIN", "SUPER_ADMIN"].includes(payload.data.user.role)) {
  throw new Error("This account is not an admin.");
}
```

Also verify the `UserRole` enum is consistent across:
- `backend/prisma/schema.prisma`
- `frontend/types/` (or wherever UserRole is defined)
- `admin-frontend/src/types/`

All three must have both `ADMIN` and `SUPER_ADMIN`.

**Verify:**
Log in to the admin panel with a `SUPER_ADMIN` account. Should succeed.

---

### TASK 03 — Fix Order Ownership Check (Payment Confirm)
- **Priority:** P0-CRITICAL (Authorization Gap)
- **Effort:** ~1 hr
- **Status:** [x] DONE

**Problem:**
`POST /api/orders/:id/payments/confirm` does not verify that the requesting
user owns the order. Any authenticated user can call this endpoint with any
order ID and mark it as paid without actually paying.

**Location:**
```
backend/src/features/orders/services/order.service.ts
backend/src/features/orders/controllers/order.controller.ts
```
Search for: `confirmUserOrderPayment`

**Fix:**
In the service or controller, add an ownership check before confirming:

```typescript
// In confirmUserOrderPayment (service)
const order = await prisma.order.findUnique({
  where: { id: orderId },
  select: { userId: true, status: true }
});

if (!order) throw new AppError('Order not found', 404);

if (order.userId !== requestingUserId) {
  throw new AppError('Forbidden: you do not own this order', 403);
}

if (order.status !== 'PENDING_PAYMENT') {
  throw new AppError('Order is not awaiting payment', 400);
}
```

**Verify:**
```bash
# Login as User A, get their token
# Attempt to confirm an order belonging to User B using User A's token
# Expected: 403 Forbidden
```

---

### TASK 04 — Wrap Stock Deduction in Prisma Transaction
- **Priority:** P1-HIGH (Overselling / Race Condition)
- **Effort:** ~2 hr
- **Status:** [x] DONE

**Problem:**
Order creation reads stock, validates it, creates the order, then deducts stock
as four separate operations. Under concurrent load (two users buying the last
unit simultaneously), both pass validation, both create orders, and stock goes
to -1.

**Location:**
```
backend/src/features/orders/services/order.service.ts
```
Search for: `createOrder`

**Fix:**
Wrap the entire stock-read → order-create → stock-deduct flow inside a single
`prisma.$transaction`:

```typescript
const newOrder = await prisma.$transaction(async (tx) => {
  // 1. Validate and deduct stock atomically
  for (const item of items) {
    const component = await tx.component.findUnique({
      where: { id: item.componentId },
      select: { stockQuantity: true, name: true }
    });

    if (!component) {
      throw new Error(`Component ${item.componentId} not found`);
    }
    if (component.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${component.name}`);
    }

    await tx.component.update({
      where: { id: item.componentId },
      data: { stockQuantity: { decrement: item.quantity } }
    });
  }

  // 2. Create order inside the same transaction
  const order = await tx.order.create({
    data: {
      userId,
      status: 'PENDING_PAYMENT',
      // ...rest of your order fields
    }
  });

  return order;
});
```

**Verify:**
Write a test that fires two simultaneous requests for the last unit in stock.
Only one should succeed. The other should return a 400 with "Insufficient stock".

```bash
# Quick manual test with curl or a small script:
# Set a component's stockQuantity to 1 in the DB
# Fire two simultaneous POST /api/orders requests for that component
# Check DB: stockQuantity should be 0 (not -1), only one order created
```

---

### TASK 05 — Add Next.js Middleware Route Guards
- **Priority:** P0-CRITICAL
- **Effort:** ~2 hr
- **Status:** [x] DONE

**Problem:**
Pages like `/checkout`, `/orders`, `/profile`, `/settings`, `/wishlist` have
no server-side protection. Unauthenticated users can load these pages. Bots
can crawl checkout. SSR leaks component shapes without auth.

**Location:**
```
frontend/   ← middleware.ts does NOT exist yet. Create it.
```

**Fix:**
Create `frontend/middleware.ts` at the root of the Next.js app:

```typescript
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = [
  '/checkout',
  '/orders',
  '/profile',
  '/settings',
  '/wishlist',
]

export function middleware(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value

  const isProtected = PROTECTED_PATHS.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/orders/:path*',
    '/profile',
    '/settings',
    '/wishlist',
  ],
}
```

> ⚠️ NOTE: This only works properly once auth tokens are moved to httpOnly
> cookies (Task 06). Until then, the cookie won't be set and all users will
> be redirected. Do Task 06 immediately after this one.

**Verify:**
```bash
# Open an incognito browser (no session)
# Navigate directly to /checkout
# Expected: redirect to /login?redirect=/checkout
```

---

### TASK 06 — Move Auth Tokens to httpOnly Cookies
- **Priority:** P1-HIGH (XSS Vulnerability)
- **Effort:** ~4 hr
- **Status:** [x] DONE

**Problem:**
Access and refresh tokens are stored in `localStorage` via Zustand persist.
Any JavaScript on the page (including injected by a compromised npm package)
can read and exfiltrate these tokens. This also breaks the server-side route
guard in Task 05.

**Locations:**
```
frontend/lib/store/authStore.ts         ← Zustand store with localStorage persist
backend/src/features/auth/             ← login + refresh endpoints
backend/src/middleware/authenticate.ts ← reads Bearer token from header
```

**Fix (Backend — set cookies on login/refresh):**
```typescript
// In login and refresh controllers, after generating tokens:
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth/refresh', // restrict refresh token to refresh endpoint
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// On logout, clear both cookies
res.clearCookie('accessToken');
res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
```

**Fix (Backend — authenticate middleware reads cookie too):**
```typescript
// In authenticate middleware, accept token from cookie OR Authorization header
const token =
  req.cookies?.accessToken ||
  req.headers.authorization?.replace('Bearer ', '');

if (!token) return res.status(401).json({ message: 'Unauthorized' });
```

**Fix (Frontend — remove localStorage token storage):**
- Remove the `persist` middleware from `authStore.ts` for token fields
- Store only non-sensitive user info (name, role, email) in Zustand state
- Tokens are now managed entirely by the browser cookie jar

**Verify:**
1. Login → inspect browser cookies → `accessToken` cookie should be `HttpOnly`
   (not readable via `document.cookie` in console)
2. Refresh the page → user should still be authenticated (cookie persists)
3. Call a protected API endpoint without Authorization header → should still
   work (token read from cookie)
4. Navigate to `/checkout` without login → should redirect (Task 05 now works)

---

### TASK 07 — Add Admin Token Refresh Mechanism
- **Priority:** P0-CRITICAL
- **Effort:** ~3 hr
- **Status:** [x] DONE

**Problem:**
The admin panel stores only an `accessToken` in localStorage. After 15 minutes,
every API call silently returns 401. The admin sees stale or empty tables with
no indication that they need to re-authenticate.

**Location:**
```
admin-frontend/src/components/AdminConsole.tsx
```
Search for: `apiFetch` function

**Fix:**
Update the `apiFetch` wrapper to detect 401 responses, call the refresh
endpoint, store the new tokens, and retry the original request:

```typescript
async function apiFetch(url: string, options: RequestInit = {}) {
  const makeRequest = async (token: string) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  };

  let accessToken = localStorage.getItem('adminAccessToken');
  let response = await makeRequest(accessToken!);

  if (response.status === 401) {
    // Try to refresh
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (!refreshToken) {
      // No refresh token — force logout
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      window.location.href = '/admin/login';
      return;
    }

    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!refreshRes.ok) {
      // Refresh failed — force logout
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      window.location.href = '/admin/login';
      return;
    }

    const { accessToken: newAccess, refreshToken: newRefresh } =
      await refreshRes.json();

    localStorage.setItem('adminAccessToken', newAccess);
    localStorage.setItem('adminRefreshToken', newRefresh);

    // Retry original request with new token
    response = await makeRequest(newAccess);
  }

  return response;
}
```

**Verify:**
1. Log in to admin panel
2. Wait 16 minutes (or manually expire the JWT)
3. Perform any admin action (load orders, etc.)
4. Expected: action succeeds silently — no logout, no empty table

---

### TASK 08 — Add Rate Limiting on Auth Endpoints
- **Priority:** P1-HIGH
- **Effort:** ~1 hr
- **Status:** [x] DONE

**Problem:**
`POST /api/auth/login` and `POST /api/auth/signup` have zero rate limiting.
An attacker can attempt unlimited password guesses or create thousands of
spam accounts.

**Location:**
```
backend/src/server.ts   (or wherever global middleware is registered)
```

**Fix:**
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per IP per window
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply BEFORE route definitions
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
```

**Verify:**
```bash
# Fire 21 POST requests to /api/auth/login in quick succession
for i in {1..21}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# First 20: 401 (wrong password)
# 21st: 429 (Too Many Requests)
```

---

### TASK 09 — Queue Email Notifications on Order Events
- **Priority:** P1-HIGH
- **Effort:** ~4 hr
- **Status:** [x] DONE

**Problem:**
`EmailEventType` enum defines `ORDER_PLACED`, `ORDER_SHIPPED`, `ORDER_DELIVERED`,
`PAYMENT_SUCCESS`, `PAYMENT_FAILED` — but the order service never actually calls
`queueEmailNotification`. Orders are created and updated with zero customer
communication.

**Location:**
```
backend/src/features/orders/services/order.service.ts
```

**Fix:**
After each state transition, call the email queue function:

```typescript
// After order creation (status → PENDING_PAYMENT)
await queueEmailNotification(userId, 'ORDER_PLACED', {
  orderId: newOrder.id,
  total: newOrder.totalAmount,
  items: orderItems,
});

// After payment confirmed (status → PAID)
await queueEmailNotification(order.userId, 'PAYMENT_SUCCESS', {
  orderId: order.id,
  total: order.totalAmount,
});

// After admin ships order (status → SHIPPED)
await queueEmailNotification(order.userId, 'ORDER_SHIPPED', {
  orderId: order.id,
  trackingUrl: order.trackingUrl,
  trackingAwb: order.trackingAwb,
});

// After delivered (status → DELIVERED)
await queueEmailNotification(order.userId, 'ORDER_DELIVERED', {
  orderId: order.id,
});
```

Find `queueEmailNotification` in the codebase — it should already exist based
on the audit. If it's a stub, verify it actually sends/enqueues the email.

**Verify:**
1. Create a test order in dev
2. Check email logs or the email queue
3. Confirm the order placed email was triggered

---

## SPRINT 2 — Core Commerce
> Start only after all Sprint 1 tasks are marked done.

---

### TASK 10 — Coupon Model + Admin CRUD + Validation
- **Priority:** P1-HIGH
- **Effort:** ~6 hr
- **Status:** [x] DONE

**Problem:**
Three coupons (`ROBO10`, `STUDENT250`, `FREESHIP`) are hardcoded as strings in
the order service. No admin UI, no expiry, no per-user limits, no usage tracking.

**Step 1 — Add Prisma schema:**
```prisma
// Add to schema.prisma

enum DiscountType {
  PERCENTAGE
  FLAT
  FREE_SHIPPING
}

model Coupon {
  id            String       @id @default(uuid())
  code          String       @unique
  label         String
  discountType  DiscountType
  discountValue Int          // percent * 100 OR paise
  minOrderCents Int          @default(0)
  maxUsageCount Int?         // null = unlimited
  usageCount    Int          @default(0)
  perUserLimit  Int?
  expiresAt     DateTime?
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  orders        Order[]
}

// Also add to Order model:
model Order {
  // existing fields...
  couponId String?
  coupon   Coupon? @relation(fields: [couponId], references: [id])
}
```

**Step 2 — Run migration:**
```bash
cd backend
npx prisma migrate dev --name add_coupon_model
```

**Step 3 — Replace hardcoded coupon logic:**
In `order.service.ts`, replace the static `validateCoupon` with a DB lookup:

```typescript
async function validateCoupon(code: string, orderTotal: number, userId: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.isActive) throw new Error('Invalid coupon code');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error('Coupon expired');
  if (coupon.maxUsageCount && coupon.usageCount >= coupon.maxUsageCount) {
    throw new Error('Coupon usage limit reached');
  }
  if (orderTotal < coupon.minOrderCents) {
    throw new Error(`Minimum order ₹${coupon.minOrderCents / 100} required`);
  }
  // perUserLimit check: count orders with this couponId and userId
  return coupon;
}
```

**Step 4 — Add admin endpoints:**
```
POST   /api/admin/coupons        → createCoupon
GET    /api/admin/coupons        → listCoupons
GET    /api/admin/coupons/:id    → getCoupon
PATCH  /api/admin/coupons/:id    → updateCoupon
DELETE /api/admin/coupons/:id    → deactivateCoupon (soft delete: isActive=false)
```

**Verify:**
1. Create a coupon via the admin API
2. Apply it to an order — discount should apply
3. Exceed the usage limit — should get "Coupon usage limit reached"
4. Use the old hardcoded codes — they should now fail (removed from code)

---

### TASK 11 — Forgot / Reset Password Flow
- **Priority:** P1-HIGH
- **Effort:** ~8 hr
- **Status:** [x] DONE

**Problem:**
A user who forgets their password is permanently locked out. No backend
endpoints, no frontend pages, no token model.

**Step 1 — Add Prisma schema:**
```prisma
model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  token     String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}
```

```bash
npx prisma migrate dev --name add_password_reset_token
```

**Step 2 — Backend endpoints:**

`POST /api/auth/forgot-password`
```typescript
// 1. Find user by email (don't reveal if email exists — always return 200)
// 2. Generate crypto.randomBytes(32).toString('hex') token
// 3. Store hashed token in PasswordResetToken with expiresAt = now + 1hr
// 4. Send email with link: https://yoursite.com/reset-password?token=<raw_token>
```

`POST /api/auth/reset-password`
```typescript
// Body: { token: string, newPassword: string }
// 1. Hash the incoming token, find matching PasswordResetToken
// 2. Check it's not expired and not already used
// 3. Hash new password with bcrypt
// 4. Update user.password
// 5. Mark token as used: usedAt = now()
// 6. Invalidate all user sessions (optional but recommended)
```

**Step 3 — Frontend pages:**

Create `frontend/app/forgot-password/page.tsx`:
- Single email input form
- On submit: `POST /api/auth/forgot-password`
- Show: "If this email exists, you'll receive a reset link"

Create `frontend/app/reset-password/page.tsx`:
- Read `?token=` from URL params
- Show new password + confirm password fields
- On submit: `POST /api/auth/reset-password`
- On success: redirect to `/login`

**Step 4 — Add link on login page:**
```tsx
<Link href="/forgot-password">Forgot your password?</Link>
```

**Verify:**
1. Enter a registered email → receive reset email with token link
2. Click link → land on reset page
3. Submit new password → success, redirected to login
4. Login with new password → works
5. Try reusing the same reset link → "Token already used" error
6. Generate a token, wait 1 hour, try to use → "Token expired" error

---

### TASK 12 — Razorpay Integration (Payment Gateway)
- **Priority:** P0-CRITICAL
- **Effort:** ~12 hr
- **Status:** [x] DONE

**Problem:**
The entire payment system is TEST-mode only. No real gateway. Any user can
confirm payment on any order. Zero revenue is collectible safely.

**Step 1 — Install SDK:**
```bash
cd backend
npm install razorpay
npm install --save-dev @types/razorpay
```

**Step 2 — Environment variables:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

**Step 3 — Add payment initiation endpoint:**
`POST /api/payments/initiate/:orderId`
```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// 1. Fetch order, verify it belongs to requesting user
// 2. Verify order status is PENDING_PAYMENT
// 3. Create Razorpay order:
const gatewayOrder = await razorpay.orders.create({
  amount: order.totalAmount, // in paise
  currency: 'INR',
  receipt: order.id,
});
// 4. Store gatewayOrder.id on the Payment record
// 5. Return { gatewayOrderId, keyId: process.env.RAZORPAY_KEY_ID, amount, currency }
```

**Step 4 — Add webhook handler:**
`POST /api/payments/webhook/razorpay`

⚠️ This route must be EXCLUDED from express.json() body-parser — Razorpay
signature is computed on the raw body.

```typescript
import crypto from 'crypto';

// Use express.raw() middleware for this route, NOT express.json()
app.post('/api/payments/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = req.body; // raw Buffer

    // 1. Verify signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSig) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // 2. Parse event
    const event = JSON.parse(body.toString());

    // 3. Handle payment.captured (success)
    if (event.event === 'payment.captured') {
      const gatewayOrderId = event.payload.payment.entity.order_id;

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { gatewayOrderId }
        });
        if (!payment) return;

        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', gatewayPaymentId: event.payload.payment.entity.id }
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' }
        });
      });

      await queueEmailNotification(order.userId, 'PAYMENT_SUCCESS', { orderId: payment.orderId });
    }

    // 4. Handle payment.failed
    if (event.event === 'payment.failed') {
      // Update payment to FAILED, order stays PENDING_PAYMENT
    }

    // 5. Always return 200 immediately
    res.status(200).json({ received: true });
  }
);
```

**Step 5 — Update frontend checkout:**
- After placing order, call `POST /api/payments/initiate/:orderId`
- Load Razorpay checkout script
- Open Razorpay modal with `gatewayOrderId`, `keyId`, `amount`
- On success callback: show "Payment successful, order confirmed"
- On failure callback: show "Payment failed, try again"

**Verify (Test Mode):**
1. Place an order, initiate payment
2. Use Razorpay test card: `4111 1111 1111 1111`
3. Confirm webhook fires and order status changes to `PAID`
4. Customer receives payment confirmation email

---

### TASK 13 — Server-Side Cart API
- **Priority:** P1-HIGH
- **Effort:** ~8 hr
- **Status:** [x] DONE

**Problem:**
Cart lives only in localStorage. Lost on browser clear, not synced across
devices, can't be merged on login.

**Step 1 — Add Prisma schema:**
```prisma
model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id          String    @id @default(uuid())
  cartId      String
  cart        Cart      @relation(fields: [cartId], references: [id], onDelete: Cascade)
  componentId String
  component   Component @relation(fields: [componentId], references: [id])
  quantity    Int
  @@unique([cartId, componentId])
}
```

```bash
npx prisma migrate dev --name add_cart_model
```

**Step 2 — Add API endpoints:**
```
GET    /api/cart           → getCart (upsert empty cart if not exists)
POST   /api/cart/items     → addItem { componentId, quantity }
PATCH  /api/cart/items/:id → updateItem { quantity }
DELETE /api/cart/items/:id → removeItem
DELETE /api/cart           → clearCart
```

**Step 3 — Merge on login:**
In the login flow, after successful auth, read the localStorage cart and
`POST /api/cart/merge` with the local items. The backend merges:
- If item already in server cart → take the higher quantity
- If item only in local cart → add to server cart

**Step 4 — Update frontend cartStore:**
On mount (if authenticated), fetch server cart and replace local state.
Debounce every cart change to sync to backend (300ms debounce).

**Verify:**
1. Add items to cart on mobile browser
2. Open same account on desktop
3. Cart items should appear on desktop

---

### TASK 14 — Server-Side Wishlist API
- **Priority:** P1-HIGH
- **Effort:** ~4 hr
- **Status:** [x] DONE

**Problem:**
Wishlist is localStorage-only, same issues as cart.

**Step 1 — Add Prisma schema:**
```prisma
model Wishlist {
  id    String         @id @default(uuid())
  userId String        @unique
  user  User           @relation(fields: [userId], references: [id])
  items WishlistItem[]
}

model WishlistItem {
  id          String    @id @default(uuid())
  wishlistId  String
  wishlist    Wishlist  @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  componentId String
  component   Component @relation(fields: [componentId], references: [id])
  addedAt     DateTime  @default(now())
  @@unique([wishlistId, componentId])
}
```

```bash
npx prisma migrate dev --name add_wishlist_model
```

**Step 2 — Add API endpoints:**
```
GET    /api/wishlist              → getWishlist
POST   /api/wishlist/items        → addItem { componentId }
DELETE /api/wishlist/items/:id    → removeItem
```

**Verify:**
1. Add item to wishlist on one device
2. Check wishlist on another device — item should be there

---

### TASK 15 — Email Verification After Signup
- **Priority:** P2-MEDIUM
- **Effort:** ~4 hr
- **Status:** [x] DONE

**Problem:**
Users can sign up with any email and immediately access the platform.
No verification that the email belongs to them.

**Step 1 — Add fields to User:**
```prisma
model User {
  // existing fields...
  emailVerified   Boolean   @default(false)
  emailVerifyToken String?  @unique
  emailVerifyExpiry DateTime?
}
```

```bash
npx prisma migrate dev --name add_email_verification
```

**Step 2 — Backend:**
- On signup: generate token, store on user, send verification email
- `GET /api/auth/verify-email?token=xxx`: mark `emailVerified = true`, clear token
- Decide: block login for unverified users, OR allow login but show a banner

**Step 3 — Frontend:**
- Create `/verify-email` page that reads `?token=` and calls the backend
- Show "Check your email" message after signup

**Verify:**
Sign up → receive email → click link → `emailVerified = true` in DB

---

### TASK 16 — Session Cleanup Cron Job
- **Priority:** P2-MEDIUM
- **Effort:** ~2 hr
- **Status:** [x] DONE

**Problem:**
The `Session` table grows unbounded. Old expired sessions are never deleted,
causing auth query slowdown over time.

**Fix:**
Add a scheduled job (using `node-cron` or BullMQ repeatable job):

```typescript
import cron from 'node-cron';

// Run daily at 3am
cron.schedule('0 3 * * *', async () => {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
  console.log(`[SessionCleanup] Deleted ${result.count} expired sessions`);
});
```

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

**Verify:**
Manually insert a session with `expiresAt` in the past. Run the job. Session
should be deleted.

---

## SPRINT 3 — Shipping & Operations
> Start only after all Sprint 2 tasks are marked done.

---

### TASK 17 — Shiprocket Shipping Integration
- **Priority:** P1-HIGH
- **Effort:** ~16 hr
- **Status:** [x] DONE

**Problem:**
Checkout shows a hardcoded ₹50 shipping fee. No live rates, no AWB generation,
no tracking.

**Environment variables needed:**
```env
SHIPROCKET_EMAIL=your@email.com
SHIPROCKET_PASSWORD=yourpassword
```

**Add to Order schema:**
```prisma
model Order {
  // existing fields...
  trackingAwb String?
  trackingUrl String?
  shippedAt   DateTime?
  deliveredAt DateTime?
}
```

**Endpoints to build:**
```
POST /api/shipping/rates          → calculate live rates by pincode + weight
POST /api/shipping/order          → create shipment, get AWB
GET  /api/shipping/track/:awb     → fetch live tracking status
POST /api/shipping/webhook        → receive status updates from Shiprocket
```

**Shiprocket Auth pattern:**
```typescript
// Shiprocket uses JWT — authenticate once, cache token for 24 hours
const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  })
});
const { token } = await authRes.json();
// Store token in Redis with 24hr TTL
```

**Verify:**
1. Enter a pincode at checkout → live shipping rates appear
2. Admin ships order → AWB generated and stored on Order
3. Customer views order → tracking link works

---

### TASK 18 — Invoice PDF Generation
- **Priority:** P2-MEDIUM
- **Effort:** ~8 hr
- **Status:** [x] DONE

**Problem:**
No invoice download for customers or admins.

**Install:**
```bash
npm install puppeteer
# OR: npm install pdfkit (lighter weight, no headless browser)
```

**Endpoint:**
```
GET /api/orders/:id/invoice  → returns PDF blob, requires order ownership or admin role
```

**Invoice should include:**
- RoboRoot logo + company address + GST number
- Order ID, order date
- Customer name + shipping address
- Itemized table: component name, quantity, unit price, subtotal
- Coupon discount (if any)
- Shipping charges
- Total amount paid
- Payment method + transaction ID
- "Thank you" footer

**Verify:**
Download invoice for a completed order. PDF should render correctly with all fields.

---

### TASK 19 — Admin Customer List + Detail View
- **Priority:** P1-HIGH
- **Effort:** ~6 hr
- **Status:** [x] DONE

**Problem:**
Admin has no way to view customers, their order history, or account details.

**Endpoints to build:**
```
GET /api/admin/customers              → paginated list, search by name/email
GET /api/admin/customers/:id          → customer detail + order history
PATCH /api/admin/customers/:id/status → suspend / reactivate account
```

**Admin UI to add:**
- Customer list table: name, email, total orders, total spent, joined date, status
- Customer detail page: profile info, address book, full order history
- Suspend/reactivate button

**Verify:**
Load admin panel → navigate to Customers → see list → click a customer → see their orders.

---

### TASK 20 — Admin Analytics Charts
- **Priority:** P2-MEDIUM
- **Effort:** ~8 hr
- **Status:** [x] DONE

**Problem:**
Admin dashboard has no revenue or order analytics.

**Endpoints to build:**
```
GET /api/admin/analytics/revenue?period=7d|30d|90d
GET /api/admin/analytics/orders?period=7d|30d|90d
GET /api/admin/analytics/top-products?limit=10
GET /api/admin/analytics/low-stock?threshold=10
```

**Admin UI charts to add:**
- Revenue over time (line chart)
- Order volume over time (bar chart)
- Top 10 selling products (horizontal bar)
- Low stock alert table

**Verify:**
Admin dashboard loads with real data from the DB.

---

### TASK 21 — PCB Quote Request Flow
- **Priority:** P1-HIGH
- **Effort:** ~12 hr
- **Status:** [x] DONE

**Problem:**
"PCB design and fabrication services" is listed as a core product type in
CLAUDE.md but has zero implementation anywhere.

**Step 1 — Add Prisma schema:**
```prisma
enum PcbQuoteStatus {
  SUBMITTED
  REVIEWING
  QUOTED
  ACCEPTED
  IN_PRODUCTION
  SHIPPED
  CANCELLED
}

model PcbQuoteRequest {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id])
  boardLayers     Int
  boardSizeX      Float          // mm
  boardSizeY      Float          // mm
  quantity        Int
  surfaceFinish   String
  copperWeight    String
  gerberFileUrl   String         // Azure Blob URL
  notes           String?        @db.Text
  status          PcbQuoteStatus @default(SUBMITTED)
  quotedPricePaise Int?
  adminNotes      String?        @db.Text
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

```bash
npx prisma migrate dev --name add_pcb_quote
```

**Step 2 — Backend endpoints:**
```
POST /api/pcb/quote            → submit PCB quote request (upload Gerber file)
GET  /api/pcb/quotes           → user's own quotes
GET  /api/pcb/quotes/:id       → quote detail

GET    /api/admin/pcb/quotes          → all quotes (admin)
PATCH  /api/admin/pcb/quotes/:id      → update status + quoted price
```

**Step 3 — Frontend pages:**
- `/pcb-services` — info page about PCB services
- `/pcb-services/quote` — quote request form (board specs + Gerber upload)
- `/pcb-services/quotes` — user's submitted quotes list

**Verify:**
Submit a quote → appears in admin panel → admin prices it → customer sees updated status + price.

---

## SPRINT 4 — Quality & Scale
> Start only after all Sprint 3 tasks are marked done.

---

### TASK 22 — Product Reviews + Ratings
- **Priority:** P1-HIGH
- **Effort:** ~10 hr
- **Status:** [x] DONE

**Step 1 — Add Prisma schema:**
```prisma
model Review {
  id          String     @id @default(uuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  componentId String?
  component   Component? @relation(fields: [componentId], references: [id])
  projectId   String?
  project     Project?   @relation(fields: [projectId], references: [id])
  rating      Int        // 1–5
  title       String?
  body        String?    @db.Text
  isVerified  Boolean    @default(false) // purchased user only
  createdAt   DateTime   @default(now())
  @@unique([userId, componentId])
  @@unique([userId, projectId])
}
```

```bash
npx prisma migrate dev --name add_reviews
```

**Step 2 — Backend endpoints:**
```
POST /api/reviews              → submit review (must have purchased the item)
GET  /api/components/:id/reviews
GET  /api/projects/:id/reviews
DELETE /api/reviews/:id        → own review only
PATCH /api/admin/reviews/:id   → admin moderate (approve/remove)
```

**Step 3 — Frontend UI:**
- Star rating component on product/project page
- Review list with pagination
- "Write a Review" form (only shown to verified purchasers)

**Verify:**
Purchase a product → review form appears → submit review → visible on product page with star rating.

---

### TASK 23 — Redis Caching on Product Listings
- **Priority:** P2-MEDIUM
- **Effort:** ~4 hr
- **Status:** [x] DONE

**Fix:**
```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// In getComponents controller:
const cacheKey = `components:${JSON.stringify(filters)}:page:${page}`;
const cached = await redis.get(cacheKey);
if (cached) return res.json(JSON.parse(cached));

const data = await componentService.getComponents(filters, page);
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
return res.json(data);
```

Invalidate on component create/update/delete:
```typescript
await redis.del(`components:*`); // or use tag-based invalidation
```

---

### TASK 24 — BullMQ Email Queue
- **Priority:** P2-MEDIUM
- **Effort:** ~6 hr
- **Status:** [x] DONE

**Problem:**
Email worker is a detached polling process. If it crashes, emails queue up
with no alerting.

**Fix:**
```bash
npm install bullmq ioredis
```

Replace polling worker with BullMQ:
```typescript
import { Queue, Worker } from 'bullmq';
const emailQueue = new Queue('emails', { connection: redisConnection });

// Producer (in order service):
await emailQueue.add('order-placed', { userId, orderId, type: 'ORDER_PLACED' });

// Worker (embedded in server startup):
const emailWorker = new Worker('emails', async (job) => {
  await sendEmail(job.data);
}, { connection: redisConnection });

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err);
  // Alert via Sentry
});
```

---

### TASK 25 — Add Error Boundaries to Frontend Pages
- **Priority:** P2-MEDIUM
- **Effort:** ~4 hr
- **Status:** [x] DONE

**Fix:**
Create `frontend/components/ErrorBoundary.tsx`:
```tsx
'use client';
import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-8 text-center">
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap every major page section:
```tsx
<ErrorBoundary>
  <ProductGrid />
</ErrorBoundary>
```

---

### TASK 26 — Add generateMetadata to Product Pages
- **Priority:** P2-MEDIUM
- **Effort:** ~4 hr
- **Status:** [x] DONE

**Problem:**
Product pages have no SEO metadata. Google cannot index them properly.

**Fix:**
In each product/project page (App Router):
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const component = await getComponent(params.id);
  return {
    title: `${component.name} | RoboRoot`,
    description: component.description,
    openGraph: {
      title: component.name,
      description: component.description,
      images: [{ url: component.imageUrl }],
    },
  };
}
```

---

### TASK 27 — Refactor Admin Panel into Feature Modules
- **Priority:** P1-HIGH
- **Effort:** ~12 hr
- **Status:** [x] DONE

**Problem:**
All 1619 lines of the admin panel live in one file. Unmaintainable, untestable,
causes merge conflicts.

**Target structure:**
```
admin-frontend/src/features/
  auth/
    LoginPage.tsx
    useAdminAuth.ts
  dashboard/
    DashboardPage.tsx
    StatsCards.tsx
    RevenueChart.tsx
  products/
    ProductList.tsx
    ProductForm.tsx
    useProducts.ts
  orders/
    OrderList.tsx
    OrderDetail.tsx
    useOrders.ts
  customers/
    CustomerList.tsx
    CustomerDetail.tsx
  coupons/
    CouponList.tsx
    CouponForm.tsx
  analytics/
    AnalyticsPage.tsx
  settings/
    SettingsPage.tsx
  shared/
    apiFetch.ts      ← shared fetch wrapper (Task 07)
    AdminLayout.tsx
    Sidebar.tsx
```

Extract feature by feature. Test each one works before deleting the original
code from AdminConsole.tsx.

---

### TASK 28 — Sentry Integration (Frontend + Backend)
- **Priority:** P2-MEDIUM
- **Effort:** ~4 hr
- **Status:** [x] DONE

**Install:**
```bash
# Frontend
npm install @sentry/nextjs

# Backend
npm install @sentry/node
```

**Frontend setup:**
Run `npx @sentry/wizard@latest -i nextjs` — it patches your Next.js config
automatically.

**Backend setup:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
});

// Add to Express error handler:
app.use(Sentry.Handlers.errorHandler());
```

**Verify:**
Throw a deliberate error in a route. Confirm it appears in your Sentry dashboard.

---

## CRITICAL DATABASE INDEXES
> Run these as a migration after Sprint 1 is complete. No code changes needed.

```prisma
// Add to schema.prisma and run: npx prisma migrate dev --name add_performance_indexes

model Order {
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model Component {
  @@index([category, subcategory, isActive])
  @@index([isBestSeller, isActive])
}

model Session {
  @@index([token])
  @@index([expiresAt])
}
```

---

## SECURITY HARDENING CHECKLIST
> These can be done in parallel with any sprint.

- [ ] Add CSRF token middleware (`csurf` or custom double-submit cookie pattern)
- [ ] Enable Helmet CSP in production (`contentSecurityPolicy: true` in Helmet config)
- [ ] Restrict CORS to known origins only (remove `*.vercel.app` wildcard)
- [ ] Add refresh token rotation (issue new refresh token on every use, invalidate old)
- [ ] Add account lockout after 5 failed logins (store failedAttempts + lockUntil on User)
- [ ] Validate file upload MIME type server-side (not just extension):
  ```typescript
  import fileType from 'file-type';
  const type = await fileType.fromBuffer(buffer);
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!type || !allowed.includes(type.mime)) throw new Error('Invalid file type');
  ```
- [ ] Admin IP allowlist or 2FA
- [ ] Write to AdminActionLog on every admin mutation
- [ ] Add idempotency key support on `POST /api/orders` endpoint

---

## COMPLETION TRACKER

| Sprint | Task | Description | Effort | Status |
|--------|------|-------------|--------|--------|
| 1 | 01 | Fix analytics routing bug | 30m | ⬜ |
| 1 | 02 | Fix SUPER_ADMIN login check | 30m | ⬜ |
| 1 | 03 | Fix order ownership / payment confirm | 1h | ⬜ |
| 1 | 04 | Prisma transaction on stock deduction | 2h | ⬜ |
| 1 | 05 | Add middleware.ts route guards | 2h | ⬜ |
| 1 | 06 | Move tokens to httpOnly cookies | 4h | ⬜ |
| 1 | 07 | Admin token refresh | 3h | ⬜ |
| 1 | 08 | Rate limiting on auth endpoints | 1h | ⬜ |
| 1 | 09 | Email notifications on order events | 4h | ⬜ |
| 2 | 10 | Coupon model + admin CRUD | 6h | ⬜ |
| 2 | 11 | Forgot / reset password | 8h | ⬜ |
| 2 | 12 | Razorpay integration + webhooks | 12h | ⬜ |
| 2 | 13 | Server-side Cart API | 8h | ⬜ |
| 2 | 14 | Server-side Wishlist API | 4h | ⬜ |
| 2 | 15 | Email verification after signup | 4h | ⬜ |
| 2 | 16 | Session cleanup cron job | 2h | ⬜ |
| 3 | 17 | Shiprocket shipping integration | 16h | ⬜ |
| 3 | 18 | Invoice PDF generation | 8h | ⬜ |
| 3 | 19 | Admin customer list + detail | 6h | ⬜ |
| 3 | 20 | Admin analytics charts | 8h | ⬜ |
| 3 | 21 | PCB quote request flow | 12h | ⬜ |
| 4 | 22 | Product reviews + ratings | 10h | ⬜ |
| 4 | 23 | Redis caching on product listings | 4h | ⬜ |
| 4 | 24 | BullMQ email queue | 6h | ⬜ |
| 4 | 25 | Error boundaries on frontend | 4h | ⬜ |
| 4 | 26 | generateMetadata on product pages | 4h | ⬜ |
| 4 | 27 | Refactor admin into feature modules | 12h | ⬜ |
| 4 | 28 | Sentry integration | 4h | ⬜ |

**Total estimated effort: ~175 hours (~8–9 weeks at 20h/week)**

---

## RULES FOR CLAUDE CODE

1. **One task at a time.** Complete and verify before starting the next.
2. **Run `npx prisma migrate dev` after every schema change.**
3. **Run `npx tsc --noEmit` after every TypeScript change to catch type errors.**
4. **Never delete existing working code until the replacement is verified.**
5. **Write the verify step, not just the fix.** Every task has a verify command — run it.
6. **Commit after each task** with message format: `fix(P0-1): fix express analytics routing bug`
7. **Do not take real payments until Task 03, 04, and 12 are all complete.**
8. **Do not deploy to production until all Sprint 1 tasks (01–09) are done.**