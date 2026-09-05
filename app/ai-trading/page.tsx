"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/GlowCard";
import { LiveChart } from "@/components/LiveChart";
import { TradeTape } from "@/components/TradeTape";
import { DemoBadge } from "@/components/DemoBadge";

type Candle = { t: number; o: number; h: number; l: number; c: number };
type Position = { id: string; symbol: string; side: "BUY" | "SELL"; entry: number; qty: number; notional: number; openedAt: number; type: string; technique: string };
type Closed = { id: string; symbol: string; side: "BUY" | "SELL"; entry: number; exit: number; qty: number; notional: number; pnl: number; openedAt: number; closedAt: number; type: string; technique: string };
type Snap = {
  symbol: string; range: string; assetClass: string; price: number; change24h: number; notional: number;
  candles: Candle[]; openPositions: Position[]; closedTrades: Closed[];
  symbols: string[]; totalAssetClasses: number; source: "live" | "simulated";
};

const RANGES = ["1D", "1W", "1M", "3M", "1Y"];
const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQty = (q: number) => q.toLocaleString(undefined, { maximumFractionDigits: 6 });

function calculateRSI(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) return 50;
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = candles.length - period; i < candles.length; i++) {
    const change = candles[i].c - candles[i - 1].c;
    if (change > 0) { gains.push(change); losses.push(0); }
    else { gains.push(0); losses.push(Math.abs(change)); }
  }
  const avgGain = gains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateMA(candles: Candle[], period: number): number {
  if (candles.length < period) return 0;
  const slice = candles.slice(-period);
  return slice.reduce((sum, c) => sum + c.c, 0) / period;
}

