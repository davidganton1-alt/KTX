'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/design-system/PageHeader';
import { DataCard } from '@/components/design-system/DataCard';
import { StatCard } from '@/components/design-system/StatCard';
import { DataTable, StatusPill } from '@/components/design-system/DataTable';
import { Button } from '@/components/design-system/Button';
import { Label, Num, Small, Body } from '@/components/design-system/Typography';

type Asset = {
  id: string; symbol: string; name: string; class: string;
  price: number; change24h: number | null; marketCap: number | null; image?: string;
};

// One snapshot on load; no polling, no ticker, no decorative animation.
function fmt(p: number) {
  return p.toLocaleString('en-US', {
    minimumFractionDigits: p >= 1000 ? 0 : 2,
    maximumFractionDigits: p >= 1000 ? 0 : 2,
  });
}

const UNIVERSE = [
  {
    id: 'crypto',
    name: 'Crypto',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    tickers: 'BTC · ETH · SOL · USDC',
    text: 'Digital assets trade around the clock, so the engine has no closed hours — it reacts to liquidity and momentum 24/7. Volatility here is the highest on the desk, which is exactly why position sizes stay small and guardrails tight.',
  },
  {
    id: 'equities',
    name: 'US Stocks',
    icon: 'M3 3v18h18M8 17V9m4 8V5m4 12v-6',
    tickers: 'AAPL · MSFT · NVDA · TSLA',
    text: 'Blue-chip US equities anchor the book during market hours — the steady half of the strategy. The engine mirrors broad market movements and holds no concentrated positions in any single name.',
  },
  {
    id: 'commodities',
    name: 'Commodities',
    icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 5v8',
    tickers: 'Gold · Silver · Oil · Wheat',
    text: 'Physical markets — gold, silver, energy, and grain — provide an inflation hedge alongside the digital book. They are the oldest stores of value there are, and they keep the portfolio honest.',
  },
  {
    id: 'forex',
    name: 'Forex',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c2.5 2.8 4 6.3 4 10s-1.5 7.2-4 10m0-20c-2.5 2.8-4 6.3-4 10s1.5 7.2 4 10M2 12h20',
    tickers: 'EURUSD · USDJPY · GBPUSD',
    text: 'Major currency pairs add depth when equities and crypto move sideways. The engine trades only liquid majors — no exotic crosses, no overnight leverage games.',
  },
];

