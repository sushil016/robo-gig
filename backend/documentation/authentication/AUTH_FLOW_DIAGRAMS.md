# Authentication Flow Diagrams

## Email/Password Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /api/auth/signup
       │ { email, password, name, college }
       │
       ▼
┌─────────────────────────────────────┐
│     Signup Controller               │
│  1. Validate input                  │
│  2. Check if user exists            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Auth Service                    │
│  1. Hash password (bcrypt)          │
│  2. Create user in DB               │
│  3. Create email credential         │
│  4. Create session                  │
│  5. Generate JWT tokens             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Response                        │
│  {                                  │
│    user: { id, email, name, ... },  │
│    accessToken: "jwt...",           │
│    refreshToken: "jwt...",          │
│    expiresIn: 900                   │
│  }                                  │
└─────────────────────────────────────┘
```

## Login Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /api/auth/login
       │ { email, password }
       │
       ▼
┌─────────────────────────────────────┐
│     Login Controller                │
│  1. Validate input                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Auth Service                    │
│  1. Find user by email              │
│  2. Compare password hash           │
│  3. Check if user is active         │
│  4. Create session                  │
│  5. Generate JWT tokens             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Response                        │
│  {                                  │
│    user: { id, email, name, ... },  │
│    accessToken: "jwt...",           │
│    refreshToken: "jwt...",          │
│    expiresIn: 900                   │
│  }                                  │
└─────────────────────────────────────┘
```

## Google OAuth Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ GET /api/auth/google
       │
       ▼
┌─────────────────────────────────────┐
│     Google Auth Controller          │
│  1. Generate Google OAuth URL       │
│  2. Redirect to Google              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Google OAuth                    │
│  User authenticates with Google     │
│  Google redirects back with code    │
└──────┬──────────────────────────────┘
       │
       │ GET /api/auth/google/callback?code=xxx
       │
       ▼
┌─────────────────────────────────────┐
│     Google Callback Controller      │
│  1. Receive authorization code      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Google Auth Service             │
│  1. Exchange code for tokens        │
│  2. Get user info from Google       │
│  3. Find or create user             │
│  4. Link Google account to user     │
│  5. Create session                  │
│  6. Generate JWT tokens             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Response                        │
│  {                                  │
│    user: { id, email, name, ... },  │
│    accessToken: "jwt...",           │
│    refreshToken: "jwt...",          │
│    expiresIn: 900                   │
│  }                                  │
└─────────────────────────────────────┘
```

## Protected Route Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ GET /api/auth/me
       │ Authorization: Bearer <token>
       │
       ▼
┌─────────────────────────────────────┐
│     Auth Middleware                 │
│  1. Extract token from header       │
│  2. Verify JWT signature            │
│  3. Check expiration                │
│  4. Attach user to request          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Controller                      │
│  1. Access req.user                 │
│  2. Get user from database          │
│  3. Return user data                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Response                        │
│  {                                  │
│    success: true,                   │
│    data: { id, email, name, ... }   │
│  }                                  │
└─────────────────────────────────────┘
```

## Token Refresh Flow

