import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { Verse } from '@/components/Verse';
import { DataCard } from '@/components/design-system/DataCard';
import { StatCard } from '@/components/design-system/StatCard';
import { Button } from '@/components/design-system/Button';
import { Label, Num, Small, Body } from '@/components/design-system/Typography';
import { FAQS } from '@/lib/faqs';

export const metadata: Metadata = {
  title: 'KingdomTradeX: Faith-Driven AI Trading',
  description: 'KingdomTradeX pairs disciplined algorithmic trading with biblical stewardship. Trade crypto, US stocks, and commodities with AI precision. Join the faithful.',
  openGraph: {
    title: 'KingdomTradeX: Faith-Driven AI Trading',
    description: 'KingdomTradeX pairs disciplined algorithmic trading with biblical stewardship. Trade crypto, US stocks, and commodities with AI precision.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KingdomTradeX: Faith-Driven AI Trading',
    description: 'KingdomTradeX pairs disciplined algorithmic trading with biblical stewardship.',
  },
  alternates: {
    canonical: '/',
  },
};

const steps = [
  { num: '01', title: 'Claim your $50 gift', body: 'Every new account starts with a free $50 trading credit. No deposit is needed to begin. Watch the AI work before you commit a single dollar of your own capital.', bullets: ['Free $50 trading credit', 'No deposit required', 'Full platform access', 'Real-time AI demonstration'] },
  { num: '02', title: 'Choose a plan', body: 'Pick Faithful, Steward or Ambassador. Your deposit opens the AI desk and sets your daily profit rate. Each tier unlocks different holding periods and withdrawal flexibility.', bullets: ['Three flexible tiers', 'Daily profit targets', 'Clear holding periods', 'Upgrade anytime'] },
  { num: '03', title: 'The AI trades for you', body: 'Our models work around the clock across crypto, US stocks and commodities, with strict risk guardrails. Every trade follows predefined entry and exit rules, removing emotional decision-making.', bullets: ['24/7 automated trading', 'Multi-asset coverage', 'Risk-first approach', 'Transparent position tracking'] },
  { num: '04', title: 'Watch profit grow', body: 'Profit accrues daily and is shown in plain sight. Withdraw your profit whenever you like; early principal exit follows the agreed terms. Full visibility into every position the AI opens and closes.', bullets: ['Daily profit accrual', 'Instant profit withdrawal', 'Complete trade history', 'Real-time P&L dashboard'] },
];

const tiers = [
  { name: 'Faithful', min: '$100 to $999', rate: '0.25% / day', perk: 'Crypto, US stocks and commodities. Starter AI, daily profit, profit-only withdrawals.', verse: 'Be faithful with the little things, and you will be trusted with much. Luke 16:10', hold: '6-month hold, 50% early exit fee', highlight: false },
  { name: 'Steward', min: '$1,000 to $4,999', rate: '0.50% / day', perk: 'Advanced AI across all markets, priority rebalancing, 0.50% target daily.', verse: 'Stewards of the manifold grace of God. 1 Peter 4:10', hold: '9-month hold, 50% early exit fee', highlight: true },
  { name: 'Ambassador', min: '$5,000 to $15,000', rate: '0.75% / day', perk: 'Elite AI desk, dedicated risk guardrails across all markets, 0.75% target daily.', verse: 'Honour the Lord with your wealth, with the firstfruits of all your crops. Proverbs 3:9', hold: '12-month hold, 50% early exit fee', highlight: false },
];

const values = [
  { k: 'Stewardship', v: 'Capital is a trust. The AI protects your principal and grows it with care.' },
  { k: 'Clarity', v: 'Every day\'s profit is shown. You withdraw profit, and your deposit keeps working.' },
  { k: 'Integrity', v: 'No hype, no locks on your earnings. Daily profit withdrawals, by design.' },
];

const techFeatures = [
  { k: 'Live signal engine', v: 'Streams price, volume, order-flow and on-chain data across crypto, US stocks and commodities every second.' },
  { k: 'Deep forecasting', v: 'LSTM and GRU sequence models read the shape of the market; a Kalman filter keeps volatility estimates honest.' },
  { k: 'Self-learning execution', v: 'Reinforcement learning picks entry and exit timing, refining itself trade by trade without human emotion.' },
  { k: 'Risk-parity sizing', v: 'Position size is set against a drawdown guard so no single move can undo your plan.' },
  { k: 'Full transparency', v: 'Every open and closed trade shows entry, exit, P&L and hold time. Nothing happens in a black box.' },
  { k: 'Round-the-clock guard', v: 'The engine and its monitors run continuously, cutting risk the moment limits are reached.' },
];

