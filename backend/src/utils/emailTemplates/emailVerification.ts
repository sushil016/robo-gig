import { wrapTemplate, type EmailTemplate } from "./base.js";

export function emailVerificationTemplate(data: {
  user: {
    name: string;
  };
  verificationLink: string;
  expiresIn?: string;
}): EmailTemplate {
  const content = `
    <h1>Verify Your Email Address 📧</h1>
    <p>Hi ${data.user.name || "there"},</p>
    <p>
      Thanks for signing up! To complete your registration and access all BuildWise features,
      please verify your email address by clicking the button below.
    </p>

    <p class="text-center">
      <a href="${data.verificationLink}" class="button">Verify Email Address</a>
    </p>

    <div class="info-box">
      <p><strong>⏰ This link will expire in ${data.expiresIn || "24 hours"}.</strong></p>
      <p>If you didn't create an account with BuildWise, you can safely ignore this email.</p>
    </div>

    <p>
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="word-break: break-all; color: #667eea;">
      ${data.verificationLink}
    </p>

    <p>
      Best regards,<br>
      The BuildWise Team
    </p>
  `;

  return {
    subject: "Verify Your BuildWise Email Address",
    html: wrapTemplate(content),
    text: `Verify Your Email Address 📧

Hi ${data.user.name || "there"},

Thanks for signing up! To complete your registration and access all BuildWise features, please verify your email address.

Verification Link: ${data.verificationLink}

⏰ This link will expire in ${data.expiresIn || "24 hours"}.

If you didn't create an account with BuildWise, you can safely ignore this email.

Best regards,
The BuildWise Team`,
  };
}