export default function AiTradeEnginePage() {
  const [snap, setSnap] = useState<Snap | null>(null);
  const [sym, setSym] = useState("BTC");
  const [range, setRange] = useState("3M");
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    async function pull() {
      try {
        const res = await fetch(`/api/aitrading2?symbol=${encodeURIComponent(sym)}&range=${encodeURIComponent(range)}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (active.current) setSnap(json);
      } catch { /* keep last good */ }
    }
    pull();
    const t = setInterval(pull, 1000);
    return () => { active.current = false; clearInterval(t); };
  }, [sym, range]);

  if (!snap) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center font-mono text-sm text-[var(--muted)]">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
          ESTABLISHING SECURE FEED<span className="animate-pulse">▌</span>
        </div>
      </div>
    );
  }

  const up = snap.change24h >= 0;
  const isLive = snap.source === "live";
  const rsi = calculateRSI(snap.candles);
  const ma20 = calculateMA(snap.candles, 20);
  const ma50 = calculateMA(snap.candles, 50);
  const maCross = ma20 > ma50;
  const totalPnl = snap.closedTrades.reduce((sum, t) => sum + t.pnl, 0);
  const winRate = snap.closedTrades.length > 0 ? (snap.closedTrades.filter((t) => t.pnl > 0).length / snap.closedTrades.length) * 100 : 0;
  const aiConfidence = Math.min(95, 50 + Math.abs(snap.change24h) * 2 + (maCross ? 15 : 0));

  return (
    <main className="pb-16">
      {/* Command Bar */}
      <section className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--bg-soft)]/40 via-[var(--bg)] to-[var(--bg-soft)]/40">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-[var(--gold)]">KTX_TERMINAL</span>
            <span className="rounded bg-[var(--gold)]/10 px-2 py-0.5 text-[var(--gold)]">v2.1</span>
            <DemoBadge />
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
            <span className={`flex items-center gap-1.5 font-bold ${isLive ? "text-profit" : "text-[var(--gold)]"}`}>
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isLive ? "bg-profit" : "bg-gold"}`} /> {isLive ? "LIVE FEED" : "SIMULATED"}
            </span>
            <span>ENGINE: ACTIVE</span>
            <span className="tabular-nums">{new Date().toUTCString().slice(17, 25)} UTC</span>
          </div>
        </div>
      </section>

      {/* Symbol Selector */}
      <section className="container-wide pt-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-mono text-4xl font-bold md:text-5xl">{snap.symbol}</h1>
              <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted)]">{snap.assetClass}</span>
            </div>
            <div className="flex items-baseline gap-4">
              <p className="font-mono text-3xl font-extrabold tabular-nums md:text-4xl">${fmt(snap.price)}</p>
              <p className={`font-mono text-lg font-bold ${up ? "text-profit" : "text-loss"}`}>
                {up ? "▲ +" : "▼ "}{snap.change24h.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`pill font-mono transition ${range === r ? "!border-[var(--gold)] !text-[var(--gold)] bg-[var(--gold)]/10" : ""}`}>{r}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="container-wide mt-8">
        <div className="grid gap-4 md:grid-cols-4">
          <GlowCard className="p-5">
            <p className="eyebrow">RSI (14)</p>
            <p className={`mt-2 text-3xl font-extrabold ${rsi > 70 ? "text-loss" : rsi < 30 ? "text-profit" : "text-[var(--fg)]"}`}>{rsi.toFixed(1)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"}</p>
          </GlowCard>
          <GlowCard className="p-5">
            <p className="eyebrow">MA Cross</p>
            <p className={`mt-2 text-3xl font-extrabold ${maCross ? "text-profit" : "text-loss"}`}>{maCross ? "BULLISH" : "BEARISH"}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">MA20 {maCross ? ">" : "<"} MA50</p>
          </GlowCard>
          <GlowCard className="p-5">
            <p className="eyebrow">Win Rate</p>
            <p className="mt-2 text-3xl font-extrabold text-[var(--gold)]">{winRate.toFixed(0)}%</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{snap.closedTrades.length} trades closed</p>
          </GlowCard>
          <GlowCard className="p-5">
            <p className="eyebrow">Total P&L</p>
            <p className={`mt-2 text-3xl font-extrabold ${totalPnl >= 0 ? "text-profit" : "text-loss"}`}>{totalPnl >= 0 ? "+" : ""}${fmt(totalPnl)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">All positions</p>
          </GlowCard>
        </div>
      </section>

      {/* Main Chart */}
      <section className="container-wide mt-6">
        <GlowCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Price Action · {range}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="h-2 w-2 rounded-full bg-profit" /> MA20
                <span className="h-2 w-2 rounded-full bg-loss" /> MA50
              </div>
            </div>
          </div>
          <LiveChart candles={snap.candles} price={snap.price} />
        </GlowCard>
      </section>

      {/* AI Confidence + Open Positions */}
      <section className="container-wide mt-5 grid gap-5 lg:grid-cols-[1fr_1.5fr]">
        <GlowCard className="p-6">
          <p className="eyebrow mb-4">AI Confidence</p>
          <div className="flex items-center justify-between">
            <span className="text-5xl font-extrabold text-[var(--gold)]">{aiConfidence.toFixed(0)}%</span>
            <div className="text-right">
              <p className="text-xs text-[var(--muted)]">Signal Strength</p>
              <p className="text-sm font-bold text-[var(--fg)]">{aiConfidence > 75 ? "Strong" : aiConfidence > 50 ? "Moderate" : "Weak"}</p>
            </div>
          </div>
          <div className="mt-4 h-3 rounded-full bg-[var(--border)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiConfidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-loss via-[var(--gold)] to-profit"
            />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Open Positions</span>
              <span className="font-bold">{snap.openPositions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Closed Today</span>
              <span className="font-bold">{snap.closedTrades.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Avg Hold Time</span>
              <span className="font-bold">45s</span>
            </div>
          </div>
        </GlowCard>

        <GlowCard className="p-6">
          <p className="eyebrow mb-4">Open Positions</p>
          {snap.openPositions.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-[var(--muted)]">Scanning for disciplined entries…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-[9px] uppercase tracking-widest text-[var(--muted)]">
                  <tr><th className="px-2 py-2">Symbol</th><th className="px-2 py-2">Side</th><th className="px-2 py-2">Entry</th><th className="px-2 py-2">Qty</th><th className="px-2 py-2">Technique</th><th className="px-2 py-2">Held</th></tr>
                </thead>
                <tbody>
                  {snap.openPositions.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--border)] transition hover:bg-[var(--card)]">
                      <td className="px-2 py-2 font-bold">{p.symbol}</td>
                      <td className={`px-2 py-2 font-bold ${p.side === "BUY" ? "text-profit" : "text-loss"}`}>{p.side}</td>
                      <td className="px-2 py-2 text-[var(--muted)]">${fmt(p.entry)}</td>
                      <td className="px-2 py-2 text-[var(--muted)]">{fmtQty(p.qty)}</td>
                      <td className="px-2 py-2 text-[var(--gold)]">{p.technique}</td>
                      <td className="px-2 py-2 text-[var(--muted)]">{Math.floor((Date.now() - p.openedAt) / 1000)}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlowCard>
      </section>

      {/* Cross-Asset Trade Tape */}
      <section className="container-wide mt-5">
        <GlowCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Cross-Asset Trade Tape</p>
            <a href="#closed" className="text-xs text-[var(--gold)] hover:underline">View all trades →</a>
          </div>
          <TradeTape trades={[...snap.closedTrades, ...snap.openPositions.map((p) => ({ ...p, pnl: undefined, exit: undefined, closedAt: undefined }))].slice(0, 15)} />
        </GlowCard>
      </section>

      {/* Symbol Grid */}
      <section className="container-wide mt-8">
        <p className="eyebrow mb-4">All Markets</p>
        <div className="ticker-fade overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {snap.symbols.map((s) => (
              <button key={s} onClick={() => setSym(s)} className={`pill shrink-0 font-mono transition ${sym === s ? "!border-[var(--gold)] !text-[var(--gold)] bg-[var(--gold)]/10" : "hover:border-[var(--gold)]/50"}`}>{s}</button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