const pipeline = [
  'Signal fusion across price, volume, on-chain and news flow.',
  'Forecasting with LSTM / GRU sequence models and a Kalman volatility filter.',
  'Risk-parity sizing with drawdown guards before any entry.',
  'Execution timed by reinforcement learning, then monitored to close or cut.',
];

const oldWay = ['Gambling on hype at 2 a.m.', 'Fees quietly eating your gains', 'Fear making every decision', 'Black-box platforms, no answers'];
const newWay = ['AI discipline with guardrails on', 'Profit-only withdrawals, any day', 'A transparent ledger you can read', 'Peace of mind: stewardship, not speculation'];

const voices = [
  { q: 'I withdrew my first profit on day two. It felt like manna: small, daily, and faithful.', n: 'Grace M.', c: 'Lagos' },
  { q: 'The transparency changed how our whole fellowship thinks about stewardship.', n: 'Pastor Daniel', c: 'Nairobi' },
  { q: 'No hype. Just daily growth and peace of mind while I run my business.', n: 'Sarah K.', c: 'Manila' },
];

const shepherds = [
  { name: 'Pastor Daniel', city: 'Nairobi', img: '/avatars/daniel.jpg' },
  { name: 'Pastor David', city: 'Lagos', img: '/avatars/david.jpg' },
  { name: 'Grace M.', city: 'Lagos', img: '/avatars/grace.jpg' },
  { name: 'James O.', city: 'London', img: '/avatars/james.jpg' },
  { name: 'Miriam A.', city: 'Accra', img: '/avatars/miriam.jpg' },
  { name: 'Ruth P.', city: 'Manila', img: '/avatars/ruth.jpg' },
  { name: 'Samuel T.', city: 'Houston', img: '/avatars/samuel.jpg' },
];

