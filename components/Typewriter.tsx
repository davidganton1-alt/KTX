"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const LINES = [
  "> scanning 4,218 signals across BTC, ETH, SPX, XAU…",
  "> LSTM forecast: BTC momentum +0.42% (confidence 94%)",
  "> Kalman filter: volatility regime = CALM",
  "> risk-parity size: 2.1% of book · drawdown guard OK",
  "> RL execution: entering LONG @ market",
  "> position monitored · trailing stop armed ✦",
];

export function Typewriter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [text, setText] = useState("");

  useEffect(() => {
    if (!inView) return;
    let line = 0, char = 0, alive = true;
    const tick = () => {
      if (!alive) return;
      const current = LINES[line];
      char++;
      setText(LINES.slice(0, line).join("\n") + (line ? "\n" : "") + current.slice(0, char));
      if (char >= current.length) {
        line++; char = 0;
        if (line >= LINES.length) { alive = false; return; }
        setTimeout(tick, 500);
      } else setTimeout(tick, 16 + Math.random() * 30);
    };
    setTimeout(tick, 300);
    return () => { alive = false; };
  }, [inView]);

  return (
    <div ref={ref} className="rounded-xl border border-[var(--border)] bg-[#060818] p-5 font-mono text-xs leading-relaxed text-[var(--profit)] md:text-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-loss" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold" />
        <span className="h-2.5 w-2.5 rounded-full bg-profit" />
        <span className="ml-2 text-[10px] uppercase tracking-widest text-[var(--muted)]">ktx-engine · live</span>
      </div>
      <pre className="whitespace-pre-wrap">{text}<span className="animate-pulse">▌</span></pre>
    </div>
  );
}
