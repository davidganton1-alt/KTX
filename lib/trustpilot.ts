// ── SWAP THESE WITH REAL TRUSTPILOT CREDENTIALS IN FINAL PASS ──
export const TRUSTPILOT_CONFIG = {
  businessUnitId: 'YOUR_BUSINESS_UNIT_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  domain: 'kingdomtradex.com',
  profileUrl: 'https://www.trustpilot.com/review/kingdomtradex.com',
};

// TrustBox widget template IDs (get these from Trustpilot Business dashboard)
export const TRUSTBOX_TEMPLATES = {
  carousel: '53aa8807dec7e10d38f59f32',
  mini: '539adbd6dec7e10e686debee',
  grid: '539adbd6dec7e10e686debef',
};

// Neutral, compliant invitation messages (NO incentives, NO filtering)
export const INVITATION_MESSAGES = {
  firstWithdrawal: {
    title: 'Share Your Experience',
    message: 'You just made your first withdrawal. We would love to hear about your experience with KingdomTradeX. Your feedback helps us improve and helps other users make informed decisions.',
  },
  activeUser30Days: {
    title: 'How Are We Doing?',
    message: 'You have been with KingdomTradeX for 30 days. We value your honest feedback. Please consider sharing your experience on Trustpilot.',
  },
  thirdWithdrawal: {
    title: 'Tell Us What You Think',
    message: 'You have now made multiple withdrawals. We would appreciate your honest review on Trustpilot to help other users understand our platform.',
  },
};

// Eligibility rules for review invitations (compliant timing)
interface InvitationRule {
  trigger: string;
  minDaysSinceSignup?: number;
  minWithdrawals?: number;
  cooldownDays: number;
}

export const INVITATION_RULES: Record<string, InvitationRule> = {
  firstWithdrawal: {
    trigger: 'first_successful_withdrawal',
    minDaysSinceSignup: 7,
    cooldownDays: 90,
  },
  activeUser30Days: {
    trigger: 'account_age_30_days',
    minWithdrawals: 1,
    cooldownDays: 180,
  },
  thirdWithdrawal: {
    trigger: 'third_successful_withdrawal',
    minDaysSinceSignup: 30,
    cooldownDays: 120,
  },
};
