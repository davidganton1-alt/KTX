"use client";
import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

const STATS = [
  { to: 12400, suffix: "+", label: "Members walking in faith" },
  { to: 8.4, prefix: "$", suffix: "M", decimals: 1, label: "Profit withdrawn" },
  { to: 1.2, suffix: "M", decimals: 1, label: "Trades executed by the AI" },
  { to: 99.98, suffix: "%", decimals: 2, label: "Engine uptime" },
];

function Counter({ to, prefix = "", suffix = "", decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 2.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current)
          ref.current.textContent =
            prefix + v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, to, prefix, suffix, decimals]);
  return <span ref={ref}>0</span>;
}

export function StatsBand() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {STATS.map((s, i) => (
        <div key={i} className="card p-6 text-center">
          <p className="gradient-text text-3xl font-extrabold tracking-tight md:text-4xl">
            <Counter to={s.to} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} decimals={s.decimals ?? 0} />
          </p>
          <p className="mt-2 text-xs text-[var(--muted)] md:text-sm">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
