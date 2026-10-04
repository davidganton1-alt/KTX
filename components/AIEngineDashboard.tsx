'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { DataCard } from '@/components/design-system/DataCard';
import { StatCard } from '@/components/design-system/StatCard';
import { AIEngineOrbit, type OrbitPosition } from './AIEngineOrbit';

const ASSET_COLORS: Record<string, string> = {
  crypto: '#c084fc',
  stocks: '#60a5fa',
  commodities: '#fbbf24',
  forex: '#34d399',
};

type Trade = {
  id: string;
  time: string;
  symbol: string;
  assetClass: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  pnl: number;
};

type OrderBookRow = { price: number; qty: number; total: number };
type OrderBookData = { base: number; asks: OrderBookRow[]; bids: OrderBookRow[] };

const CLASS_SYMBOLS: Record<string, string[]> = {
  crypto: ['BTC', 'ETH', 'SOL', 'XMR'],
  stocks: ['NVDA', 'AAPL', 'TSLA', 'MSFT'],
  commodities: ['XAU', 'XAG', 'CL', 'NG'],
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'],
};
const CLASS_BASE_PRICE: Record<string, number> = { crypto: 68000, stocks: 180, commodities: 1200, forex: 1.1 };
const TRADE_SYMBOL_CLASS: Record<string, string> = {
  BTC: 'crypto', ETH: 'crypto', SOL: 'crypto', NVDA: 'stocks', AAPL: 'stocks', TSLA: 'stocks',
  XAU: 'commodities', XAG: 'commodities', 'EUR/USD': 'forex', 'GBP/USD': 'forex',
};

/* Pre-plan a session of trades whose sum is EXACTLY the daily target (4 decimals). */
function makeDayPlan(target: number, n = 24): Trade[] {
  const symbols = Object.keys(TRADE_SYMBOL_CLASS);
  const now = Date.now();
  const raw: number[] = [];
  for (let i = 0; i < n; i++) {
    const win = Math.random() > 0.35;
    const mag = 0.5 + Math.random() * 1.5;
    raw.push(win ? mag : -mag * 0.6);
  }
  const rawSum = raw.reduce((a, b) => a + b, 0);
  const scale = target / rawSum;
  const trades: Trade[] = raw.map((r, i) => {
    const sym = symbols[i % symbols.length];
    return {
      id: `t-${now}-${i}`,
      time: new Date(now + i * 2500).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      symbol: sym,
      assetClass: TRADE_SYMBOL_CLASS[sym],
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      quantity: Math.round((Math.random() * 5 + 0.1) * 10000) / 10000,
      price: Math.round((Math.random() * 1000 + 100) * 10000) / 10000,
      pnl: Math.round(r * scale * 10000) / 10000,
    };
  });
  const sumExceptLast = trades.slice(0, -1).reduce((s, t) => s + t.pnl, 0);
  trades[trades.length - 1].pnl = Math.round((target - sumExceptLast) * 10000) / 10000;
  return trades;
}

function generatePositions(): OrbitPosition[] {
  const classes = ['crypto', 'stocks', 'commodities', 'forex'];
  const out: OrbitPosition[] = [];
  let idc = 0;
  classes.forEach((ac, ring) => {
    for (let i = 0; i < 3; i++) {
      const symbol = CLASS_SYMBOLS[ac][i];
      const entry = CLASS_BASE_PRICE[ac] * (0.95 + Math.random() * 0.1);
      const current = entry * (1 + (Math.random() - 0.45) * 0.02);
      const side: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const qty = ac === 'forex' ? Math.random() * 100000 : ac === 'crypto' ? Math.random() * 2 : Math.random() * 20;
      const pnl = (current - entry) * qty * (side === 'BUY' ? 1 : -1);
      out.push({
        id: `pos-${idc++}`, symbol, assetClass: ac as OrbitPosition['assetClass'], side,
        quantity: qty, entryPrice: entry, currentPrice: current, pnl,
        pnlPercent: (pnl / (entry * qty)) * 100,
        orbitRadius: ring + 1, orbitSpeed: 0.5 + Math.random() * 0.5, angle: Math.random() * Math.PI * 2,
      });
    }
  });
  return out;
}

function genOrderBook(prev?: OrderBookData): OrderBookData {
  const base = prev ? prev.base + (Math.random() - 0.5) * 1.2 : 68420.5;
  const mkSide = (dir: 1 | -1): OrderBookRow[] => {
    let acc = 0;
    return Array.from({ length: 6 }, (_, i) => {
      const price = base + dir * (i + 1) * (0.5 + Math.random() * 2);
      const qty = Math.random() * 2.5 + 0.1;
      acc += qty;
      return { price: Math.round(price * 100) / 100, qty: Math.round(qty * 10000) / 10000, total: Math.round(acc * 10000) / 10000 };
    });
  };
  return { base: Math.round(base * 100) / 100, asks: mkSide(1), bids: mkSide(-1) };
}

