import * as React from 'react';
import { render } from '@react-email/render';
import { getTransporter, isEmailConfigured, FROM_EMAIL, FROM_NAME, SITE_URL } from './config';
import { pastorsDb } from '@/lib/pastorStore';
import {
  WelcomeEmail,
  CreatorApplicationReceivedEmail,
  CreatorApplicationApprovedEmail,
  CreatorApplicationRejectedEmail,
  PastorApplicationApprovedEmail,
  DepositConfirmedEmail,
  ProfitWithdrawalProcessedEmail,
  PrincipalWithdrawalRequestedEmail,
  PrincipalWithdrawalApprovedEmail,
  PrincipalWithdrawalRejectedEmail,
  ReferralWithdrawalRequestedEmail,
  ReferralWithdrawalDecisionEmail,
  WeeklySummaryEmail,
  PasswordResetEmail,
  AgreementReminderEmail,
  PastorApplicationReceivedEmail,
  PastorApplicationRejectedEmail,
  PlatformAnnouncementEmail,
  NewLoginAlertEmail,
  PasswordChangedEmail,
  AccountRestrictedEmail,
  FirstDepositReminderEmail,
  SupportTicketReplyEmail,
} from './templates';

// ── rendering ────────────────────────────────────────────────────────────
// renderToStaticMarkup keeps sendEmail() synchronous-friendly (no async
// renderer deps) and produces the same HTML the preview pages show.

export async function renderTemplate(el: React.ReactElement): Promise<string> {
  return render(el);
}

/** Extract a plain-text fallback from rendered email HTML. */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8203;|[\u200b\u200c]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n?\s*\n\s*\n+/g, '\n\n')
    .trim();
}

// ── send core ────────────────────────────────────────────────────────────

export interface OutgoingEmail {
  to: string;
  subject: string;
  /** one of: pre-rendered html OR the template element (rendered in the queue) */
  html?: string;
  element?: React.ReactElement;
  text?: string;
  /** true for anything non-essential (digests) -> unsub headers added */
  marketing?: boolean;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider: 'smtp' | 'log';
  error?: string;
}

const queue: { msg: OutgoingEmail; attempts: number }[] = [];
let draining = false;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [0, 2000, 8000];

/** Fire-and-forget enqueue: never throws into a money-flow request. */
export function queueEmail(msg: OutgoingEmail): void {
  queue.push({ msg, attempts: 0 });
  void drain();
}

async function drain() {
  if (draining) return;
  draining = true;
  try {
    while (queue.length) {
      const job = queue[0];
      if (!job.msg.html && job.msg.element) {
        job.msg.html = await renderTemplate(job.msg.element);
      }
      const result = await sendNow(job.msg);
      job.attempts++;
      if (result.success || job.attempts >= MAX_ATTEMPTS) {
        queue.shift();
        pastorsDb.recordEmail(job.msg.to, job.msg.subject, result.success ? 'sent' : 'failed', result.messageId || result.error || 'unknown');
      } else {
        await new Promise((r) => setTimeout(r, BACKOFF_MS[job.attempts] || 8000));
      }
    }
  } catch (e: any) {
    console.error('[email] drain failed:', e.message);
  } finally {
    draining = false;
  }
}

/** Direct send with one attempt. Falls back to structured log when SMTP is
 *  unconfigured (dev) so flows keep working until EMAIL_USER/PASS are set. */
export async function sendNow(msg: OutgoingEmail): Promise<EmailResult> {
  let text = msg.text || '';
  if (!msg.html && msg.element) msg.html = await renderTemplate(msg.element);
  if (!msg.text) msg.text = htmlToText(msg.html || '');
  const textFinal = msg.text || msg.subject;
  if (!isEmailConfigured()) {
    console.log(`[email:log] to=${msg.to} subject="${msg.subject}" textLen=${textFinal.length}`);
    return { success: true, provider: 'log', messageId: `log-${Date.now()}` };
  }
  try {
    const info = await getTransporter().sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: msg.to,
      subject: msg.subject,
      html: msg.html || '',
      text: textFinal,
      headers: {
        'X-Mailer': 'KingdomTradeX',
        'Auto-Submitted': 'auto-generated',
        ...(msg.marketing ? { 'List-Unsubscribe': `<mailto:unsubscribe@kingdomtradex.com?subject=unsubscribe>, <${SITE_URL}/settings>` } : {}),
      },
    });
    return { success: true, provider: 'smtp', messageId: info.messageId };
  } catch (e: any) {
    console.error('[email] send failed:', e.message);
    return { success: false, provider: 'smtp', error: e.message };
  }
}

// ── typed convenience API ────────────────────────────────────────────────

function el(jsx: React.ReactElement, to: string, subject: string, marketing = false) {
  // never renders or sends inline: the queue drains in the background
  queueEmail({ to, subject, element: jsx, marketing });
}

