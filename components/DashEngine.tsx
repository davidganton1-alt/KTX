"use client";
import { useEffect, useRef, useState } from "react";

type Position = {
  id: string; symbol: string; side: "BUY" | "SELL";
  entry: number; qty: number; notional: number;
  openedAt: number; type: string; technique: string;
};
type Closed = {
  id: string; symbol: string; side: "BUY" | "SELL";
  entry: number; exit: number; qty: number; pnl: number;
  openedAt: number; closedAt: number; type: string; technique: string;
};
type Tick = {
  price: number; change24h: number; source: string;
  openPositions: Position[]; closedTrades: Closed[];
};

const fmt = (p: number, d?: number) =>
  d != null ? p.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
  : p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 })
  : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function DashEngine({ symbol = "BTC" }: { symbol?: string }) {
  const [tick, setTick] = useState<Tick | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    async function pull() {
      try {
        const res = await fetch(`/api/aitrading2?symbol=${symbol}&range=1D`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (active.current) {
          setTick(json);
          setLastUpdate(Date.now());
        }
      } catch { /* keep last good */ }
    }
    pull();
    const t = setInterval(pull, 500); // 500ms refresh rate
    return () => { active.current = false; clearInterval(t); };
  }, [symbol]);

  if (!tick) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
      </div>
    );
  }

  const up = tick.change24h >= 0;
  const openPnl = tick.openPositions.reduce((sum, p) => {
    const cur = tick.price;
    const pnl = p.side === "BUY" ? (cur - p.entry) * p.qty : (p.entry - cur) * p.qty;
    return sum + pnl;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${tick.source === "live" ? "bg-profit animate-pulse" : "bg-gold animate-pulse"}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Engine {tick.source === "live" ? "Live" : "Simulated"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
          <span>{symbol} <b className={up ? "text-profit" : "text-loss"}>${fmt(tick.price)}</b></span>
          <span className={up ? "text-profit" : "text-loss"}>{up ? "▲" : "▼"} {tick.change24h.toFixed(2)}%</span>
          <span className="tabular-nums">{new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Open Positions */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-bold text-[var(--fg)]">Open Positions ({tick.openPositions.length})</h4>
          <span className={`text-sm font-bold ${openPnl >= 0 ? "text-profit" : "text-loss"}`}>
            {openPnl >= 0 ? "+" : ""}${fmt(openPnl, 2)} unrealized
          </span>
        </div>
        {tick.openPositions.length === 0 ? (
          <p className="py-4 text-center text-xs text-[var(--muted)]">Engine scanning for entries...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
                  <th className="px-2 py-2">Symbol</th>
                  <th className="px-2 py-2">Side</th>
                  <th className="px-2 py-2">Entry</th>
                  <th className="px-2 py-2">Current</th>
                  <th className="px-2 py-2">P&L</th>
                  <th className="px-2 py-2">Held</th>
                  <th className="px-2 py-2">Technique</th>
                </tr>
              </thead>
              <tbody>
                {tick.openPositions.map((p) => {
                  const pnl = p.side === "BUY" ? (tick.price - p.entry) * p.qty : (p.entry - tick.price) * p.qty;
                  const heldSec = Math.floor((Date.now() - p.openedAt) / 1000);
                  return (
                    <tr key={p.id} className="border-b border-[var(--border)]/50">
                      <td className="px-2 py-2 font-bold">{p.symbol}</td>
                      <td className={`px-2 py-2 font-bold ${p.side === "BUY" ? "text-profit" : "text-loss"}`}>{p.side}</td>
                      <td className="px-2 py-2 text-[var(--muted)]">${fmt(p.entry)}</td>
                      <td className="px-2 py-2">${fmt(tick.price)}</td>
                      <td className={`px-2 py-2 font-bold ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        {pnl >= 0 ? "+" : ""}${fmt(pnl, 2)}
                      </td>
                      <td className="px-2 py-2 text-[var(--muted)]">{heldSec}s</td>
                      <td className="px-2 py-2 text-[var(--gold)]">{p.technique}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Closed Trades */}
      <div>
        <h4 className="mb-2 text-sm font-bold text-[var(--fg)]">Recent Closed Trades</h4>
        {tick.closedTrades.length === 0 ? (
          <p className="py-4 text-center text-xs text-[var(--muted)]">No closed trades yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
                  <th className="px-2 py-2">Symbol</th>
                  <th className="px-2 py-2">Side</th>
                  <th className="px-2 py-2">Entry</th>
                  <th className="px-2 py-2">Exit</th>
                  <th className="px-2 py-2">P&L</th>
                  <th className="px-2 py-2">Technique</th>
                </tr>
              </thead>
              <tbody>
                {tick.closedTrades.slice(0, 8).map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border)]/50">
                    <td className="px-2 py-2 font-bold">{t.symbol}</td>
                    <td className={`px-2 py-2 font-bold ${t.side === "BUY" ? "text-profit" : "text-loss"}`}>{t.side}</td>
                    <td className="px-2 py-2 text-[var(--muted)]">${fmt(t.entry)}</td>
                    <td className="px-2 py-2 text-[var(--muted)]">${fmt(t.exit)}</td>
                    <td className={`px-2 py-2 font-bold ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {t.pnl >= 0 ? "+" : ""}${fmt(t.pnl, 2)}
                    </td>
                    <td className="px-2 py-2 text-[var(--gold)]">{t.technique}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
