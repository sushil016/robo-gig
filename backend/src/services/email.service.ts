import nodemailer, { type Transporter } from "nodemailer";
import type { EmailTemplate } from "../utils/email-templates.js";

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // true for 465, false for other ports
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const FROM_NAME = process.env.FROM_NAME || "BuildWise";

/**
 * Email transporter instance
 */
let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): Transporter {
  if (!transporter) {
    // Check if email is configured
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn("⚠️  Email not configured. Set SMTP_USER and SMTP_PASS in .env");
      // Return a test account for development
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Using ethereal email for development");
        // We'll create this on first send
      }
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER && SMTP_PASS ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      } : undefined,
    });
  }

  return transporter;
}

/**
 * Create test account for development (Ethereal Email)
 */
async function createTestAccount(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot use test account in production");
  }

  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("📧 Test email account created:");
  console.log("   User:", testAccount.user);
  console.log("   Pass:", testAccount.pass);
}

/**
 * Send an email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  previewUrl?: string;
}> {
  try {
    let emailTransporter = getTransporter();

    // Create test account if in development and not configured
    if (!SMTP_USER && process.env.NODE_ENV === "development") {
      await createTestAccount();
      emailTransporter = getTransporter();
    }

    // Verify connection
    try {
      await emailTransporter.verify();
    } catch (error) {
      console.error("❌ Email transporter verification failed:", error);
      return {
        success: false,
        error: "Email service not configured properly",
      };
    }

    // Send email
    const info = await emailTransporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);

    // Get preview URL for ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📧 Preview URL:", previewUrl);
    }

    const result: {
      success: boolean;
      messageId?: string;
      error?: string;
      previewUrl?: string;
    } = {
      success: true,
      messageId: info.messageId,
    };

    if (previewUrl) {
      result.previewUrl = previewUrl;
    }

    return result;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email using template
 */
export async function sendTemplateEmail(
  to: string,
  template: EmailTemplate
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  previewUrl?: string;
}> {
  return sendEmail(to, template.subject, template.html, template.text || "");
}

/**
 * Send bulk emails (with rate limiting)
 */
export async function sendBulkEmails(
  emails: Array<{ to: string; template: EmailTemplate }>,
  delayMs: number = 100
): Promise<Array<{
  to: string;
  success: boolean;
  messageId?: string;
  error?: string;
}>> {
  const results: Array<{
    to: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }> = [];

  for (const email of emails) {
    const result = await sendTemplateEmail(email.to, email.template);
    results.push({
      to: email.to,
      ...result,
    });

    // Add delay between emails to avoid rate limiting
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const emailTransporter = getTransporter();
    await emailTransporter.verify();
    return {
      success: true,
      message: "Email configuration is valid",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
