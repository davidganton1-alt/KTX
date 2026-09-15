import { NextRequest, NextResponse } from 'next/server';
import * as React from 'react';
import { render } from '@react-email/render';
import {
  WelcomeEmail,
  PastorApplicationReceivedEmail,
  PastorApplicationRejectedEmail,
  PlatformAnnouncementEmail,
  NewLoginAlertEmail,
  PasswordChangedEmail,
  AccountRestrictedEmail,
  FirstDepositReminderEmail,
  SupportTicketReplyEmail,
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
} from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

// Renders one Phase G email template to its final document, served as text/html
// so /preview/emails can show the *exact* bytes a recipient's client would get.
const SAMPLES: Record<string, React.ReactElement> = {
  'welcome': React.createElement(WelcomeEmail, { name: 'Amara Okafor', tier: 'Ambassador', platformCredit: 50 }),
  'creator-received': React.createElement(CreatorApplicationReceivedEmail, { name: 'Marcus Ade', platform: 'Instagram', handle: '@marcusfinance' }),
  'creator-approved': React.createElement(CreatorApplicationApprovedEmail, { name: 'Marcus Ade', brandName: 'Kingdom Finance Lab', inviteLink: 'https://kingdomtradex.com/register?ref=abc123' }),
  'creator-rejected': React.createElement(CreatorApplicationRejectedEmail, { name: 'Marcus Ade', reason: 'Your channel focus overlaps an existing partnership. Reapply after October.' }),
  'pastor-approved': React.createElement(PastorApplicationApprovedEmail, { name: 'Sarah Lin', ministry: "Shepherd's Gate Fellowship", email: 'sarah@kingdomtradex.com', password: 'CHANGEME-2026' }),
  'deposit-confirmed': React.createElement(DepositConfirmedEmail, { name: 'Amara Okafor', amount: 5000, tier: 'Ambassador', date: 'Sep 12, 2026' }),
  'profit-processed': React.createElement(ProfitWithdrawalProcessedEmail, { name: 'Amara Okafor', amount: 200, network: 'TRC20', txHash: 'f3a9c81b2d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcd' }),
  'principal-requested': React.createElement(PrincipalWithdrawalRequestedEmail, { name: 'Amara Okafor', amount: 5000, net: 2500, feePct: 50, reviewBy: 'Sep 15, 2026 14:00 UTC' }),
  'principal-approved': React.createElement(PrincipalWithdrawalApprovedEmail, { name: 'Amara Okafor', net: 2500, network: 'TRC20', when: 'Sep 16, 2026' }),
  'principal-rejected': React.createElement(PrincipalWithdrawalRejectedEmail, { name: 'Amara Okafor', amount: 5000, reason: 'Recent chargeback review on the funding account. Your principal is safe and still earning.' }),
  'referral-requested': React.createElement(ReferralWithdrawalRequestedEmail, { name: 'Marcus Ade', amount: 100, reviewBy: 'Sep 15, 2026 18:00 UTC' }),
  'referral-decision': React.createElement(ReferralWithdrawalDecisionEmail, { name: 'Marcus Ade', amount: 100, approved: true, network: 'TRC20' }),
  'weekly-summary': React.createElement(WeeklySummaryEmail, { name: 'Amara Okafor', weekProfit: 262.5, lifetimeProfit: 1247.5, available: 1047.5, dailyRatePct: '0.75', principal: 5000 }),
  'password-reset': React.createElement(PasswordResetEmail, { name: 'Amara Okafor', resetLink: 'https://kingdomtradex.com/reset?token=demo-token-1234567890abcdef' }),
  'agreement-reminder': React.createElement(AgreementReminderEmail, { name: 'Amara Okafor' }),
  'pastor-received': React.createElement(PastorApplicationReceivedEmail, { name: 'Rev. Michael Ade', ministryName: 'Living Vine Chapel' }),
  'pastor-rejected': React.createElement(PastorApplicationRejectedEmail, { name: 'Rev. Michael Ade', reason: 'We need a congregation of at least 50 active members for this partnership round. Reapply any time.' }),
  'announcement': React.createElement(PlatformAnnouncementEmail, { title: 'Scheduled maintenance — Sep 20, 02:00 UTC', body: 'The platform will pause deposits for roughly 30 minutes while we upgrade the payment processor connection. Profit accrual and withdrawals are unaffected. No action is needed.', actionUrl: 'https://kingdomtradex.com/console', actionLabel: 'Open my dashboard' }),
  'new-login': React.createElement(NewLoginAlertEmail, { name: 'Amara Okafor', ipAddress: '203.0.113.42', device: 'Chrome on MacOS', location: 'New York, US', loginTime: 'Sep 15, 2026 14:00 UTC' }),
  'password-changed': React.createElement(PasswordChangedEmail, { name: 'Amara Okafor', changedAt: 'Sep 15, 2026 13:42 UTC' }),
  'account-restricted': React.createElement(AccountRestrictedEmail, { name: 'Amara Okafor', reason: 'Unusual payout destination pattern flagged by our fraud rules — routine check, usually cleared within 48h.' }),
  'first-deposit-reminder': React.createElement(FirstDepositReminderEmail, { name: 'Amara Okafor', platformCredit: 50 }),
  'support-ticket': React.createElement(SupportTicketReplyEmail, { name: 'Amara Okafor', ticketId: 'KTX-a1b2c3d4', subject: 'Question about my Steward tier rate' }),
};

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t') || 'welcome';
  const el = SAMPLES[t] || SAMPLES['welcome'];
  const doc = await render(el);
  return new NextResponse(doc, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
}
