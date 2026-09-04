"use client";
import { motion } from "framer-motion";

const CANDLES = [
  { h: 38, up: true }, { h: 55, up: true }, { h: 30, up: false }, { h: 70, up: true },
  { h: 48, up: false }, { h: 82, up: true }, { h: 44, up: true }, { h: 66, up: true },
  { h: 92, up: true }, { h: 58, up: false }, { h: 78, up: true }, { h: 52, up: true },
  { h: 88, up: true }, { h: 64, up: false }, { h: 100, up: true }, { h: 74, up: true },
];

export function CandleChart() {
  return (
    <div className="flex h-40 items-end justify-center gap-2 md:h-52">
      {CANDLES.map((c, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: `${c.h}%`, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`w-2.5 rounded-sm md:w-3.5 ${c.up ? "bg-profit" : "bg-loss"}`}
          style={{ boxShadow: c.up ? "0 0 12px rgba(52,211,153,.35)" : "0 0 12px rgba(248,113,113,.35)" }}
        />
      ))}
    </div>
  );
}
