import type { Metadata } from 'next';
import { LegalLayout, type LegalSection } from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | KingdomTradeX',
  description: 'What we collect, what we never touch, and who we share with. No dark patterns, no data sales.',
  openGraph: {
    title: 'Privacy Policy | KingdomTradeX',
    description: 'Honest data practices for KingdomTradeX.',
    type: 'website',
  },
  alternates: { canonical: '/privacy' },
};

const sections: LegalSection[] = [
  {
    id: 'overview',
    title: '1. Overview',
    paras: [
      'KingdomTradeX ("we", "our", or "us") respects your privacy. This policy describes exactly what we collect, why, and who sees it. By creating an account you agree to these practices.',
    ],
  },
  {
    id: 'collect',
    title: '2. Information We Collect',
    paras: ['Only what an account and a regulated financial platform genuinely need:'],
    bullets: [
      'Account data: your name, email address, and a hashed password.',
      'Wallet addresses you give us for payouts, and on-chain transaction hashes of deposits/withdrawals we send you.',
      'Financial records: deposits, withdrawals, profit accruals, and your plan tier.',
      'Referral data: the pastor, creator, or member code that invited you.',
      'Technical data: IP address, browser/device type, and session information — used for security and fraud prevention only.',
      'Partner data (approved pastors/creators): ministry or brand details, platform handle, and referral activity.',
    ],
  },
  {
    id: 'never-collect',
    title: '3. What We Never Collect',
    bullets: [
      'Private keys or seed phrases — ever. If anyone claiming to be KingdomTradeX asks for one, it is a scam.',
      'Passwords in plain text (they are one-way hashed before storage).',
      'Government ID unless a specific transaction legally requires it under our MSB compliance obligations.',
      'Tracking or advertising cookies; no third-party analytics that profile you across the web.',
    ],
  },
  {
    id: 'use',
    title: '4. How We Use Your Information',
    bullets: [
      'To create, secure, and operate your account.',
      'To credit deposits, accrue daily profit, and process withdrawals.',
      'To verify email and defend against fraud, duplicate accounts, and referral abuse.',
      'To attribute referral commissions to the person who invited you.',
      'To contact you about security, account status, or legal notices.',
      'To comply with our MSB license and applicable law.',
    ],
  },
  {
    id: 'no-sell',
    title: '5. We Do Not Sell Your Data',
    paras: [
      'We never sell, rent, or trade personal information to advertisers, data brokers, or anyone else. Your data is not our product. ("Do not sell" under CCPA/CPRA: we do not sell or share for cross-context behavioral advertising.)',
    ],
  },
  {
    id: 'sharing',
    title: '6. Who We Share With',
    paras: ['Only the processors needed to run the service, each bound by contract to protect the data:'],
    bullets: [
      'Plisio — our crypto payment processor. Receives only the transaction details required to confirm a deposit or execute a payout.',
      'Supabase — our hosting/database provider (United States). Holds account and ledger data under contractual security obligations.',
      'Regulatory authorities — only when required by law, subpoena, or our MSB compliance duties.',
      'We do not share your data for any other purpose.',
    ],
  },
  {
    id: 'security',
    title: '7. Data Security',
    paras: [
      'Passwords are hashed with strong one-way encryption before storage. All connections are encrypted in transit (TLS). Administrative access to user data is restricted to authorized personnel. No system is perfectly secure — we continuously harden ours and would rather tell you that honestly than promise perfection.',
    ],
  },
  {
    id: 'retention',
    title: '8. Data Retention',
    paras: [
      'Account data is kept while your account is active plus the period required by our MSB obligations and tax law. Transaction records are retained for a minimum of five years as financial regulations require.',
    ],
  },
  {
    id: 'rights',
    title: '9. Your Rights (Access, Export, Deletion)',
    bullets: [
      'Access & export: request a copy of your personal data at any time; we provide it in a machine-readable format within 30 days.',
      'Deletion: request account and data deletion at support@kingdomtradex.com; we process within 30 days, except records we are legally required to keep (transaction logs under MSB rules).',
      'Correction: update name, email, and payout preferences yourself in Settings, or ask us.',
      'EU/UK users: you also hold rectification, restriction, objection, and complaint rights under GDPR; nothing here limits them.',
    ],
  },
  {
    id: 'cookies',
    title: '10. Cookies and Local Storage',
    paras: [
      'Essential cookies and local storage only: session login, theme preference, security. No tracking, advertising, or third-party analytics cookies.',
    ],
  },
  {
    id: 'children',
    title: "11. Children's Privacy",
    paras: [
      'The platform is not intended for anyone under 18. We do not knowingly collect data from minors and will delete it promptly if discovered.',
    ],
  },
  {
    id: 'international',
    title: '12. International Users',
    paras: [
      'Data is processed in the United States. Using the platform means you consent to that transfer and to U.S. law applying to your data.',
    ],
  },
  {
    id: 'changes',
    title: '13. Changes to This Policy',
    paras: [
      'Material updates are announced through the platform and posted with a new "last updated" date.',
    ],
  },
  {
    id: 'contact',
    title: '14. Contact',
    paras: [
      'Privacy questions, access requests, deletion requests: support@kingdomtradex.com. Registered MSB and LLC; state of registration available on request.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="What we collect, what we refuse to collect, and every party your data touches. No dark patterns."
      lastUpdated="September 15, 2026"
      sections={sections}
    />
  );
}
