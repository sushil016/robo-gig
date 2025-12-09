# 🚀 Email System Quick Setup Guide

## Step 1: Run Database Migration

```bash
cd backend
pnpm prisma migrate dev --name add_email_notifications
```

This creates the `EmailNotification` table in your database.

## Step 2: Configure Environment Variables

Add to your `.env` file:

```env
# Email Configuration
FROM_EMAIL=noreply@buildwise.com
FROM_NAME=BuildWise Platform

# For Development (optional - uses Ethereal test accounts)
# Leave empty or omit SMTP variables

# For Production (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Gmail Setup (if using Gmail):

1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Create an "App Password" for "Mail"
4. Use this password as `SMTP_PASS`

## Step 3: Test Email Configuration

```bash
# Start the server
pnpm dev

# In another terminal, test email config
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:4000/api/emails/test-config
```

## Step 4: Test Signup Email

Create a new account to trigger the welcome email:

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

Check your console logs for:
- ✅ Email notification created
- 📬 Email queued
- (In development) Preview URL to view the email

## Step 5: Start Email Worker

The worker processes queued emails in the background.

### Option A: Run Once (Manual)

```bash
pnpm run email:worker
```

### Option B: Run Continuously (Development)

```bash
# Processes emails every 2 minutes
pnpm run email:worker:watch
```

### Option C: Production Setup

Add to PM2 or cron:

```bash
# PM2
pm2 start dist/workers/email-worker.js --name email-worker -- continuous 2

# Cron (every 2 minutes)
*/2 * * * * cd /path/to/backend && pnpm run email:worker:prod
```

## Step 6: Test Admin Endpoints

Get an admin token first (you need an admin user in database):

```bash
# Login as admin
ADMIN_TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@buildwise.com","password":"admin_password"}' \
  | jq -r '.accessToken')

# Get email statistics
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:4000/api/emails/stats

# Preview a template
curl -X GET "http://localhost:4000/api/emails/preview/USER_SIGNUP" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user":{"name":"John Doe","email":"john@example.com"}}'

# Send a test email
curl -X POST http://localhost:4000/api/emails/test \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "eventType": "USER_SIGNUP",
    "metadata": {
      "user": {
        "name": "Test User",
        "email": "test@example.com"
      }
    }
  }'
```

## Development Mode (Ethereal)

If you don't configure SMTP, the system automatically uses **Ethereal** (fake SMTP):

- Emails won't actually be sent
- Console logs will show a **preview URL**
- Open the URL to see the email in a browser
- Perfect for testing templates!

Example console output:
```
📧 Email sent successfully
Preview URL: https://ethereal.email/message/abc123
```

## Production Checklist

- [ ] Run database migration
- [ ] Configure real SMTP (not Ethereal)
- [ ] Set up email worker (PM2/cron/Lambda)
- [ ] Test all email event types
- [ ] Set up SPF/DKIM/DMARC records
- [ ] Monitor email statistics regularly
- [ ] Set up alerts for high failure rates

## Troubleshooting

### Emails not sending?

1. Check SMTP config: `GET /api/emails/test-config`
2. Check worker is running: `pm2 status`
3. Check database: `pnpm prisma studio` → EmailNotification table

### Gmail errors?

- Use **App Password**, not your regular password
- Enable 2-Factor Authentication first
- Check "Less secure app access" is OFF (we use App Password instead)

### Emails in spam?

- Set up SPF, DKIM, DMARC DNS records
- Use a proper domain (not @gmail.com)
- Consider using SendGrid, Mailgun, or AWS SES

## Next Steps

- Read `EMAIL_SYSTEM.md` for comprehensive documentation
- Customize email templates in `src/utils/email-templates.ts`
- Add more email event types as needed
- Set up monitoring and alerts

---

**Quick Reference:**

- **Queue email:** `queueEmailNotification(email, eventType, data, userId)`
- **Send immediately:** `sendEmailNotification(email, eventType, data, userId)`
- **Process queue:** `processPendingEmails(limit)`
- **Admin API:** `/api/emails/*` (requires admin token)
- **Worker:** `pnpm run email:worker` or `email:worker:watch`

Need help? Check the logs first! 📋