const trustPoints = [
  'Drawdown guardrails cap the size of every position',
  'Kalman-filtered volatility keeps risk estimates honest',
  'A full ledger of every trade, open for you to read',
  'Profit-only withdrawals, by design, not by promise',
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1180px] px-6 py-12 lg:py-16">

        {/* ── HERO (static, calm) ── */}
        <div className="mx-auto max-w-3xl pt-8 text-center lg:pt-16">
          <Label className="text-[var(--gold)]">Faith-aligned AI trading · Live 24/7</Label>
          <div className="mt-3 text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--fg)]">
            Fund it. The AI trades.
            <br />
            You withdraw the <span className="text-[var(--gold)]">profit.</span>
          </div>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.6] text-[var(--muted)]">
            Disciplined algorithmic trading across crypto, US stocks, commodities and forex —
            paired with honest scales, transparent ledgers, and daily profit you can actually withdraw.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="no-underline"><Button>Get $50 free</Button></Link>
            <Link href="/#how" className="no-underline"><Button variant="secondary">How it works</Button></Link>
          </div>
          <p className="mt-5 text-[12px] text-[var(--muted)]">
            Crypto · Stocks · Commodities — Daily profit, withdraw anytime — No hidden fees
          </p>
        </div>

        {/* ── MECHANICS BAND (factual only) ── */}
        <div className="grid gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Assets tracked" value={<Num>25+</Num>} context="Crypto, US stocks, commodities, FX" tone="default" />
          <StatCard label="Profit accrual" value={<Num>Daily · 00:00 UTC</Num>} context="Calculated on principal + credit" tone="gold" />
          <StatCard label="Profit withdrawal" value={<Num>Anytime</Num>} context="Automatic, no approval needed" tone="profit" />
          <StatCard label="Support" value={<Num>12–24h</Num>} context="Real people, every day" tone="default" />
        </div>

        {/* ── GIFT BANNER ── */}
        <Reveal as="section" variant="up" className="mt-14">
          <DataCard title="New member gift" subtitle="Every sign-up receives $50 to begin">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Body className="max-w-xl text-[var(--muted)] leading-[1.6]">
                The AI trades it like any other balance. Fund a plan and your whole balance starts compounding.
              </Body>
              <Link href="/register" className="no-underline"><Button size="sm">Claim my $50</Button></Link>
            </div>
          </DataCard>
        </Reveal>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="mt-20 scroll-mt-24">
          <div className="text-center">
            <Label>How it works</Label>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--fg)]">
              Your journey to faithful stewardship
            </div>
            <p className="mx-auto mt-2 max-w-xl text-[14px] leading-[1.6] text-[var(--muted)]">
              Four simple steps from first gift to daily profit. Built on transparency, powered by discipline.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {steps.map((s, i) => (
              <Reveal key={s.num} variant="up" index={i}>
                <DataCard title={s.title} subtitle={`Step ${s.num}`}>
                  <Body className="leading-[1.65] text-[var(--muted)]">{s.body}</Body>
                  <ul className="mt-4 space-y-1.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5 text-[13px] text-[var(--muted)]">
                        <span className="text-[var(--gold)]">✦</span>{b}
                      </li>
                    ))}
                  </ul>
                </DataCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="mt-20">
          <div className="text-center">
            <Label>What we stand on</Label>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--fg)]">Our promise</div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.k} variant="up" index={i}>
                <DataCard title={v.k}>
                  <Body className="leading-[1.6] text-[var(--muted)]">{v.v}</Body>
                </DataCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── ENGINE ── */}
        <section className="mt-20">
          <div className="text-center">
            <Label>The engine under the hood</Label>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--fg)]">Built like a trading desk</div>
          </div>
          <ol className="mt-8 grid gap-3">
            {pipeline.map((p, i) => (
              <Reveal key={i} variant="up" index={i} as="li" className="ds-card rounded-xl p-4 text-[14px] leading-[1.6] text-[var(--muted)]">
                <span className="font-medium text-[var(--gold)]">{i + 1}.</span> {p}
              </Reveal>
            ))}
          </ol>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {techFeatures.map((t, i) => (
              <Reveal key={t.k} variant="up" index={i}>
                <DataCard title={t.k}>
                  <Body className="leading-[1.6] text-[var(--muted)]">{t.v}</Body>
                </DataCard>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/research" className="no-underline"><Button variant="secondary" size="sm">Read the research</Button></Link>
          </div>
        </section>

        {/* ── WITHDRAWAL MECHANICS ── */}
        <section className="mt-20">
          <DataCard title="How your money moves" subtitle="Daily accrual, daily access">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { t: 'Daily accrual', v: 'Profit appears in your wallet every single day, visible in plain sight.' },
                { t: 'Withdraw profit anytime', v: 'One tap. Your earnings are never locked, never gated.' },
                { t: 'Principal keeps working', v: 'Your seed stays planted, compounding while you live on the harvest.' },
              ].map((w) => (
                <div key={w.t}>
                  <div className="text-[14px] font-medium text-[var(--fg)]">{w.t}</div>
                  <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--muted)]">{w.v}</p>
                </div>
              ))}
            </div>
          </DataCard>
        </section>

        {/* ── SPECULATION VS STEWARDSHIP ── */}
        <section className="mt-20">
          <div className="text-center">
            <Label>The difference</Label>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--fg)]">Speculation vs stewardship</div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <DataCard title="The old way">
              <ul className="space-y-2 text-[14px] text-[var(--muted)]">
                {oldWay.map((o) => <li key={o} className="flex gap-2.5"><span className="text-[var(--loss)]">✕</span>{o}</li>)}
              </ul>
            </DataCard>
            <DataCard title="The Kingdom way">
              <ul className="space-y-2 text-[14px] text-[var(--fg)]">
                {newWay.map((o) => <li key={o} className="flex gap-2.5"><span className="text-[var(--gold)]">✦</span>{o}</li>)}
              </ul>
            </DataCard>
          </div>
        </section>

        {/* ── TRUST BAND ── */}
        <section className="mt-20">
          <DataCard title="Your principal, protected" subtitle="Guarded like a trust">
            <ul className="space-y-2.5 text-[14px] leading-[1.6] text-[var(--muted)]">
              {trustPoints.map((t) => <li key={t} className="flex gap-2.5"><span className="text-[var(--profit)]">✦</span>{t}</li>)}
            </ul>
          </DataCard>
        </section>

        {/* ── VOICES ── */}
        <section className="mt-20">
          <div className="text-center">
            <Label>Voices from the flock</Label>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--fg)]">Walked in faith</div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {voices.map((v, i) => (
              <Reveal key={v.n} variant="up" index={i}>
                <DataCard>
                  <Body className="leading-[1.6]">"{v.q}"</Body>
                  <Small className="mt-3">{v.n} · {v.c}</Small>
                </DataCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── SHEPHERDS ── */}
        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Label>The flock</Label>
              <div className="mt-1 text-[20px] font-medium text-[var(--fg)]">Shepherds on the platform</div>
            </div>
            <Link href="/become-pastor" className="no-underline"><Button variant="secondary" size="sm">List your ministry</Button></Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shepherds.map((s) => (
              <div key={s.name} className="ds-card rounded-xl p-4 text-center">
                <img src={s.img} alt={s.name} className="mx-auto h-12 w-12 rounded-full border border-[var(--border)] object-cover" />
                <p className="mt-2 text-[13px] font-medium text-[var(--fg)]">{s.name}</p>
                <p className="text-[11px] text-[var(--muted)]">{s.city}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TIERS ── */}
        <Reveal as="section" variant="up" id="tiers" className="mt-20 scroll-mt-24">
          <div className="text-center">
            <Label>Plans</Label>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--fg)]">Three ways to grow</div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {tiers.map((t) => (
              <div key={t.name} className="relative flex flex-col rounded-2xl border border-[var(--border)] p-6 ds-card">
                {t.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#0a0e27]">Most chosen</span>}
                <h3 className="text-[16px] font-medium text-[var(--fg)]">{t.name}</h3>
                <p className="mt-1 text-[12px] text-[var(--muted)]">From {t.min}</p>
                <div className="mt-4"><Num size="hero" className="text-[var(--gold)]">{t.rate}</Num></div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">target daily profit</p>
                <p className="mt-3 flex-1 text-[13px] leading-[1.6] text-[var(--muted)]">{t.perk}</p>
                <p className="mt-3 text-[12px] text-[var(--muted)]">{t.hold}</p>
                <p className="mt-3 border-t border-[var(--border)] pt-3 text-[12px] italic leading-[1.5] text-[var(--gold)]">{t.verse}</p>
                <Link href="/plans" className="mt-4 no-underline"><Button variant={t.highlight ? 'primary' : 'secondary'} size="sm" className="w-full">See {t.name} details</Button></Link>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── FAQ ── */}
        <Reveal as="section" variant="up" className="mt-20">
          <div className="text-center">
            <Label>Answers</Label>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--fg)]">Common questions</div>
          </div>
          <div className="mx-auto mt-8 max-w-3xl space-y-2.5">
            {FAQS.slice(0, 5).map((f, i) => (
              <details key={i} className="group ds-card rounded-xl p-4 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between gap-4 text-[14px] font-medium text-[var(--fg)]">
                  {f.q}<span className="text-[var(--gold)] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2.5 text-[14px] leading-[1.6] text-[var(--muted)]">{f.a}</p>
              </details>
            ))}
            <p className="pt-2 text-center text-[13px] text-[var(--muted)]">
              More in the <Link href="/help-center" className="text-[var(--gold)] hover:underline">Help Center</Link>.
            </p>
          </div>
        </Reveal>

        {/* ── VERSE + CTA ── */}
        <section className="mt-20">
          <Verse variant="today" className="text-center" />
        </section>

        <Reveal as="section" variant="up" className="mt-16 pb-8 text-center">
          <div className="ds-card mx-auto max-w-2xl rounded-2xl p-10">
            <div className="text-[24px] font-semibold leading-tight text-[var(--fg)]">
              Plant with intention. Harvest with peace.
            </div>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-[1.6] text-[var(--muted)]">
              Claim your $50 credit and let the AI trade with wisdom. Withdraw your profit each day.
            </p>
            <Link href="/register" className="mt-6 inline-flex no-underline"><Button>Get $50 free</Button></Link>
            <p className="mt-6 text-[11px] leading-[1.6] text-[var(--muted)]">
              Trading involves risk, including possible loss of principal. Daily rates are design targets, not guarantees.
              See the <Link href="/trading-agreement" className="text-[var(--gold)] hover:underline">Trading Agreement &amp; Risk Disclosure</Link>.
            </p>
          </div>
        </Reveal>

      </div>
    </main>
  );
}
