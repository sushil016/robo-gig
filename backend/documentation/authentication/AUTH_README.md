# RoboGig Authentication System

Production-grade authentication system with Email/Password, Google OAuth, and GitHub OAuth support.

## Features

✅ **Email/Password Authentication**
- Secure password hashing with bcrypt
- Password strength validation
- Email validation

✅ **OAuth 2.0 Support**
- Google OAuth integration
- GitHub OAuth integration
- Automatic user creation and linking

✅ **JWT Token Management**
- Access tokens (15 minutes default)
- Refresh tokens (7 days default)
- Session management

✅ **Security Features**
- Helmet.js for security headers
- CORS protection
- Rate limiting ready
- Input validation
- Error handling

✅ **User Management**
- User roles (STUDENT, MENTOR, ADMIN)
- Profile management
- Session tracking
- Account deactivation

## Architecture

```
backend/
├── src/
│   ├── controller/
│   │   └── auth.ts              # Authentication controllers
│   ├── services/
│   │   ├── auth.service.ts       # Email/Password auth logic
│   │   ├── google-auth.service.ts # Google OAuth logic
│   │   └── github-auth.service.ts # GitHub OAuth logic
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT authentication middleware
│   │   └── error.middleware.ts   # Global error handler
│   ├── utils/
│   │   ├── types.ts              # TypeScript types & errors
│   │   ├── jwt.ts                # JWT utilities
│   │   ├── password.ts           # Password hashing & validation
│   │   └── validation.ts         # Input validation
│   ├── routes/
│   │   └── authRoutes.ts         # Auth route definitions
│   └── server.ts                 # Express app setup
├── prisma/
│   └── schema.prisma             # Database schema
└── .env                          # Environment variables
```

## API Endpoints

### Public Endpoints

#### 1. **Signup with Email/Password**
```
POST /api/auth/signup

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "college": "MIT"
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "STUDENT",
      "avatarUrl": null,
      "college": "MIT"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

#### 2. **Login with Email/Password**
```
POST /api/auth/login

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

#### 3. **Refresh Access Token**
```
POST /api/auth/refresh

Request Body:
{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

#### 4. **Google OAuth**
```
GET /api/auth/google
- Redirects to Google OAuth consent screen

GET /api/auth/google/callback?code=xxx
- Handles Google OAuth callback
- Returns user data and tokens
```

#### 5. **GitHub OAuth**
```
GET /api/auth/github
- Redirects to GitHub OAuth consent screen

GET /api/auth/github/callback?code=xxx
- Handles GitHub OAuth callback
- Returns user data and tokens
```

### Protected Endpoints (Require Authentication)

#### 6. **Get Current User**
```
GET /api/auth/me

Headers:
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "avatarUrl": null,
    "college": "MIT",
    "isActive": true,
    "createdAt": "2025-12-09T...",
    "updatedAt": "2025-12-09T..."
  }
}
```

#### 7. **Logout**
```
POST /api/auth/logout

Headers:
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server Configuration
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_REDIRECT_URI="http://localhost:4000/api/auth/github/callback"
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Database
```bash
# Run migrations
pnpm prisma:migrate

# Generate Prisma Client
pnpm prisma:generate
```

### 4. Run Development Server
```bash
pnpm dev
```

Server will start at `http://localhost:4000`

## OAuth Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - Application name: RoboGig
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:4000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## Usage Examples

### Frontend Integration

#### Login with Email/Password
```typescript
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const { data } = await response.json();
// Store tokens securely (localStorage, cookies, etc.)
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

#### Making Authenticated Requests
```typescript
const response = await fetch('http://localhost:4000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});

const { data } = await response.json();
console.log('Current user:', data);
```

#### Refresh Token
```typescript
const response = await fetch('http://localhost:4000/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});

const { data } = await response.json();
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

#### Google OAuth
```typescript
// Redirect to Google OAuth
window.location.href = 'http://localhost:4000/api/auth/google';

// After callback, handle the response
// (You'll need to parse the tokens from the callback response)
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secrets**: Use strong, random secrets in production
3. **HTTPS**: Always use HTTPS in production
4. **Token Storage**: 
   - Use httpOnly cookies for tokens (recommended)
   - Or secure localStorage with proper XSS protection
5. **Password Policy**: Enforce strong password requirements
6. **Rate Limiting**: Add rate limiting to prevent brute force attacks
7. **Input Validation**: All inputs are validated and sanitized
8. **Session Management**: Sessions expire and are tracked in database

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input
- `UNAUTHORIZED`: Authentication failed
- `FORBIDDEN`: Access denied
- `CONFLICT`: Resource already exists
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server error

## Testing

### Test Signup
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Test Protected Route
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Database Schema

The authentication system uses these Prisma models:

- **User**: Main user entity
- **EmailCredential**: Email/password credentials
- **AuthAccount**: OAuth provider accounts (Google, GitHub)
- **Session**: User sessions for token management

See `prisma/schema.prisma` for complete schema.

## Middleware Usage

### Protect Routes
```typescript
import { authenticate, authorize } from './middlewares/auth.middleware.js';

// Require authentication
router.get('/protected', authenticate, handler);

// Require specific role
router.get('/admin', authenticate, authorize('ADMIN'), handler);

// Multiple roles
router.get('/mentor-admin', authenticate, authorize('MENTOR', 'ADMIN'), handler);
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Enable HTTPS
5. Set up database with SSL
6. Configure OAuth redirect URIs for production domain
7. Add rate limiting
8. Set up logging and monitoring
9. Use environment-specific `.env` files

## Support

For issues or questions:
- Check the error messages and logs
- Review the API documentation above
- Check Prisma schema for data models
- Verify environment variables are set correctly

## License

MIT