/* Smoothly animated number — counts toward its value instead of snapping. */
function SmoothNumber({ value, decimals = 4, money = false, signed = false }: { value: number; decimals?: number; money?: boolean; signed?: boolean }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (from === value) { setDisplay(value); return; }
    const controls = animate(from, value, { duration: 0.9, ease: 'easeOut', onUpdate: (v) => setDisplay(v) });
    return () => controls.stop();
  }, [value]);
  const sign = signed ? (display >= 0 ? '+' : '') : '';
  return <>{sign}{money ? '$' : ''}{display.toFixed(decimals)}</>;
}

function OrderBook({ data }: { data: OrderBookData | null }) {
  if (!data) return <div className="py-10 text-center text-sm text-[var(--muted)]">Loading order book…</div>;
  const maxQty = Math.max(...data.asks.map((a) => a.qty), ...data.bids.map((b) => b.qty), 0.0001);
  const row = (o: OrderBookRow, side: 'ask' | 'bid') => (
    <div key={`${side}-${o.price}`} className="relative grid grid-cols-3 px-3 py-[3px] font-mono text-[11.5px] tabular-nums">
      <div className="absolute inset-y-0 right-0" style={{ width: `${(o.qty / maxQty) * 100}%`, background: side === 'ask' ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)' }} />
      <span className={side === 'ask' ? 'text-[#f87171]' : 'text-[#34d399]'}>{o.price.toFixed(2)}</span>
      <span className="text-right text-[var(--fg)]">{o.qty.toFixed(4)}</span>
      <span className="text-right text-[var(--muted)]">{o.total.toFixed(4)}</span>
    </div>
  );
  return (
    <div>
      <div className="grid grid-cols-3 px-3 pb-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
        <span>Price</span><span className="text-right">Qty</span><span className="text-right">Total</span>
      </div>
      <div>{data.asks.slice().reverse().map((a) => row(a, 'ask'))}</div>
      <div className="my-1 flex items-center justify-center gap-2 border-y border-[var(--border)] py-1.5">
        <span className="font-mono text-[15px] font-semibold tabular-nums text-[var(--fg)]">{data.base.toFixed(2)}</span>
        <span className="text-[10px] uppercase text-[var(--muted)]">BTC/USDT</span>
      </div>
      <div>{data.bids.map((b) => row(b, 'bid'))}</div>
    </div>
  );
}

export function AIEngineDashboard({ principal, platformCredit, tierRate, tier }: { principal: number; platformCredit: number; tierRate: number; tier: string }) {
  const basis = principal + platformCredit;
  const dailyTarget = Math.round(basis * tierRate * 10000) / 10000;

  const [dayPlan, setDayPlan] = useState<Trade[]>([]);
  const [executedCount, setExecutedCount] = useState(0);
  const [positions, setPositions] = useState<OrbitPosition[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [isRunning] = useState(true);

  useEffect(() => { setPositions(generatePositions()); }, []);
  useEffect(() => { setDayPlan(makeDayPlan(dailyTarget)); setExecutedCount(0); }, [dailyTarget]);

  /* execute a trade every 2.5s */
  useEffect(() => {
    if (!isRunning) return;
    const iv = setInterval(() => setExecutedCount((c) => (c < dayPlan.length ? c + 1 : c)), 2500);
    return () => clearInterval(iv);
  }, [isRunning, dayPlan.length]);

  /* when the session completes, hold briefly then start a new session */
  useEffect(() => {
    if (dayPlan.length > 0 && executedCount >= dayPlan.length) {
      const t = setTimeout(() => { setDayPlan(makeDayPlan(dailyTarget)); setExecutedCount(0); }, 4500);
      return () => clearTimeout(t);
    }
  }, [executedCount, dayPlan.length, dailyTarget]);

  /* positions drift constantly */
  useEffect(() => {
    if (!isRunning) return;
    const iv = setInterval(() => {
      setPositions((prev) => prev.map((p) => {
        const drift = (Math.random() - 0.48) * 0.002;
        const newPrice = p.currentPrice * (1 + drift);
        const newPnl = (newPrice - p.entryPrice) * p.quantity * (p.side === 'BUY' ? 1 : -1);
        return { ...p, currentPrice: newPrice, pnl: newPnl, pnlPercent: (newPnl / (p.entryPrice * p.quantity)) * 100 };
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, [isRunning]);

  /* order book refreshes constantly */
  useEffect(() => {
    if (!isRunning) return;
    setOrderBook(genOrderBook());
    const iv = setInterval(() => setOrderBook((prev) => genOrderBook(prev || undefined)), 1500);
    return () => clearInterval(iv);
  }, [isRunning]);

  const executedTrades = useMemo(() => dayPlan.slice(0, executedCount), [dayPlan, executedCount]);
  const runningPnl = useMemo(() => Math.round(executedTrades.reduce((s, t) => s + t.pnl, 0) * 10000) / 10000, [executedTrades]);
  const wins = executedTrades.filter((t) => t.pnl > 0).length;
  const winRate = executedTrades.length ? (wins / executedTrades.length) * 100 : 0;
  const chargeProgress = dailyTarget > 0 ? Math.min(1, Math.max(0, runningPnl / dailyTarget)) : 0;
  const targetReached = dayPlan.length > 0 && executedCount >= dayPlan.length;

  const allocation = useMemo(() => {
    const classes = ['crypto', 'stocks', 'commodities', 'forex'];
    const totalNotional = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
    return classes.map((ac) => {
      const cp = positions.filter((p) => p.assetClass === ac);
      const pnl = cp.reduce((s, p) => s + p.pnl, 0);
      const notional = cp.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
      return { assetClass: ac, pnl, count: cp.length, pct: totalNotional > 0 ? (notional / totalNotional) * 100 : 25 };
    });
  }, [positions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} context={`${executedTrades.length} trades executed`} />
        <StatCard label="Open Positions" value={String(positions.length)} context="Across 4 asset classes" />
        <div className="ds-card rounded-xl p-5">
          <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">Today's P&L</div>
          <div className={`mt-2 font-mono text-[28px] font-semibold tabular-nums ${runningPnl >= 0 ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}`}>
            <SmoothNumber value={runningPnl} decimals={4} money signed />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--card)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #34d399, #22d3ee)' }}
              animate={{ width: `${chargeProgress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>Target ${dailyTarget.toFixed(4)}</span>
            {targetReached ? <span className="font-semibold text-[var(--profit)]">✓ TARGET REACHED</span> : <span>{(chargeProgress * 100).toFixed(0)}%</span>}
          </div>
        </div>
        <StatCard label="Basis" value={`$${basis.toFixed(2)}`} context={`${tier} @ ${(tierRate * 100).toFixed(2)}%/day`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DataCard title="AI Engine Reactor" subtitle="Market data flows in · trading power flows out" className="lg:col-span-2">
          <div style={{ minHeight: 500 }}>
            <AIEngineOrbit positions={positions} isRunning={isRunning} chargeProgress={chargeProgress} />
          </div>
        </DataCard>
        <DataCard title="Live Order Book" subtitle="BTC/USDT · real-time depth">
          <OrderBook data={orderBook} />
        </DataCard>
      </div>

      <DataCard title="Market Allocation" subtitle="Capital distribution · live">
        <div className="grid gap-4 md:grid-cols-2">
          {allocation.map((a) => (
            <div key={a.assetClass} className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-medium capitalize text-[var(--fg)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: ASSET_COLORS[a.assetClass], boxShadow: `0 0 8px ${ASSET_COLORS[a.assetClass]}` }} />
                  {a.assetClass}
                </span>
                <span className={`font-mono tabular-nums ${a.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}`}>
                  {a.pnl >= 0 ? '+' : ''}${a.pnl.toFixed(4)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--card)]">
                <motion.div
                  className="relative h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${ASSET_COLORS[a.assetClass]}99, ${ASSET_COLORS[a.assetClass]})` }}
                  animate={{ width: `${a.pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <div className="alloc-shimmer absolute inset-0" />
                </motion.div>
              </div>
              <div className="text-[11px] text-[var(--muted)]">{a.pct.toFixed(1)}% allocation · {a.count} positions</div>
            </div>
          ))}
        </div>
      </DataCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DataCard title="Trade Execution Feed" subtitle={`${dayPlan.length}-trade session · converging to target`}>
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {executedTrades.slice(-7).reverse().map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-5 items-center gap-2 rounded-lg px-3 py-2 font-mono text-[12px] tabular-nums"
                  style={{ background: 'rgba(148,163,184,0.05)' }}
                >
                  <span className="text-[var(--muted)]">{t.time}</span>
                  <span className="font-medium text-[var(--fg)]">{t.symbol}</span>
                  <span className={t.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>{t.side}</span>
                  <span className="text-right text-[var(--muted)]">{t.quantity.toFixed(4)}</span>
                  <span className={`text-right ${t.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}`}>
                    {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(4)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {executedTrades.length === 0 && <div className="py-6 text-center text-sm text-[var(--muted)]">Engine warming up — first trade incoming…</div>}
          </div>
        </DataCard>

        <DataCard title="Open Positions" subtitle={`${positions.length} active`}>
          <div className="space-y-1">
            {positions.slice(0, 7).map((p) => {
              const win = p.pnl >= 0;
              const c = ASSET_COLORS[p.assetClass];
              return (
                <div key={p.id} className="grid grid-cols-4 items-center gap-2 rounded-lg px-3 py-2 font-mono text-[12px] tabular-nums" style={{ background: 'rgba(148,163,184,0.05)' }}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                    <span className="font-medium text-[var(--fg)]">{p.symbol}</span>
                  </span>
                  <span className={p.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>{p.side}</span>
                  <span className="text-right text-[var(--muted)]">{p.currentPrice.toFixed(4)}</span>
                  <span className={`text-right ${win ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}`}>{win ? '+' : ''}${p.pnl.toFixed(4)}</span>
                </div>
              );
            })}
          </div>
        </DataCard>
      </div>

      <style>{`
        @keyframes alloc-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .alloc-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); animation: alloc-shimmer 2.2s linear infinite; }
      `}</style>
    </div>
  );
}