```
┌─────────────┐
│   Client    │
│  (Token     │
│   Expired)  │
└──────┬──────┘
       │
       │ POST /api/auth/refresh
       │ { refreshToken: "jwt..." }
       │
       ▼
┌─────────────────────────────────────┐
│     Refresh Token Controller        │
│  1. Validate refresh token          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Auth Service                    │
│  1. Verify refresh token            │
│  2. Find user                       │
│  3. Verify session (if exists)      │
│  4. Create new session              │
│  5. Generate new token pair         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Response                        │
│  {                                  │
│    user: { id, email, name, ... },  │
│    accessToken: "jwt...",           │
│    refreshToken: "jwt...",          │
│    expiresIn: 900                   │
│  }                                  │
└─────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────┐
│            User                     │
├─────────────────────────────────────┤
│ id: String (PK)                     │
│ email: String (Unique)              │
│ name: String?                       │
│ avatarUrl: String?                  │
│ role: UserRole                      │
│ college: String?                    │
│ isActive: Boolean                   │
│ createdAt: DateTime                 │
│ updatedAt: DateTime                 │
└──────┬──────────────────────────────┘
       │
       ├─────┬─────────────────────────┐
       │     │                         │
       ▼     ▼                         ▼
┌────────────────┐  ┌──────────────┐  ┌──────────────┐
│ EmailCredential│  │ AuthAccount  │  │   Session    │
├────────────────┤  ├──────────────┤  ├──────────────┤
│ userId (PK,FK) │  │ id (PK)      │  │ id (PK)      │
│ passwordHash   │  │ provider     │  │ userId (FK)  │
│ createdAt      │  │ providerUsrId│  │ token        │
│ updatedAt      │  │ userId (FK)  │  │ userAgent    │
└────────────────┘  │ accessToken  │  │ ipAddress    │
                    │ refreshToken │  │ expiresAt    │
                    │ expiresAt    │  │ createdAt    │
                    │ createdAt    │  └──────────────┘
                    │ updatedAt    │
                    └──────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                  Client Request                     │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              1. Helmet Security Headers             │
│  - XSS Protection                                   │
│  - Content Security Policy                          │
│  - HSTS                                            │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              2. CORS Protection                     │
│  - Whitelist origins                               │
│  - Credentials handling                            │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              3. Body Parsing                        │
│  - JSON parsing (10MB limit)                       │
│  - URL encoding                                    │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              4. Input Validation                    │
│  - Email format                                    │
│  - Password strength                               │
│  - Sanitization                                    │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              5. Authentication (if required)        │
│  - JWT verification                                │
│  - Token expiration                                │
│  - User attachment                                 │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              6. Authorization (if required)         │
│  - Role checking                                   │
│  - Permission validation                           │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              7. Business Logic                      │
│  - Controllers                                     │
│  - Services                                        │
│  - Database operations                             │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              8. Error Handling                      │
│  - Custom errors                                   │
│  - Safe error messages                             │
│  - Logging                                         │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Response                           │
└─────────────────────────────────────────────────────┘
```

## JWT Token Structure

```
┌─────────────────────────────────────────────────────┐
│                 Access Token                        │
├─────────────────────────────────────────────────────┤
│ Header:                                             │
│   { alg: "HS256", typ: "JWT" }                     │
│                                                     │
│ Payload:                                            │
│   {                                                 │
│     userId: "clxxx...",                            │
│     email: "user@example.com",                     │
│     role: "STUDENT",                               │
│     sessionId: "clyyy...",                         │
│     iat: 1702123456,                               │
│     exp: 1702124356  // 15 minutes                 │
│   }                                                 │
│                                                     │
│ Signature:                                          │
│   HMACSHA256(                                       │
│     base64UrlEncode(header) + "." +                │
│     base64UrlEncode(payload),                      │
│     JWT_SECRET                                      │
│   )                                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 Refresh Token                       │
├─────────────────────────────────────────────────────┤
│ Header:                                             │
│   { alg: "HS256", typ: "JWT" }                     │
│                                                     │
│ Payload:                                            │
│   {                                                 │
│     userId: "clxxx...",                            │
│     sessionId: "clyyy...",                         │
│     iat: 1702123456,                               │
│     exp: 1702728256  // 7 days                     │
│   }                                                 │
│                                                     │
│ Signature:                                          │
│   HMACSHA256(                                       │
│     base64UrlEncode(header) + "." +                │
│     base64UrlEncode(payload),                      │
│     JWT_REFRESH_SECRET                             │
│   )                                                 │
└─────────────────────────────────────────────────────┘
```

## Error Response Format

```
┌─────────────────────────────────────────────────────┐
│             Error Response                          │
├─────────────────────────────────────────────────────┤
│ {                                                   │
│   success: false,                                   │
│   error: "Human-readable error message",            │
│   code: "ERROR_CODE"                                │
│ }                                                   │
└─────────────────────────────────────────────────────┘

Error Codes:
- VALIDATION_ERROR      - Invalid input
- UNAUTHORIZED         - Authentication failed
- FORBIDDEN           - Access denied
- CONFLICT            - Resource exists
- NOT_FOUND           - Resource not found
- INTERNAL_SERVER_ERROR - Server error
```
