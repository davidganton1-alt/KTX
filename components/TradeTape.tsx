"use client";
import { motion } from "framer-motion";

type Trade = {
  id: string; symbol: string; side: "BUY" | "SELL"; entry: number; exit?: number;
  qty: number; notional: number; pnl?: number; openedAt: number; closedAt?: number;
  type: string; technique: string;
};

const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tstamp = (ms: number) => new Date(ms).toLocaleTimeString();

export function TradeTape({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) return <p className="py-6 text-center text-xs text-[var(--muted)]">Awaiting signals…</p>;
  return (
    <div className="space-y-1 font-mono text-[11px]">
      <div className="flex justify-between px-2 pb-1 text-[9px] uppercase tracking-widest text-[var(--muted)]">
        <span>Time</span><span>Action</span><span>Symbol</span><span>Price</span><span>P&L</span>
      </div>
      {trades.slice(0, 15).map((t, i) => (
        <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[var(--muted)]">{tstamp(t.closedAt || t.openedAt)}</span>
          <span className={`font-bold ${t.exit ? "text-[var(--purple)]" : "text-[var(--cyan)]"}`}>{t.exit ? "CLOSE" : "OPEN"}</span>
          <span className={`font-bold ${t.side === "BUY" ? "text-profit" : "text-loss"}`}>{t.side}</span>
          <span className="font-bold text-[var(--fg)]">{t.symbol}</span>
          <span className="text-[var(--muted)]">${fmt(t.exit || t.entry)}</span>
          {t.pnl != null && <span className={`font-bold ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}>{t.pnl >= 0 ? "+" : ""}${fmt(t.pnl)}</span>}
        </motion.div>
      ))}
    </div>
  );
}
