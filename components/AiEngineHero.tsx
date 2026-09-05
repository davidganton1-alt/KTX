"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { EngineCore } from "./EnginePipeline";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export function AiEngineHero() {
  const motes = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      left: `${(i * 47 + 11) % 100}%`,
      dur: `${8 + (i % 6) * 2.2}s`,
      delay: `-${((i * 1.9) % 16).toFixed(1)}s`,
      size: `${1 + (i % 3)}px`,
    })),
    []
  );

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-20 blur-[140px]" style={{ background: "var(--gold)" }} />
        <div className="absolute -right-32 bottom-1/4 h-[420px] w-[420px] rounded-full opacity-15 blur-[120px]" style={{ background: "var(--cyan)" }} />
        <div className="site-bg-motes">
          {motes.map((m, i) => (
            <span key={i} className="mote" style={{ left: m.left, animationDuration: m.dur, animationDelay: m.delay, width: m.size, height: m.size }} />
          ))}
        </div>
      </div>

      <div className="container-wide relative z-10 grid items-center gap-14 py-24 lg:grid-cols-2">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span variants={item} className="pill inline-flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-profit" /> The AI Trade Engine
          </motion.span>
          <motion.h1 variants={item} className="section-title mt-5 text-5xl leading-[1.05] md:text-6xl xl:text-7xl">
            An engine built on <span className="gradient-text">wisdom</span>, not hype.
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-xl leading-relaxed text-[var(--muted)]">
            KingdomTradeX pairs time-tested stewardship with serious engineering. Every position is chosen, sized and watched by models that never sleep — and you can see each decision in full.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <a href="/ai-trading" className="btn-primary">Open the live terminal</a>
            <a href="/plans" className="btn-ghost">See the plans</a>
          </motion.div>

          {/* live status strip */}
          <motion.div variants={item} className="glass mt-10 inline-flex flex-wrap items-center gap-x-6 gap-y-2 rounded-full px-6 py-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5 font-bold text-profit"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-profit" /> ENGINE ONLINE</span>
            <span>24/7 uptime</span>
            <span>4-stage pipeline</span>
            <span className="text-[var(--gold)]">Guardrails active</span>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <EngineCore color="#F5C97B" activeIndex={0} className="max-w-[420px]" />
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
        <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Scroll</span>
        <div className="mx-auto mt-2 h-9 w-5 rounded-full border border-[var(--border)]">
          <motion.div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-[var(--gold)]" animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} />
        </div>
      </motion.div>
    </section>
  );
}
