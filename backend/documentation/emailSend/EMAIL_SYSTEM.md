# 📧 Email Notification System

Complete email notification system for RoboGig/BuildWise platform with queuing, retry logic, and template management.

## 🎯 Features

- ✅ **Queue-based email system** - Emails are queued and processed asynchronously
- ✅ **Automatic retry logic** - Failed emails are retried up to 3 times
- ✅ **HTML email templates** - Professional, responsive email templates
- ✅ **Multiple event types** - Support for 14+ different notification types
- ✅ **Background worker** - Dedicated worker process for sending emails
- ✅ **Admin endpoints** - Test, preview, and monitor emails
- ✅ **Email statistics** - Track sent/failed/pending emails
- ✅ **SMTP or dev mode** - Use real SMTP or Ethereal for testing

## 📋 Table of Contents

- [Email Event Types](#email-event-types)
- [Configuration](#configuration)
- [Email Templates](#email-templates)
- [Background Worker](#background-worker)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 📨 Email Event Types

The system supports the following email notifications:

| Event Type | Description | Trigger |
|------------|-------------|---------|
| `USER_SIGNUP` | Welcome email | User creates account |
| `EMAIL_VERIFICATION` | Email verification link | User needs to verify email |
| `PASSWORD_RESET` | Password reset link | User requests password reset |
| `ORDER_CREATED` | Order confirmation | User places order |
| `ORDER_PAID` | Payment confirmation | Payment succeeds |
| `ORDER_SHIPPED` | Shipping notification | Order is shipped |
| `ORDER_DELIVERED` | Delivery confirmation | Order delivered |
| `MENTOR_SESSION_BOOKED` | Session confirmation | Student books mentor session |
| `MENTOR_SESSION_REMINDER` | Session reminder | 24h before session |
| `MENTOR_SESSION_COMPLETED` | Session completed | After mentor session |
| `AI_PROJECT_GENERATED` | Project ready | AI generates project |
| `COMPONENT_BACK_IN_STOCK` | Stock alert | Component restocked |
| `WEEKLY_NEWSLETTER` | Weekly updates | Scheduled weekly |
| `CUSTOM` | Custom emails | Admin custom messages |

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
FROM_EMAIL=noreply@buildwise.com
FROM_NAME=BuildWise Platform

# For Production (Real SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# For Development (Ethereal - automatic test account)
NODE_ENV=development
```

### Gmail Configuration

If using Gmail, you need to:

1. Enable 2-factor authentication
2. Generate an **App Password**:
   - Go to Google Account Settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
   - Use this as `SMTP_PASS`

### Other SMTP Providers

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**AWS SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

## 🎨 Email Templates

Templates are defined in `src/utils/email-templates.ts`. Each template returns:

```typescript
{
  subject: string;
  html: string;
  text?: string;
}
```

### Template Data Structure

Each email type expects specific data:

**USER_SIGNUP:**
```typescript
{
  user: {
    name: string;
    email: string;
  }
}
```

**ORDER_CREATED:**
```typescript
{
  order: {
    orderId: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }
}
```

**MENTOR_SESSION_BOOKED:**
```typescript
{
  session: {
    mentorName: string;
    date: string;
    time: string;
    duration: string;
    topic: string;
    meetLink: string;
  }
}
```

### Customizing Templates

Edit `src/utils/email-templates.ts`:

```typescript
function userSignupTemplate(data: any): EmailTemplate {
  return {
    subject: "Welcome to BuildWise! 🚀",
    html: wrapTemplate(`
      <h2>Welcome ${data.user.name}!</h2>
      <p>Your custom message here...</p>
    `),
  };
}
```

The `wrapTemplate()` function adds consistent header, footer, and styling.

## 🔄 Background Worker

The email worker processes queued emails in the background.

### Run Once (Manual/Cron)

```bash
# Development
pnpm run email:worker

# Production
pnpm run email:worker:prod
```

### Run Continuously (Development)

```bash
# Process every 2 minutes
pnpm run email:worker:watch

# Custom interval (every 5 minutes)
tsx src/workers/email-worker.ts continuous 5
```

### Production Setup

**Option 1: Cron Job**

Add to crontab (run every 2 minutes):
```bash
*/2 * * * * cd /path/to/backend && pnpm run email:worker:prod >> /var/log/email-worker.log 2>&1
```

**Option 2: PM2 (Process Manager)**

```bash
# Install PM2
npm install -g pm2

# Start worker in continuous mode
pm2 start dist/workers/email-worker.js --name email-worker -- continuous 2

# Monitor
pm2 status
pm2 logs email-worker

# Auto-restart on reboot
pm2 startup
pm2 save
```

**Option 3: Docker/Kubernetes**

Create a scheduled job that runs the worker container periodically.

**Option 4: Cloud Functions**

- **AWS Lambda:** Scheduled with EventBridge (CloudWatch Events)
- **Google Cloud Functions:** Scheduled with Cloud Scheduler
- **Azure Functions:** Timer trigger

## 🔌 API Endpoints

All email endpoints require admin authentication.

### Preview Email Template

```http
GET /api/emails/preview/:eventType
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

Returns HTML preview of the email.

### Send Test Email

```http
POST /api/emails/test
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "test@example.com",
  "eventType": "USER_SIGNUP",
  "metadata": {
    "user": {
      "name": "Test User",
      "email": "test@example.com"
    }
  }
}
```

### Send Custom Email

```http
POST /api/emails/custom
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Important Update",
  "htmlBody": "<h1>Hello!</h1><p>Custom message</p>",
  "textBody": "Hello! Custom message"
}
```

### Process Email Queue

```http
POST /api/emails/process
Authorization: Bearer <admin_token>
```

Manually trigger email queue processing.

### Get Email Statistics

```http
GET /api/emails/stats
Authorization: Bearer <admin_token>
```

Returns:
```json
{
  "total": 1250,
  "sent": 1180,
  "pending": 45,
  "failed": 25,
  "byEventType": [
    {
      "eventType": "USER_SIGNUP",
      "count": 450,
      "sent": 445,
      "pending": 3,
      "failed": 2
    }
  ]
}
```

### Cleanup Old Emails

```http
DELETE /api/emails/cleanup?days=30
Authorization: Bearer <admin_token>
```

Deletes email records older than specified days.

### Test Email Configuration

```http
GET /api/emails/test-config
Authorization: Bearer <admin_token>
```

Tests SMTP connection and configuration.

## 💻 Usage Examples

### In Application Code

```typescript
import { queueEmailNotification } from "./services/email-notification.service.js";

// Queue a welcome email
await queueEmailNotification(
  "user@example.com",
  "USER_SIGNUP",
  {
    user: {
      name: "John Doe",
      email: "user@example.com"
    }
  },
  userId // optional
);

// Queue an order confirmation
await queueEmailNotification(
  "user@example.com",
  "ORDER_CREATED",
  {
    order: {
      orderId: "ORD-12345",
      total: 2999,
      items: [
        {
          name: "Arduino Uno",
          quantity: 1,
          price: 499
        },
        {
          name: "Sensor Kit",
          quantity: 1,
          price: 2500
        }
      ]
    }
  },
  userId
);
```

### Send Immediately (Synchronous)

```typescript
import { sendEmailNotification } from "./services/email-notification.service.js";

// Send email immediately
const result = await sendEmailNotification(
  "user@example.com",
  "PASSWORD_RESET",
  {
    user: {
      name: "John Doe"
    },
    resetLink: "https://buildwise.com/reset?token=abc123"
  },
  userId
);

if (result.success) {
  console.log("Email sent:", result.messageId);
} else {
  console.error("Email failed:", result.error);
}
```

## 📊 Monitoring

### Email Statistics

Monitor email performance:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:4000/api/emails/stats
```

### Worker Logs

Watch worker logs:

```bash
# PM2
pm2 logs email-worker

# Docker
docker logs -f <container-id>

# Direct
pnpm run email:worker:watch
```

### Database Queries

Check pending emails:

```sql
SELECT COUNT(*) 
FROM "EmailNotification" 
WHERE "isSent" = false 
  AND "retryCount" < "maxRetries";
```

Check failed emails:

```sql
SELECT * 
FROM "EmailNotification" 
WHERE "retryCount" >= "maxRetries" 
  AND "isSent" = false
ORDER BY "createdAt" DESC;
```

## 🔧 Troubleshooting

### Emails Not Sending

1. **Check SMTP configuration:**
   ```bash
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     http://localhost:4000/api/emails/test-config
   ```

2. **Check worker is running:**
   ```bash
   pm2 status
   # or check logs
   pm2 logs email-worker
   ```

3. **Check database connection:**
   ```bash
   pnpm run prisma:studio
   ```

### Gmail "Less Secure App" Error

Gmail requires **App Passwords** (not your regular password):

1. Enable 2-factor authentication
2. Generate App Password in Google Account settings
3. Use App Password as `SMTP_PASS`

### Emails Going to Spam

1. **Set up SPF record:**
   ```
   TXT @ "v=spf1 include:_spf.google.com ~all"
   ```

2. **Set up DKIM:**
   Configure in your SMTP provider's dashboard

3. **Set up DMARC:**
   ```
   TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
   ```

4. **Use a proper FROM domain:**
   Don't use `@gmail.com` in production

### High Retry Count

If many emails are failing:

1. Check SMTP credentials
2. Check rate limits (Gmail: 500/day, SendGrid: varies by plan)
3. Verify email addresses are valid
4. Check for blacklisting

### Performance Issues

If queue is backing up:

1. Increase worker frequency
2. Run multiple worker instances
3. Increase `limit` in `processPendingEmails(limit)`
4. Consider batch processing
5. Use a dedicated email service (SendGrid, SES, Mailgun)

## 🚀 Best Practices

1. **Use queue for all emails** - Don't send synchronously in API calls
2. **Monitor statistics** - Set up alerts for high failure rates
3. **Clean up old records** - Run cleanup weekly/monthly
4. **Use proper SMTP service** - Don't use personal Gmail for production
5. **Test templates** - Use preview endpoint before deploying
6. **Handle errors gracefully** - Don't fail user actions if email fails
7. **Set reasonable retry limits** - Default is 3, adjust based on needs
8. **Use environment-specific config** - Ethereal for dev, real SMTP for prod

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)
- [SMTP Configuration Guide](https://support.google.com/mail/answer/7126229)
- [Email Testing with Ethereal](https://ethereal.email/)

---

**Need Help?** Check the logs, test configuration, and verify environment variables first!
