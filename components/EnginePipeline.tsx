"use client";
import { useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export const STAGES = [
  { num: "01", color: "#F5C97B", icon: "◈", title: "Signal fusion",
    body: "Every second, price, volume, order-flow and on-chain signals across crypto, US stocks and commodities stream into one place.",
    verse: "He telleth the number of the stars; he calleth them all by their names. — Psalm 147:4" },
  { num: "02", color: "#22D3EE", icon: "◈", title: "Forecasting",
    body: "LSTM and GRU sequence models read the shape of the market, while a Kalman filter keeps volatility estimates honest.",
    verse: "A prudent man foreseeth the evil, and hideth himself. — Proverbs 22:3" },
  { num: "03", color: "#A855F7", icon: "◈", title: "Sizing & guardrails",
    body: "Position size is set against a drawdown guard before any entry, so no single move can undo your plan.",
    verse: "Forsake her not, and she shall preserve thee. — Proverbs 4:6" },
  { num: "04", color: "#34D399", icon: "◈", title: "Execution & review",
    body: "Reinforcement learning times the entry and exit, then monitors every open trade to close or cut it.",
    verse: "Commit thy works unto the LORD, and thy thoughts shall be established. — Proverbs 16:3" },
];

export function EngineCore({ color = "#F5C97B", activeIndex = 0, className = "" }: { color?: string; activeIndex?: number; className?: string }) {
  const NODES = [
    { x: "50%", y: "5%" }, { x: "95%", y: "50%" }, { x: "50%", y: "95%" }, { x: "5%", y: "50%" },
  ];
  const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
    dur: 7 + (i % 5) * 2,
    delay: -(i * 1.3),
    r: 22 + (i % 4) * 9,
    size: i % 3 === 0 ? 3 : 2,
  }));

  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[360px] ${className}`}>
      {/* ambient halo */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="h-[100%] w-[100%] rounded-full opacity-60 blur-3xl transition-all duration-700"
             style={{ background: `radial-gradient(circle, ${color}66, transparent 72%)` }} />
      </div>

      {/* concentric rings */}
      <div className="absolute inset-[3%] rounded-full border border-white/10" style={{ animation: "spin 22s linear infinite" }} />
      <div className="absolute inset-[13%] rounded-full border border-dashed border-white/15" style={{ animation: "spin 32s linear infinite reverse" }} />
      <div className="absolute inset-[25%] rounded-full border border-white/5" style={{ animation: "spin 15s linear infinite" }} />

      {/* orbiting particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="absolute inset-0" style={{ animation: `spin ${p.dur}s linear infinite`, animationDelay: `${p.delay}s` }}>
          <span className="absolute left-1/2 -translate-x-1/2 rounded-full transition-colors duration-700"
                style={{ top: `${50 - p.r}%`, width: p.size, height: p.size, background: color, boxShadow: `0 0 10px ${color}` }} />
        </div>
      ))}

      {/* stage nodes */}
      {NODES.map((n, i) => (
        <div key={i} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: n.x, top: n.y }}>
          <div className={`grid h-10 w-10 place-items-center rounded-full border text-xs font-bold transition-all duration-500 ${i === activeIndex ? "scale-125" : "scale-100 opacity-40"}`}
               style={{ background: i === activeIndex ? color : "var(--card)", borderColor: color, color: i === activeIndex ? "#0a0e27" : "var(--muted)", boxShadow: i === activeIndex ? `0 0 24px ${color}88` : "none" }}>
            {STAGES[i].num}
          </div>
        </div>
      ))}

      {/* center orb */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-36 w-36 place-items-center rounded-full transition-all duration-700 animate-[haloPulse_4s_ease-in-out_infinite] md:h-40 md:w-40"
             style={{ background: `radial-gradient(circle at 35% 30%, #ffffff33, ${color})`, boxShadow: `0 0 80px ${color}77, inset 0 0 30px rgba(255,255,255,.15)` }}>
          <span className="text-3xl text-[#0a0e27]">{STAGES[activeIndex].icon}</span>
        </div>
      </div>
    </div>
  );
}

export function EnginePipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(3, Math.floor(v * 4))));
  const stage = STAGES[active];

  return (
    <div ref={ref} className="relative" style={{ height: "420vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
          <EngineCore color={stage.color} activeIndex={active} />
          <div className="relative h-80">
            {STAGES.map((s, i) => (
              <div key={s.num} className={`absolute inset-0 flex flex-col justify-center transition-all duration-500 ${i === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
                <span className="eyebrow" style={{ color: s.color }}>Stage {s.num} · {i === active ? "active" : "pending"}</span>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">{s.title}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-[var(--muted)]">{s.body}</p>
                <p className="mt-5 text-sm italic text-[var(--gold)]">{s.verse}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
