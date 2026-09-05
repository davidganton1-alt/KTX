"use client";
import { ReactNode, useMemo, useRef } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "@/components/Logo";
import { FloatingCards } from "@/components/FloatingCards";

function Phase({ children, p, a, b, c, d, hold = false, className = "" }: {
  children: ReactNode; p: MotionValue<number>;
  a: number; b: number; c: number; d: number; hold?: boolean; className?: string;
}) {
  const opacity = useTransform(p, [a, b, c, d], [0, 1, 1, hold ? 1 : 0]);
  const y = useTransform(p, [a, b], [36, 0]);
  const blur = useTransform(p, [a, b], [10, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  return (
    <motion.div style={{ opacity, y, filter }} className={`absolute inset-x-0 px-6 ${className}`}>
      {children}
    </motion.div>
  );
}

export function CinematicHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const logoScale = useTransform(scrollYProgress, [0, 0.16], [1, 0.42]);
  const logoY = useTransform(scrollYProgress, [0, 0.16], [0, -190]);
  const logoDim = useTransform(scrollYProgress, [0.02, 0.16], [1, 0.45]);
  const pillOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);
  const cardsOpacity = useTransform(scrollYProgress, [0.16, 0.24, 0.78, 0.86], [0, 1, 1, 0]);

  const motes = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({
      left: `${(i * 41 + 7) % 100}%`,
      dur: `${9 + (i % 7) * 2.4}s`,
      delay: `-${((i * 1.7) % 18).toFixed(1)}s`,
      size: `${1 + (i % 3)}px`,
    })),
    []
  );

  return (
    <div ref={ref} className="relative" style={{ height: "340vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ambient layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0" style={{ background: "radial-gradient(1000px 560px at 50% 32%, rgba(22,27,69,0.85), transparent 70%)" }} />
          <div className="site-bg-motes">
            {motes.map((m, i) => (
              <span key={i} className="mote" style={{ left: m.left, animationDuration: m.dur, animationDelay: m.delay, width: m.size, height: m.size }} />
            ))}
          </div>
        </div>

        {/* pill */}
        <motion.div style={{ opacity: pillOpacity }} className="absolute inset-x-0 top-[9%] flex justify-center">
          <span className="pill"><span className="h-2 w-2 animate-pulse rounded-full bg-profit" /> Faith-aligned AI trading · Live 24/7</span>
        </motion.div>

        {/* logo: shrinks and rises as scroll begins */}
        <motion.div style={{ scale: logoScale, y: logoY, opacity: logoDim }} className="absolute inset-x-0 top-1/2 -mt-[140px] flex justify-center">
          <Logo size={280} />
        </motion.div>

        {/* floating trade cards appear mid-scroll */}
        <motion.div style={{ opacity: cardsOpacity }} className="absolute inset-0">
          <FloatingCards />
        </motion.div>

        {/* scroll-driven text sequence */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Phase p={scrollYProgress} a={0.14} b={0.2} c={0.32} d={0.38}>
            <h1 className="text-center text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">Fund it.</h1>
          </Phase>
          <Phase p={scrollYProgress} a={0.36} b={0.42} c={0.54} d={0.6}>
            <h1 className="text-center text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">The <span className="gradient-text">AI</span> trades.</h1>
          </Phase>
          <Phase p={scrollYProgress} a={0.62} b={0.68} c={0.78} d={0.84}>
            <h1 className="text-center text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">You withdraw the <span className="gradient-text">profit.</span></h1>
          </Phase>
          <Phase p={scrollYProgress} a={0.84} b={0.92} c={2} d={3} hold>
            <div className="pointer-events-auto flex flex-col items-center gap-5">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="/register" className="btn-primary">Get $50 free</a>
                <a href="#how" className="btn-ghost">How it works</a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-2"><span className="text-[var(--gold)]">●</span> Crypto · Stocks · Commodities</span>
                <span className="flex items-center gap-2"><span className="text-[var(--gold)]">●</span> Daily profit, withdraw anytime</span>
                <span className="flex items-center gap-2"><span className="text-[var(--gold)]">●</span> Full trade transparency</span>
              </div>
            </div>
          </Phase>
        </div>

        {/* scroll hint */}
        <motion.div style={{ opacity: hintOpacity }} className="absolute inset-x-0 bottom-6 flex justify-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">Scroll ↓</span>
        </motion.div>
      </div>
    </div>
  );
}
