"use client";
import { useEffect, useRef, useState } from "react";
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

const RANGES = ["1D", "1W", "1M", "3M"];
const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQty = (q: number) => q.toLocaleString(undefined, { maximumFractionDigits: 6 });

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

  return (
    <main className="pb-16">
      <section className="border-b border-[var(--border)] bg-[var(--bg-soft)]/40">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--gold)]">KTX_TERMINAL v2.1</span>
            <DemoBadge />
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
            <span className={`flex items-center gap-1.5 font-bold ${isLive ? "text-profit" : "text-[var(--gold)]"}`}>
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isLive ? "bg-profit" : "bg-gold"}`} /> {isLive ? "LIVE FEED" : "SIMULATED"}
            </span>
            <span>ENGINE: ACTIVE</span>
          </div>
        </div>
      </section>

      <section className="container-wide pt-8">
        <div className="ticker-fade overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {snap.symbols.map((s) => (
              <button key={s} onClick={() => setSym(s)} className={`pill shrink-0 font-mono transition ${sym === s ? "!border-[var(--gold)] !text-[var(--gold)] bg-[var(--gold)]/10" : "hover:border-[var(--gold)]/50"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-3xl font-bold">{snap.symbol}<span className="ml-2 text-sm text-[var(--muted)]">{snap.assetClass}</span></h1>
            <div>
              <p className="font-mono text-2xl font-extrabold tabular-nums">${fmt(snap.price)}</p>
              <p className={`font-mono text-xs font-bold ${up ? "text-profit" : "text-loss"}`}>{up ? "▲ +" : "▼ "}{snap.change24h.toFixed(2)}% · 24h</p>
            </div>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`pill font-mono transition ${range === r ? "!border-[var(--gold)] !text-[var(--gold)] bg-[var(--gold)]/10" : ""}`}>{r}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wide mt-6">
        <GlowCard className="p-5">
          <p className="eyebrow mb-3">Price action · {range}</p>
          <LiveChart candles={snap.candles} price={snap.price} />
        </GlowCard>
      </section>

      <section className="container-wide mt-5 grid gap-5 lg:grid-cols-2">
        <GlowCard className="p-5">
          <p className="eyebrow mb-3">Cross-asset trade tape</p>
          <TradeTape trades={[...snap.closedTrades, ...snap.openPositions.map((p) => ({ ...p, pnl: undefined, exit: undefined, closedAt: undefined }))].slice(0, 15)} />
        </GlowCard>
        <GlowCard className="p-5">
          <p className="eyebrow mb-3">Open positions</p>
          {snap.openPositions.length === 0 ? (
            <p className="py-6 text-center text-xs text-[var(--muted)]">Scanning for entries…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-[9px] uppercase tracking-widest text-[var(--muted)]">
                  <tr><th className="px-2 py-1.5">Symbol</th><th className="px-2 py-1.5">Side</th><th className="px-2 py-1.5">Entry</th><th className="px-2 py-1.5">Qty</th><th className="px-2 py-1.5">Technique</th></tr>
                </thead>
                <tbody>
                  {snap.openPositions.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--border)]">
                      <td className="px-2 py-2 font-bold">{p.symbol}</td>
                      <td className={`px-2 py-2 font-bold ${p.side === "BUY" ? "text-profit" : "text-loss"}`}>{p.side}</td>
                      <td className="px-2 py-2 text-[var(--muted)]">${fmt(p.entry)}</td>
                      <td className="px-2 py-2 text-[var(--muted)]">{fmtQty(p.qty)}</td>
                      <td className="px-2 py-2 text-[var(--gold)]">{p.technique}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlowCard>
      </section>
    </main>
  );
}
