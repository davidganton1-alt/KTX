import type { Metadata } from 'next';
import { LegalLayout, type LegalSection } from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | KingdomTradeX',
  description: 'Clear, honest terms for using KingdomTradeX. Understand holding periods, withdrawal rules, and risk disclosures before you trade.',
  openGraph: {
    title: 'Terms of Service | KingdomTradeX',
    description: 'Clear, honest terms for using KingdomTradeX.',
    type: 'website',
  },
  alternates: { canonical: '/terms' },
};

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    paras: [
      'These Terms of Service ("Terms") are a legally binding agreement between you ("you" or "user") and KingdomTradeX ("we", "our", or "us"). By creating an account, depositing funds, or using any part of the platform, you accept these Terms in full. If you do not agree, you must not use the platform.',
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    paras: [
      'You must be at least 18 years old and legally capable of entering binding agreements in your jurisdiction to use the platform.',
    ],
    bullets: [
      'You represent that you are not located in, or a resident of, a country or territory subject to comprehensive international sanctions (including those administered by OFAC), and that you are not designated on any sanctions list.',
      'You are responsible for confirming that using a crypto-denominated trading platform is lawful where you live.',
    ],
  },
  {
    id: 'account-security',
    title: '3. Account Security',
    paras: [
      'You are responsible for everything that happens under your account.',
    ],
    bullets: [
      'Keep your password confidential and unique. We will never ask for it by email.',
      'We strongly recommend enabling two-factor authentication (2FA) in your dashboard settings; account activity under your credentials is treated as authorized by you.',
      'Notify us immediately at support@kingdomtradex.com of any unauthorized access or suspicious activity.',
      'One person may not hold more than one account. Email verification is required before transactions.',
    ],
  },
  {
    id: 'platform',
    title: '4. The Platform and How It Works',
    paras: [
      'KingdomTradeX is a faith-driven automated investment platform. When you deposit funds, the AI trading engine executes trades across a diversified basket of cryptocurrencies, U.S. stocks, and commodities under the plan tier you selected. You are not trading manually; the engine trades on your behalf within its risk guardrails.',
      'The rates displayed per tier (0.25%, 0.50%, 0.75% daily) are target rates reflecting the engine\'s design, not guaranteed returns. Actual results vary with market conditions.',
    ],
  },
  {
    id: 'plans',
    title: '5. Plans and Tiers',
    paras: [
      'Three tiers: Faithful ($100–$999, 0.25%/day, 6-month hold), Steward ($1,000–$4,999, 0.50%/day, 9-month hold), Ambassador ($5,000–$15,000, 0.75%/day, 12-month hold). The $15,000 maximum per plan is a hard risk limit.',
    ],
  },
  {
    id: 'deposits',
    title: '6. Deposits',
    paras: [
      'Deposits are made in USDT (TRC20) and credited upon network confirmation by our payment processor. Sending funds on the wrong network can result in permanent loss; warnings are displayed at every step, and the network is yours to verify.',
      'The $50 platform credit is a promotional tool: it accrues daily profit alongside your principal but is never itself withdrawable.',
    ],
  },
  {
    id: 'withdrawals',
    title: '7. Withdrawals',
    bullets: [
      'Profit: withdrawable at any time, automatically, without admin approval. Daily profit accrues at UTC midnight on (principal + platform credit) × tier rate.',
      'Principal after hold: fully withdrawable with no fee after your tier\'s holding period (6/9/12 months).',
      'Principal before hold: permitted, subject to the 50% Liquidity Provision Fee described in the Trading Agreement and section 11 below.',
      'The platform credit itself cannot be withdrawn under any circumstances.',
    ],
  },
  {
    id: 'fees',
    title: '8. Fees and Commissions',
    paras: [
      'KingdomTradeX charges no hidden fees. Deposits are processed without platform deductions and the target daily rate is the net rate you earn.',
    ],
    bullets: [
      'Blockchain network fees on payouts (TRC20 ≈ $1, BEP20 ≈ $0.30, ERC20 ≈ $3–8) are set by the network, not by us, and are the user\'s responsibility.',
      'Payment-processor fees (Plisio) are passed through at cost where applicable and shown before you confirm.',
      'The only other fee on the platform is the 50% Liquidity Provision Fee on early principal withdrawal, disclosed before you sign.',
    ],
  },
  {
    id: 'referrals',
    title: '9. Referral Program',
    paras: [
      'Users earn 2.5% of a referred member\'s first deposit; approved Pastors and Creators earn 5%. All referrers additionally earn 0.1% of the referred member\'s daily profit, for life. Referral earnings unlock after a 7-day anti-fraud hold and payouts are admin-reviewed.',
      'We may withhold or reverse referral bonuses that appear fraudulent, self-referred, or abusive (including botting signup or referral activity).',
    ],
  },
  {
    id: 'pastors',
    title: '10. Pastors and Creators',
    paras: [
      'Pastors and Creators are approved partners who may refer members. Every application is reviewed before approval. Partner commissions come from platform profit — never from a referred member\'s principal — and partners never see or control member funds.',
    ],
  },
  {
    id: 'prohibited',
    title: '11. Acceptable Use',
    paras: ['You agree not to:'],
    bullets: [
      'Use the platform for money laundering, fraud, sanctions evasion, or any illegal activity.',
      'Create multiple accounts or bot activity to abuse the referral or platform-credit programs.',
      'Attempt to interfere with the platform\'s operation, security, or infrastructure, including automated scraping of the trading engine.',
      'Misrepresent your identity, jurisdiction, or eligibility.',
      'Impersonate KingdomTradeX or its staff, pastors, or creators.',
    ],
  },
  {
    id: 'risk',
    title: '12. Trading Risk and the Trading Agreement',
    paras: [
      'Trading involves substantial risk of loss, including the possible loss of some or all of your deposited principal. Before transacting you must sign our Trading Agreement, which states the risk disclosures, the holding-period mechanics, and the 50% Liquidity Provision Fee in plain language. It supplements these Terms and governs your funds.',
    ],
  },
  {
    id: 'not-advice',
    title: '13. Not Investment Advice',
    paras: [
      'Nothing on this platform constitutes financial, investment, legal, or tax advice. We provide a technology and stewardship framework, not personalized guidance. You are solely responsible for your decisions and should consult independent advisors where appropriate.',
    ],
  },
  {
    id: 'limitation',
    title: '14. Limitation of Liability',
    paras: [
      'To the maximum extent permitted by law, KingdomTradeX is not liable for indirect, incidental, consequential, or punitive damages arising from your use of the platform, including lost profits or trading losses. Our total liability for any claim is limited to the funds actually held in your account when the claim arises.',
      'You agree to indemnify and hold harmless KingdomTradeX, its officers, directors, and employees from claims arising out of your use of the platform or breach of these Terms.',
    ],
  },
  {
    id: 'law',
    title: '15. Governing Law and Dispute Resolution',
    paras: [
      'These Terms are governed by the laws of the United States and the state in which KingdomTradeX is registered. Disputes shall first be attempted in good-faith negotiation; unresolved disputes shall be settled by binding arbitration under the rules of the American Arbitration Association, in the state of registration, unless prohibited by applicable law. You waive the right to participate in class actions to the extent permitted by law.',
    ],
  },
  {
    id: 'changes',
    title: '16. Changes to These Terms',
    paras: [
      'We may update these Terms. Material changes are announced through the platform and posted with a new "last updated" date. Continued use after changes take effect constitutes acceptance; you may stop using the platform if you disagree.',
    ],
  },
  {
    id: 'misc',
    title: '17. General',
    bullets: [
      'Termination: we may suspend accounts for violations, fraud, or prolonged inactivity; you may close your account subject to holding periods and withdrawal rules.',
      'Intellectual property: the engine, design, and content are owned by or licensed to KingdomTradeX.',
      'Official website: kingdomtradex.com is the ONLY official site. Anyone asking for funds through another channel is not us — report it to support.',
      'Severability: if any provision is held invalid, the rest remains in effect.',
    ],
  },
  {
    id: 'contact',
    title: '18. Contact',
    paras: [
      'Questions about these Terms: support@kingdomtradex.com or the support channel on this site.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="The rules of the platform, in plain language. What we charge, what we don't, and what you're agreeing to."
      lastUpdated="September 15, 2026"
      sections={sections}
    />
  );
}