export function MarketsBoard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [live, setLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [snapError, setSnapError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/markets', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
      .then((data) => {
        if (cancelled) return;
        setAssets(Array.isArray(data.assets) ? data.assets : []);
        setLive(true);
        setUpdatedAt(new Date());
      })
      .catch(() => {
        if (!cancelled) setSnapError(true);
      });
    return () => { cancelled = true; };
  }, []);

  const byClass = useMemo(() => {
    const m: Record<string, Asset[]> = {};
    for (const a of assets) (m[a.class] ??= []).push(a);
    return m;
  }, [assets]);

  const avg = assets.length
    ? assets.reduce((s, a) => s + (a.change24h ?? 0), 0) / assets.length
    : 0;
  const gainers = assets.filter((a) => (a.change24h ?? 0) >= 0).length;
  const decliners = assets.length - gainers;

  const rows = assets.map((a) => ({
    id: a.id,
    symbol: a.symbol,
    name: a.name,
    cls: a.class,
    price: a.price,
    change: a.change24h,
    cap: a.marketCap,
  }));

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1180px] px-6 py-12 lg:py-16">
        <PageHeader
          crumbs={['Platform', 'Markets']}
          title="Markets"
          description="A calm overview of what the AI Engine trades and how the book is currently positioned. Prices are a single snapshot on load, not a live feed."
          actions={
            <>
              <Link href="/plans" className="no-underline"><Button variant="secondary" size="sm">Compare tiers</Button></Link>
              <Link href="/console" className="no-underline"><Button size="sm">Open dashboard</Button></Link>
            </>
          }
        />

        {/* ── snapshot stats ── */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Assets tracked" value={<Num>{assets.length || '—'}</Num>} context={live ? 'Snapshot loaded from market feed' : 'Snapshot unavailable'} tone="default" />
          <StatCard label="Average 24h move" value={<Num>{assets.length ? `${avg >= 0 ? '+' : ''}${avg.toFixed(2)}%` : '—'}</Num>} context="Across the whole book" tone={avg >= 0 ? 'profit' : 'error'} />
          <StatCard label="Advancing / declining" value={<Num>{assets.length ? `${gainers} / ${decliners}` : '—'}</Num>} context="24h direction" tone="default" />
          <StatCard label="Snapshot taken" value={<Num size="inline">{updatedAt ? updatedAt.toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—'}</Num>} context="Refresh the page for the latest" tone="gold" />
        </div>

        {/* ── asset class universe ── */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {UNIVERSE.map((u) => (
            <DataCard key={u.id} title={u.name} subtitle={u.tickers}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10">
                  <svg className="h-4 w-4 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={u.icon} />
                  </svg>
                </span>
                <Body className="text-[var(--muted)] leading-[1.65]">{u.text}</Body>
              </div>
            </DataCard>
          ))}
        </div>

        {/* ── snapshot table ── */}
        <div className="mt-12">
          <DataCard
            title="Current snapshot"
            subtitle={live ? 'Prices at page load' : snapError ? 'Market data unavailable right now' : 'Loading…'}
          >
            {assets.length > 0 ? (
              <DataTable
                keyField="id"
                pageSize={12}
                rows={rows}
                columns={[
                  { key: 'symbol', header: 'Symbol', render: (r: any) => <span className="text-[14px] font-medium text-[var(--fg)]">{r.symbol}</span> },
                  { key: 'name', header: 'Asset', render: (r: any) => <span className="text-[14px] text-[var(--muted)]">{r.name}</span> },
                  { key: 'cls', header: 'Class', render: (r: any) => <StatusPill tone={r.cls === 'Crypto' ? 'gold' : r.cls === 'US Stocks' ? 'cyan' : 'muted'}>{r.cls}</StatusPill> },
                  { key: 'price', header: 'Price', align: 'right' as const, render: (r: any) => <Num size="inline">${fmt(r.price)}</Num> },
                  { key: 'change', header: '24h', align: 'right' as const, render: (r: any) => (
                    <Num size="inline" className={r.change == null ? 'text-[var(--muted)]' : r.change >= 0 ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>
                      {r.change == null ? '—' : `${r.change >= 0 ? '+' : ''}${r.change.toFixed(2)}%`}
                    </Num>
                  ) },
                  { key: 'cap', header: 'Mkt cap', align: 'right' as const, render: (r: any) => (
                    <span className="text-[13px] text-[var(--muted)]">{r.cap == null ? '—' : r.cap >= 1e12 ? `$${(r.cap / 1e12).toFixed(2)}T` : r.cap >= 1e9 ? `$${(r.cap / 1e9).toFixed(1)}B` : `$${(r.cap / 1e6).toFixed(1)}M`}</span>
                  ) },
                ]}
              />
            ) : (
              <Small>{snapError ? 'We could not reach the market feed just now. The overview above is unaffected — refresh to try again.' : 'Loading snapshot…'}</Small>
            )}
          </DataCard>
        </div>

        {/* ── the honest note ── */}
        <div className="mt-10 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-5">
          <Label className="text-[var(--gold)]">Why this page doesn't move</Label>
          <p className="mt-2 text-[14px] leading-[1.6] text-[var(--fg)]">
            The AI Engine trades these markets autonomously. You don't need to watch them — your dashboard shows your results.
          </p>
        </div>
        <Small className="mt-3">
          Figures are indicative snapshots from public market data, shown for context only. They are not signals, advice, or guarantees. See the <Link href="/trading-agreement" className="text-[var(--gold)] hover:underline">Trading Agreement &amp; Risk Disclosure</Link>.
        </Small>
      </div>
    </main>
  );
}
