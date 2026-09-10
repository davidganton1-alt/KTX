// ── SWAP THIS ENTIRE FILE IN THE FINAL PASS ──
// Replace sendEmail() body with real Resend/SendGrid/SMTP call.
// Keep the interface identical: { to, subject, html, text? } → Promise<{success, messageId}>

import { pastorsDb } from "@/lib/pastorStore";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider?: string;
}

// ── SWAP THIS WITH REAL PROVIDER IN FINAL PASS ──
// const RESEND_API_KEY = process.env.RESEND_API_KEY;
// import { Resend } from 'resend';
// const resend = new Resend(RESEND_API_KEY);

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  // PLACEHOLDER: logs email instead of sending. Replace with real provider call.
  console.log('═══════════════════════════════════════════════');
  console.log(`[EMAIL PLACEHOLDER] To: ${message.to}`);
  console.log(`[EMAIL PLACEHOLDER] Subject: ${message.subject}`);
  console.log(`[EMAIL PLACEHOLDER] HTML length: ${message.html.length} chars`);
  console.log('═══════════════════════════════════════════════');

  const messageId = `placeholder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  pastorsDb.recordEmail(message.to, message.subject, 'placeholder', messageId);

  return {
    success: true,
    messageId,
    provider: 'placeholder',
  };
}

// ── TEMPLATES (these are the actual emails sent; keep them) ──

export function pastorApprovalEmail(params: {
  name: string;
  email: string;
  password: string;
}): EmailMessage {
  const loginUrl = 'https://kingdomtradex.com/login';
  return {
    to: params.email,
    subject: 'Welcome to KingdomTradeX — Your Pastor Account Is Ready',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px; background: #f9f9f9; border-radius: 12px;">
          <h1 style="color: #B8860B; margin: 0 0 16px 0;">Welcome, ${params.name}</h1>
          <p style="margin: 0 0 16px 0; line-height: 1.6;">Your KingdomTradeX pastor application has been approved. You may now log in to your dashboard and begin shepherding your flock.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Your login credentials:</p>
            <p style="margin: 0 0 4px 0;"><strong>Email:</strong> ${params.email}</p>
            <p style="margin: 0 0 16px 0;"><strong>Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${params.password}</code></p>
            <a href="${loginUrl}" style="display: inline-block; background: #B8860B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Log in to your dashboard →</a>
          </div>
          <p style="margin: 24px 0 0 0; font-size: 13px; color: #666;"><strong>Important:</strong> Please change this password immediately after your first login for security.</p>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #999;">KingdomTradeX — Faith-Driven AI Trading</p>
        </div>
      </div>
    `.trim(),
  };
}

export function pastorRejectionEmail(params: { name: string }): EmailMessage {
  return {
    to: "", // overridden by caller with the applicant's email
    subject: 'Your KingdomTradeX Pastor Application',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px; background: #f9f9f9; border-radius: 12px;">
          <h1 style="color: #1a1a1a; margin: 0 0 16px 0;">Hi ${params.name},</h1>
          <p style="margin: 0 0 16px 0; line-height: 1.6;">Thank you for your interest in joining KingdomTradeX as a pastor. After careful review, we are unable to approve your application at this time.</p>
          <p style="margin: 0 0 16px 0; line-height: 1.6;">We appreciate your willingness to serve, and we encourage you to reapply in the future.</p>
          <p style="margin: 24px 0 0 0; font-size: 12px; color: #999;">KingdomTradeX — Faith-Driven AI Trading</p>
        </div>
      </div>
    `.trim(),
  };
}

// ── LEGACY (kept: /api/auth/register imports this) ──
// Dev Mode email sender — logs verification link to console + returns it for UI display.
// Later, swap this with a real provider (Resend/SendGrid) by adding one env var.

export function sendVerificationEmail(email: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
  const verifyLink = `${baseUrl}/verify?token=${token}`;

  // Log to server console for Dev Mode
  console.log(`
═══════════════════════════════════════════════════════════
📧 VERIFICATION EMAIL (Dev Mode)
═══════════════════════════════════════════════════════════
To: ${email}
Subject: Verify your KingdomTradeX account

Click the link below to verify your account:

${verifyLink}

This link expires in 24 hours.
═══════════════════════════════════════════════════════════
  `);

  return verifyLink;
}
