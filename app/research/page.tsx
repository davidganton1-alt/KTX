import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/design-system/PageHeader';
import { DataCard } from '@/components/design-system/DataCard';
import { Button } from '@/components/design-system/Button';
import { Label, Body, Small } from '@/components/design-system/Typography';

// SWAP THIS WITH THE REAL PUBLIC RESEARCH REPO IN THE FINAL PASS
const RESEARCH_REPO_URL = 'https://github.com/KingdomTradeX/Research';

export const metadata: Metadata = {
  title: 'Research | KingdomTradeX',
  description: 'How the KingdomTradeX AI Engine analyzes markets: signal fusion, forecasting, sizing and guardrails, execution and review. Methodology explained in plain language.',
  openGraph: {
    title: 'Research | KingdomTradeX',
    description: 'How the KingdomTradeX AI Engine analyzes markets.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research | KingdomTradeX',
    description: 'How the KingdomTradeX AI Engine analyzes markets.',
  },
  alternates: { canonical: '/research' },
};

const PIPELINE = [
  { num: '01', title: 'Signal fusion', color: 'var(--gold)', text: 'The engine reads price action, volume, momentum, and volatility across crypto, equities, commodities, and FX at once. No single indicator decides anything — a position only opens when independent signals agree.' },
  { num: '02', title: 'Forecasting', color: 'var(--cyan)', text: 'Fused signals feed short-horizon models that estimate the probability of a move, not the move itself. The engine acts on edges above its threshold and stands aside when none exist — doing nothing is a position too.' },
  { num: '03', title: 'Sizing & guardrails', color: 'var(--purple)', text: 'Every order is capped by portfolio heat, per-asset limits, and drawdown brakes. When the book loses more than the daily guardrail allows, the engine cuts risk automatically — before it compounds.' },
  { num: '04', title: 'Execution & review', color: 'var(--profit)', text: 'Orders route through liquid venues with slippage limits. After each close, the trade is scored against its thesis, and the engine\'s parameters adjust on evidence, not optimism.' },
];

export default function ResearchPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1180px] px-6 py-12 lg:py-16">
        <PageHeader
          crumbs={['Platform', 'Research']}
          title="Research"
          description="How the AI Engine decides what to trade — in plain language, with no marketing gloss."
        />

        {/* ── what we publish ── */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <DataCard title="Open methodology">
            <Body className="leading-[1.65] text-[var(--muted)]">
              Our non-sensitive research and market analysis are published openly, so you can evaluate how the engine thinks before you commit capital.
            </Body>
          </DataCard>
          <DataCard title="Honest limits">
            <Body className="leading-[1.65] text-[var(--muted)]">
              We publish what the engine does and what it cannot do. Guardrails reduce losses; they do not eliminate them. Rates are targets, never promises.
            </Body>
          </DataCard>
          <DataCard title="Reviewed continuously">
            <Body className="leading-[1.65] text-[var(--muted)]">
              Every closed trade is scored against its thesis. Parameters change on evidence, and material model changes are announced to members.
            </Body>
          </DataCard>
        </div>

        {/* ── pipeline ── */}
        <div className="mt-12">
          <Label>Inside the engine</Label>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            {PIPELINE.map((s) => (
              <DataCard key={s.num} title={`${s.num} · ${s.title}`}>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <Body className="leading-[1.65] text-[var(--muted)]">{s.text}</Body>
                </div>
              </DataCard>
            ))}
          </div>
        </div>

        {/* ── audit cta ── */}
        <div className="mt-12">
          <DataCard title="Audit our research" subtitle="Trust requires transparency">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-xl text-[14px] leading-[1.6] text-[var(--muted)]">
                Read the published methodology and market analyses on our open research repository.
              </p>
              <a href={RESEARCH_REPO_URL} target="_blank" rel="noopener noreferrer" className="no-underline">
                <Button variant="secondary">View research repository</Button>
              </a>
            </div>
          </DataCard>
        </div>

        <Small className="mt-6">
          Research material is educational, not investment advice. See the <Link href="/trading-agreement" className="text-[var(--gold)] hover:underline">Trading Agreement &amp; Risk Disclosure</Link>.
        </Small>
      </div>
    </main>
  );
}
