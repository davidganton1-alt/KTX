import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/design-system/PageHeader';
import { DataCard } from '@/components/design-system/DataCard';
import { StatCard } from '@/components/design-system/StatCard';
import { Button } from '@/components/design-system/Button';
import { Label, Num, Body, Small } from '@/components/design-system/Typography';
import { Reveal } from '@/components/Reveal';
import { FAQS } from '@/lib/faqs';

export const metadata: Metadata = {
  title: 'Plans & Tiers | KingdomTradeX',
  description: 'Choose your path of faithful stewardship. Faithful, Steward, and Ambassador tiers with clear daily profit targets and transparent holding periods.',
  openGraph: {
    title: 'Plans & Tiers | KingdomTradeX',
    description: 'Choose your path of faithful stewardship. Faithful, Steward, and Ambassador tiers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plans & Tiers | KingdomTradeX',
    description: 'Choose your path of faithful stewardship.',
  },
  alternates: { canonical: '/plans' },
};

const lineup = [
  {
    name: 'Faithful', rate: '0.25%', min: '$100 – $999', hold: '6-month hold', hl: false,
    bullets: ['Crypto, US stocks & commodities', 'Starter AI desk', 'Daily profit, withdraw anytime'],
    verse: 'Be faithful with the little things. Luke 16:10',
  },
  {
    name: 'Steward', rate: '0.50%', min: '$1,000 – $4,999', hold: '9-month hold', hl: true,
    bullets: ['All markets unlocked', 'Advanced AI + priority rebalancing', 'Profit-only withdrawals'],
    verse: 'Stewards of the manifold grace of God. 1 Peter 4:10',
  },
  {
    name: 'Ambassador', rate: '0.75%', min: '$5,000 – $15,000', hold: '12-month hold', hl: false,
    bullets: ['Elite AI desk', 'Dedicated risk guardrails', 'Largest daily target'],
    verse: 'Honour the Lord with your wealth. Proverbs 3:9',
  },
];

const groups = [
  {
    name: 'The seed',
    rows: [
      { id: 's1', label: 'Deposit range', a: '$100 – $999', b: '$1,000 – $4,999', c: '$5,000 – $15,000' },
      { id: 's2', label: 'Hold period', a: '6 months', b: '9 months', c: '12 months' },
      { id: 's3', label: 'Early deposit withdrawal', a: '50% fee', b: '50% fee', c: '50% fee' },
    ],
  },
  {
    name: 'The engine',
    rows: [
      { id: 'e1', label: 'AI desk', a: 'Starter AI', b: 'Advanced AI', c: 'Elite AI desk' },
      { id: 'e2', label: 'Markets', a: 'Crypto · Stocks · Commodities', b: 'All markets', c: 'All markets' },
      { id: 'e3', label: 'Rebalancing', a: 'Daily', b: 'Priority', c: 'Dedicated' },
      { id: 'e4', label: 'Risk guardrails', a: 'Standard', b: 'Advanced', c: 'Dedicated' },
    ],
  },
  {
    name: 'The harvest',
    rows: [
      { id: 'h1', label: 'Target daily profit', a: '0.25%', b: '0.50%', c: '0.75%' },
      { id: 'h2', label: 'Profit withdrawals', a: 'Anytime', b: 'Anytime', c: 'Anytime' },
      { id: 'h3', label: 'Trade transparency', a: 'Full ledger', b: 'Full ledger', c: 'Full ledger' },
    ],
  },
];

const holdChapters = [
  { n: 'I', t: 'Planted', d: 'Day zero. Your seed goes into the soil. The AI desk opens and begins trading with guardrails on.' },
  { n: 'II', t: 'Harvest daily', d: 'Every day, profit accrues and is withdrawable. The hold never touches your harvest, only the seed.' },
  { n: 'III', t: 'Released', d: 'When the hold ends, your full deposit unlocks. Withdraw everything: no fee, no friction.' },
];