export const emails = {
  welcome: (to: string, p: { name: string; tier: string; platformCredit: number }) =>
    el(React.createElement(WelcomeEmail, p), to, 'Welcome to KingdomTradeX'),

  creatorApplicationReceived: (to: string, p: { name: string; platform: string; handle: string }) =>
    el(React.createElement(CreatorApplicationReceivedEmail, p), to, 'Your creator application is under review'),

  creatorApplicationApproved: (to: string, p: { name: string; brandName: string; inviteLink: string }) =>
    el(React.createElement(CreatorApplicationApprovedEmail, p), to, 'Your creator application is approved'),

  creatorApplicationRejected: (to: string, p: { name: string; reason?: string }) =>
    el(React.createElement(CreatorApplicationRejectedEmail, p), to, 'Update on your creator application'),

  pastorApplicationApproved: (to: string, p: { name: string; ministry?: string; email: string; password: string }) =>
    el(React.createElement(PastorApplicationApprovedEmail, p), to, 'Your KingdomTradeX pastor account is ready'),

  depositConfirmed: (to: string, p: { name: string; amount: number; tier: string; date: string }) =>
    el(React.createElement(DepositConfirmedEmail, p), to, `Deposit confirmed — $${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`),

  profitWithdrawalProcessed: (to: string, p: { name: string; amount: number; network: string; txHash?: string }) =>
    el(React.createElement(ProfitWithdrawalProcessedEmail, p), to, 'Your profit withdrawal is on the way'),

  principalWithdrawalRequested: (to: string, p: { name: string; amount: number; net: number; feePct: number; reviewBy: string }) =>
    el(React.createElement(PrincipalWithdrawalRequestedEmail, p), to, 'Principal withdrawal request received'),

  principalWithdrawalApproved: (to: string, p: { name: string; net: number; network: string; when: string }) =>
    el(React.createElement(PrincipalWithdrawalApprovedEmail, p), to, 'Your withdrawal has been approved'),

  principalWithdrawalRejected: (to: string, p: { name: string; amount: number; reason?: string }) =>
    el(React.createElement(PrincipalWithdrawalRejectedEmail, p), to, 'Update on your withdrawal request'),

  referralWithdrawalRequested: (to: string, p: { name: string; amount: number; reviewBy: string }) =>
    el(React.createElement(ReferralWithdrawalRequestedEmail, p), to, 'Referral withdrawal request received'),

  referralWithdrawalDecision: (to: string, p: { name: string; amount: number; approved: boolean; reason?: string; network?: string }) =>
    el(React.createElement(ReferralWithdrawalDecisionEmail, p), to, p.approved ? 'Referral withdrawal approved' : 'Update on your referral withdrawal'),

  weeklySummary: (to: string, p: { name: string; weekProfit: number; lifetimeProfit: number; available: number; dailyRatePct: string; principal: number }) =>
    el(React.createElement(WeeklySummaryEmail, p), to, 'Your week in review', true),

  passwordReset: (to: string, p: { name: string; resetLink: string }) =>
    el(React.createElement(PasswordResetEmail, p), to, 'Reset your KingdomTradeX password'),

  agreementReminder: (to: string, p: { name: string }) =>
    el(React.createElement(AgreementReminderEmail, p), to, 'One quick step left on your account'),

  pastorApplicationReceived: (to: string, p: { name: string; ministryName: string }) =>
    el(React.createElement(PastorApplicationReceivedEmail, p), to, 'Your pastor application is under review'),

  pastorApplicationRejected: (to: string, p: { name: string; reason?: string }) =>
    el(React.createElement(PastorApplicationRejectedEmail, p), to, 'Update on your pastor application'),

  platformAnnouncement: (to: string, p: { title: string; body: string; actionUrl?: string; actionLabel?: string }) =>
    el(React.createElement(PlatformAnnouncementEmail, p), to, p.title, true),

  newLoginAlert: (to: string, p: { name: string; ipAddress: string; device: string; location: string; loginTime: string }) =>
    el(React.createElement(NewLoginAlertEmail, p), to, 'New sign-in to your KingdomTradeX account'),

  passwordChanged: (to: string, p: { name: string; changedAt: string }) =>
    el(React.createElement(PasswordChangedEmail, p), to, 'Your password was changed'),

  accountRestricted: (to: string, p: { name: string; reason: string }) =>
    el(React.createElement(AccountRestrictedEmail, p), to, 'Your account is under security review'),

  firstDepositReminder: (to: string, p: { name: string; platformCredit: number }) =>
    el(React.createElement(FirstDepositReminderEmail, p), to, `Your $${p.platformCredit.toFixed(0)} platform credit is waiting`, true),

  supportTicketReply: (to: string, p: { name: string; ticketId: string; subject: string }) =>
    el(React.createElement(SupportTicketReplyEmail, p), to, `We received your message: ${p.subject}`),
};
