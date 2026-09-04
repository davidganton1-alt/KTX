"use client";
import { motion } from "framer-motion";
import { CandleChart } from "./CandleChart";

const CARDS = [
  { t: "The Stewardship Engine", d: "Algorithmic riskparity sizing with Kalman volatility filters. No emotion — only discipline.", span: "md:col-span-4 md:row-span-2", chart: true },
  { t: "Biblical guardrails", d: "No reckless leverage. Drawdown limits protect your principal.", span: "md:col-span-2" },
  { t: "Profit-only harvest", d: "Withdraw your daily yield anytime. Your seed stays planted.", span: "md:col-span-2" },
  { t: "All-seeing market fusion", d: "LSTM sequence models read crypto, US equities and commodities together.", span: "md:col-span-3" },
  { t: "Transparent ledger", d: "Every AI decision is logged and visible in your dashboard.", span: "md:col-span-3" },
];

export function BentoGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:auto-rows-[minmax(170px,auto)] md:grid-cols-6">
      {CARDS.map((c, i) => (
        <motion.div
          key={c.t}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`card p-7 ${c.span}`}
        >
          <h3 className="text-xl font-bold">{c.t}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{c.d}</p>
          {c.chart && <div className="mt-8"><CandleChart /></div>}
        </motion.div>
      ))}
    </div>
  );
}