// Static markup (server page): DataTable's render fns can't cross the
// server/client boundary, and a 10-row comparison needs no interactivity.
function TierTable({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {['Feature', 'Faithful', 'Steward', 'Ambassador'].map((h, i) => (
              <th key={h} className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)] ${i > 0 ? 'text-center' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} className={idx % 2 === 1 ? 'bg-[var(--card)]/30' : ''}>
              <td className="px-4 py-2.5 text-[14px] font-medium text-[var(--fg)]">{row.label}</td>
              <td className="px-4 py-2.5 text-center text-[14px] text-[var(--muted)]">{row.a}</td>
              <td className="px-4 py-2.5 text-center text-[14px] font-medium text-[var(--fg)]">{row.b}</td>
              <td className="px-4 py-2.5 text-center text-[14px] text-[var(--muted)]">{row.c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlansPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1180px] px-6 py-12 lg:py-16">
        <PageHeader
          crumbs={['Platform', 'Plans']}
          title="How much will you plant?"
          description="Same AI. Same honesty. Three sizes of seed, each with its own daily target and harvest rhythm."
          actions={
            <Link href="/register" className="no-underline"><Button>Start with $50 free</Button></Link>
          }
        />

        {/* ── tier pillars ── */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {lineup.map((p, i) => (
            <Reveal key={p.name} variant="up" index={i}>
              <div className={`relative flex h-full flex-col rounded-2xl p-6 ds-card ${p.hl ? 'border border-[var(--gold)]/50' : ''}`}>
                {p.hl && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#0a0e27]">Most chosen</span>}
                <Label>{p.name}</Label>
                <div className="mt-3"><Num size="hero" className={p.hl ? 'text-[var(--gold)]' : ''}>{p.rate}</Num><span className="ml-2 text-[12px] text-[var(--muted)]">target / day</span></div>
                <p className="mt-2 text-[13px] text-[var(--muted)]">{p.min}</p>
                <p className="mt-1 text-[12px] text-[var(--muted)]">{p.hold} · 50% early exit fee</p>
                <ul className="mt-5 flex-1 space-y-2">
                  {p.bullets.map((b) => <li key={b} className="flex gap-2.5 text-[13px] leading-[1.5] text-[var(--muted)]"><span className="text-[var(--gold)]">✦</span>{b}</li>)}
                </ul>
                <p className="mt-5 border-t border-[var(--border)] pt-4 text-[12px] italic leading-[1.5] text-[var(--gold)]">{p.verse}</p>
                <Link href="/register" className="mt-4 no-underline"><Button variant={p.hl ? 'primary' : 'secondary'} size="sm" className="w-full">Start with {p.name}</Button></Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── quick mechanics ── */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Profit rate basis" value={<Num size="inline">(principal + credit) × tier rate</Num>} context="Accrued daily at 00:00 UTC" tone="default" />
          <StatCard label="Profit withdrawals" value={<Num size="inline">Anytime, free</Num>} context="Network gas fee only, shown upfront" tone="profit" />
          <StatCard label="Early principal exit" value={<Num size="inline">50% LP fee</Num>} context="A liquidity provision term, not a penalty" tone="warning" />
        </div>

        {/* ── comparison ── */}
        <section className="mt-16 scroll-mt-24" id="compare">
          <Label>Feature comparison</Label>
          <div className="mt-1 text-[24px] font-semibold leading-tight text-[var(--fg)]">Same AI, three paths</div>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-[var(--muted)]">
            Every plan runs on the same honest engine. Here is exactly what you get at each tier.
          </p>
          <div className="mt-6 space-y-5">
            {groups.map((g) => (
              <DataCard key={g.name} title={g.name}>
                <TierTable rows={g.rows} />
              </DataCard>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-5">
            <p className="text-[14px] leading-[1.6] text-[var(--muted)]">
              <span className="font-medium text-[var(--gold)]">Full honesty:</span> withdrawing your deposit before the hold ends carries a 50% Liquidity Provision Fee — early exits force the engine to unwind positions at unfavorable prices. Your daily profit is <span className="font-medium text-[var(--fg)]">never</span> affected. Read the legal justification in the <Link href="/trading-agreement" className="text-[var(--gold)] hover:underline">Trading Agreement</Link>.
            </p>
          </div>
        </section>

        {/* ── verse (calm) ── */}
        <section className="mt-16 text-center">
          <p className="mx-auto max-w-xl text-[16px] italic leading-[1.6] text-[var(--fg)]">
            "Honour the Lord with your wealth, with the firstfruits of all your crops."
          </p>
          <Small className="mt-2">Proverbs 3:9</Small>
        </section>

        {/* ── the hold in three chapters ── */}
        <section className="mt-16">
          <Label>The hold, explained honestly</Label>
          <div className="mt-1 text-[20px] font-medium text-[var(--fg)]">Planted seed, patient harvest</div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {holdChapters.map((c, i) => (
              <Reveal key={c.n} variant="up" index={i}>
                <DataCard title={c.t} subtitle={`Chapter ${c.n}`}>
                  <Body className="leading-[1.6] text-[var(--muted)]">{c.d}</Body>
                </DataCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── faq teaser ── */}
        <Reveal as="section" variant="up" className="mt-16">
          <div className="text-center">
            <Label>Plan questions</Label>
            <div className="mt-1 text-[20px] font-medium text-[var(--fg)]">Before you plant</div>
          </div>
          <div className="mx-auto mt-6 max-w-3xl space-y-2.5">
            {FAQS.slice(0, 3).map((f, i) => (
              <details key={i} className="group ds-card rounded-xl p-4 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between gap-4 text-[14px] font-medium text-[var(--fg)]">{f.q}<span className="text-[var(--gold)] transition group-open:rotate-45">+</span></summary>
                <p className="mt-2.5 text-[14px] leading-[1.6] text-[var(--muted)]">{f.a}</p>
              </details>
            ))}
            <p className="pt-1 text-center text-[13px] text-[var(--muted)]">
              <a href="/help-center" className="text-[var(--gold)] hover:underline">See all questions</a>
            </p>
          </div>
        </Reveal>

        {/* ── CTA ── */}
        <Reveal as="section" variant="up" className="mt-16 pb-8 text-center">
          <div className="ds-card mx-auto max-w-2xl rounded-2xl p-10">
            <div className="text-[24px] font-semibold leading-tight text-[var(--fg)]">Choose your seed. Begin the harvest.</div>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-[1.6] text-[var(--muted)]">Start with your free $50 credit, then plant when you're ready.</p>
            <Link href="/register" className="mt-6 inline-flex no-underline"><Button>Get $50 free</Button></Link>
            <p className="mt-6 text-[11px] leading-[1.6] text-[var(--muted)]">
              Rates are design targets, not guarantees or interest. Trading involves risk. See the <Link href="/trading-agreement" className="text-[var(--gold)] hover:underline">Trading Agreement &amp; Risk Disclosure</Link>.
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
