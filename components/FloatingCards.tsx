"use client";
import { motion } from "framer-motion";

const float = (dur: number) => ({ y: [0, -12, 0], transition: { duration: dur, repeat: Infinity, ease: "easeInOut" } });

export function FloatingCards() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block" aria-hidden>
      <motion.div animate={float(6)} className="glass absolute left-[4%] top-[24%] w-56 rounded-2xl p-5">
        <p className="eyebrow">Daily yield</p>
        <p className="mt-1 text-3xl font-bold text-profit">+0.75%</p>
        <svg viewBox="0 0 100 40" className="mt-3 h-10 w-full">
          <path d="M0,35 L20,25 L40,30 L60,15 L80,20 L100,5" fill="none" stroke="var(--profit)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 6px var(--profit))" }} />
        </svg>
      </motion.div>
      <motion.div animate={float(7.5)} className="glass absolute right-[5%] top-[30%] w-60 rounded-2xl p-5">
        <p className="eyebrow">Active position</p>
        <p className="mt-1 text-xl font-bold">BTC/USD <span className="text-profit">↑ 12%</span></p>
        <p className="mt-2 text-xs text-[var(--muted)]">Long · AI confidence 94% · guardrails on</p>
      </motion.div>
      <motion.div animate={float(8.5)} className="glass absolute bottom-[20%] left-[9%] w-52 rounded-2xl p-5">
        <p className="eyebrow">Withdrawal</p>
        <p className="mt-1 text-2xl font-bold text-profit">Approved ✓</p>
        <p className="mt-2 text-xs text-[var(--muted)]">Profit unlocked instantly</p>
      </motion.div>
    </div>
  );
}
