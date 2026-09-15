import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout, type LegalSection } from '@/components/LegalLayout';
import { Button } from '@/components/design-system/Button';
import { StatusPill } from '@/components/design-system/DataTable';

export const metadata: Metadata = {
  title: 'Trading Agreement & Risk Disclosure | KingdomTradeX',
  description: 'The exact financial mechanics of KingdomTradeX: holding periods, the 50% liquidity provision fee, platform credit, profit math, and referral economics. Read this before you deposit.',
  openGraph: {
    title: 'Trading Agreement & Risk Disclosure | KingdomTradeX',
    description: 'Honest disclosure of how the platform works and what you accept.',
    type: 'website',
  },
  alternates: { canonical: '/trading-agreement' },
};

const sections: LegalSection[] = [
  {
    id: 'nature',
    title: '1. Nature of the Service',
    paras: [
      'KingdomTradeX provides AI-assisted algorithmic trading. When you deposit USDT and select a plan tier, the AI Engine allocates your capital across a diversified basket of cryptocurrencies, U.S. stocks, and commodities, and executes trades autonomously based on market conditions and its risk guardrails.',
      'You do not trade manually, you cannot direct individual trades, and you have no access to the engine\'s internal positions. What you own is a claim on your allocated desk: your principal plus accrued profit, governed by this Agreement.',
    ],
  },
  {
    id: 'risk',
    title: '2. Risk Disclosure — Read This First',
    paras: [
      'Cryptocurrency and equity markets are inherently volatile and speculative. Losses are possible, including the partial or total loss of your deposited principal.',
    ],
    bullets: [
      'The AI operates with drawdown guardrails, but guardrails reduce risk; they do not eliminate it. Black-swan events, exchange outages, and liquidity gaps can and do produce losses.',
      'Published performance figures (for example a 71.4% 30-day win rate) describe the past, not the future. Past performance does not guarantee future results.',
      'Tier rates of 0.25%, 0.50%, and 0.75% per day are targets built into the engine\'s design. They are not promises, not interest, and not a fixed return.',
      'You invest at your own risk, with money you can afford to lose. Nothing here is investment advice.',
    ],
    note: 'If any sentence in this section surprises you, stop here and ask support before depositing.',
  },
  {
    id: 'holding',
    title: '3. Holding Periods and the Liquidity Provision Fee',
    paras: [
      'To keep the engine funded through market cycles, every principal deposit is subject to a holding period: 6 months (Faithful), 9 months (Steward), 12 months (Ambassador), measured from your first deposit.',
      'You may request a principal withdrawal at any time. If your holding period has completed, 100% of your principal returns to you with no fee. If you withdraw before the holding period ends, a 50% Liquidity Provision Fee applies and you receive the remaining 50% plus all of your accrued profit (profit is never penalized).',
    ],
    bullets: [
      'This fee is not a penalty. It is a liquidated damages clause: when you remove capital early, the engine must unwind long-term positions at unfavorable prices, refill the shared liquidity pool that absorbs that imbalance, and re-reserve across the platform\'s wallet structure. The 50% compensates those concrete, measurable costs.',
      'Both sides benefit from the alternative. The platform gets stable capital it can allocate with confidence; you get the higher target daily rates and instant, fee-free profit withdrawals during the hold.',
      'The fee is always disclosed before you confirm a withdrawal, with the exact net amount shown on the request screen. You can walk away at that point and nothing happens.',
      'We estimated the real unwind cost of an early removal at 35–55% of the withdrawn amount. 50% is a reasonable, pre-agreed midpoint rather than a penalty invented after the fact.',
    ],
    note: 'By signing, you expressly agree to this clause. It is the single most important thing on this page.',
  },
  {
    id: 'credit',
    title: '4. Platform Credit',
    paras: [
      'New accounts receive a $50 platform credit once their first deposit lands. It is a promotional tool, not cash: it earns daily profit alongside your principal from day one, but the credit itself can never be withdrawn, transferred, or cashed out.',
      'Only the profit the credit generates is yours to withdraw, and it follows exactly the same rules as your principal\'s profit.',
    ],
  },
  {
    id: 'profit',
    title: '5. Profit Calculation and Withdrawals',
    bullets: [
      'Profit accrues once per day at UTC midnight, calculated as (principal + platform credit) × tier rate, and is credited to your accumulated profit ledger.',
      'Profit withdrawals are automatic: no admin approval, no platform fee. You receive the full requested amount minus only the blockchain network fee shown at confirmation (TRC20 ≈ $1, BEP20 ≈ $0.30, ERC20 ≈ $3–8).',
      'Accrued profit is yours even during the holding period. The hold applies to principal only — never to what you have earned.',
    ],
  },
  {
    id: 'referrals',
    title: '6. Referral Commissions',
    bullets: [
      'One-time first-deposit bonus: 5% for approved Pastors and Creators, 2.5% for regular members, paid from platform revenue on the referred member\'s first deposit.',
      'Lifetime profit share: 0.1% of the referred member\'s daily profit, every day they hold a plan.',
      'Referral earnings unlock after a 7-day anti-fraud hold. Withdrawal requests are reviewed by an admin within 12–24 hours.',
      'As a referred member, you pay nothing extra and your funds are never touched by your referrer\'s commission — the platform funds it.',
    ],
  },
  {
    id: 'acknowledgment',
    title: '7. Your Acknowledgment',
    paras: [
      'By signing this Agreement (in-app), you state that you have read and understood all seven sections above, and specifically that you accept:',
    ],
    bullets: [
      'that trading carries real risk of losing some or all of your principal;',
      'that tier rates are targets, not guarantees;',
      'that the 6/9/12-month holding periods and the 50% Liquidity Provision Fee are terms of your deposit; and',
      'that platform credit is promotional and non-withdrawable.',
    ],
    note: 'This Agreement supplements the Terms of Service and is required before any funds move. Full text: /terms · /privacy · /trading-agreement.',
  },
];

export default function TradingAgreementPage() {
  return (
    <LegalLayout
      title="Trading Agreement & Risk Disclosure"
      description="The exact mechanics of your money on this platform: how profit is calculated, when principal is locked, and what the 50% early-exit fee is and is not."
      lastUpdated="September 15, 2026"
      sections={sections}
      intro={
        <div className="rounded-xl border px-5 py-4" style={{ borderColor: 'color-mix(in srgb, var(--gold) 35%, transparent)', background: 'color-mix(in srgb, var(--gold) 7%, transparent)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone="gold">Required before you transact</StatusPill>
            <p className="text-[13px] text-[var(--muted)]">
              If your account is signed in, your signature lives in your dashboard — the modal there is the binding act.
            </p>
            <Link href="/console" className="ml-auto no-underline">
              <Button variant="secondary" size="sm">Go to my dashboard</Button>
            </Link>
          </div>
        </div>
      }
    />
  );
}
