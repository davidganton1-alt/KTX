"use client";
import { useRef } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";

export type StickyStep = { num: string; title: string; body: string; glyph: string; color: string };

function GlyphItem({ step, progress, index, total }: { step: StickyStep; progress: MotionValue<number>; index: number; total: number }) {
  const seg = 1 / total, a = index * seg, b = a + seg * 0.3, c = a + seg * 0.92, d = Math.min(1, a + seg * 1.1);
  const opacity = useTransform(progress, [a, b, c, d], index === 0 ? [1, 1, 1, 0] : [0, 1, 1, index === total - 1 ? 1 : 0]);
  const scale = useTransform(progress, [a, b], [0.72, 1]);
  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 grid place-items-center">
      <span className="text-[7rem] leading-none md:text-[9rem]" style={{ color: step.color, textShadow: `0 0 90px ${step.color}66` }}>
        {step.glyph}
      </span>
    </motion.div>
  );
}

function StepText({ step, progress, index, total }: { step: StickyStep; progress: MotionValue<number>; index: number; total: number }) {
  const seg = 1 / total, a = index * seg, b = a + seg * 0.3, c = a + seg * 0.9, d = Math.min(1, a + seg * 1.1);
  const opacity = useTransform(progress, [a, b, c, d], index === 0 ? [1, 1, 1, 0] : [0, 1, 1, index === total - 1 ? 1 : 0]);
  const y = useTransform(progress, [a, b], [36, 0]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <span className="eyebrow" style={{ color: step.color }}>Step {step.num}</span>
      <h3 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{step.title}</h3>
      <p className="mt-4 max-w-md leading-relaxed text-[var(--muted)]">{step.body}</p>
    </motion.div>
  );
}

export function StickySteps({ steps }: { steps: StickyStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = steps.length;
  return (
    <div ref={ref} style={{ height: `${n * 90 + 60}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-wide grid items-center gap-10 md:grid-cols-2">
          <div className="relative mx-auto h-56 w-56 md:h-80 md:w-80">
            {steps.map((s, i) => <GlyphItem key={s.num} step={s} progress={scrollYProgress} index={i} total={n} />)}
          </div>
          <div className="relative h-64 md:h-72">
            {steps.map((s, i) => <StepText key={s.num} step={s} progress={scrollYProgress} index={i} total={n} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
