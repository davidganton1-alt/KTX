// Legacy-compatible facade over the Phase G email system.
// Existing imports (admin/pastor route, auth/register) keep working unchanged;
// new code should import { emails } from '@/lib/email/service'.

import { pastorsDb } from "@/lib/pastorStore";
import { sendNow, queueEmail } from "@/lib/email/service";
import * as React from "react";
import { PastorApplicationApprovedEmail } from "@/lib/email/templates/pastor-application-approved";
import { CreatorApplicationRejectedEmail } from "@/lib/email/templates/creator-application-rejected";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  element?: React.ReactElement;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider?: string;
}

/** Direct send (awaited) — legacy signature preserved. */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const r = await sendNow(message);
  pastorsDb.recordEmail(message.to, message.subject, r.success ? 'sent' : 'failed', r.messageId || r.error || 'unknown');
  return r;
}

// ── TEMPLATES (route admin/pastor imports these; now rendered on the
//    professional BaseTemplate shell instead of the old inline strings) ──

export function pastorApprovalEmail(params: { name: string; email: string; password: string }): EmailMessage {
  return {
    to: params.email,
    subject: 'Welcome to KingdomTradeX — Your Pastor Account Is Ready',
    html: '',
    element: React.createElement(PastorApplicationApprovedEmail, { name: params.name, email: params.email, password: params.password }),
  };
}

/** Phase G: render + queue a pastor approval email properly. */
export function queuePastorApproval(params: { name: string; ministry?: string; email: string; password: string }) {
  queueEmail({ to: params.email, subject: 'Welcome to KingdomTradeX — Your Pastor Account Is Ready', element: React.createElement(PastorApplicationApprovedEmail, params) });
}

export function pastorRejectionEmail(params: { name: string }): EmailMessage {
  return {
    to: "", // overridden by caller with the applicant's email
    subject: 'Your KingdomTradeX Pastor Application',
    html: '',
    element: React.createElement(CreatorApplicationRejectedEmail, { name: params.name }),
  };
}

/** Phase G: render + queue a pastor rejection email properly. */
export function queuePastorRejection(to: string, params: { name: string; reason?: string }) {
  queueEmail({ to, subject: 'Your KingdomTradeX Pastor Application', element: React.createElement(CreatorApplicationRejectedEmail, params) });
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

export { queueEmail, emails } from "@/lib/email/service";
