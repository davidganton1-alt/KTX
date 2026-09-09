"use client";

import { useRef } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { IllGiftHalo, IllPillars, IllEyeScan, IllTree } from "@/components/Illustrations";

interface Step {
  num: string;
  title: string;
  subtitle: string;
  body: string;
  icon: string;
  color: string;
}

const ICONS: Record<string, (props: { className?: string }) => JSX.Element> = { IllGiftHalo, IllPillars, IllEyeScan, IllTree };

function GlyphItem({ step, progress, index, total }: { step: Step; progress: MotionValue<number>; index: number; total: number }) {
  const seg = 1 / total, a = index * seg, b = a + seg * 0.3, c = a + seg * 0.92, d = Math.min(1, a + seg * 1.1);
  const opacity = useTransform(progress, [a, b, c, d], index === 0 ? [1, 1, 1, 0] : [0, 1, 1, index === total - 1 ? 1 : 0]);
  const scale = useTransform(progress, [a, b], [0.72, 1]);
  const IconComponent = ICONS[step.icon];

  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 grid place-items-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-3xl opacity-30" style={{ backgroundColor: step.color }} />
        {IconComponent && <IconComponent className="relative w-48 h-48 md:w-64 md:h-64" />}
      </div>
    </motion.div>
  );
}

function StepText({ step, progress, index, total }: { step: Step; progress: MotionValue<number>; index: number; total: number }) {
  const seg = 1 / total, a = index * seg, b = a + seg * 0.3, c = a + seg * 0.9, d = Math.min(1, a + seg * 1.1);
  const opacity = useTransform(progress, [a, b, c, d], index === 0 ? [1, 1, 1, 0] : [0, 1, 1, index === total - 1 ? 1 : 0]);
  const y = useTransform(progress, [a, b], [36, 0]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <span className="eyebrow" style={{ color: step.color }}>Step {step.num}</span>
      <h3 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{step.title}</h3>
      <p className="mt-2 text-sm font-medium uppercase tracking-widest" style={{ color: step.color }}>
        {step.subtitle}
      </p>
      <p className="mt-4 max-w-md leading-relaxed text-[var(--muted)]">{step.body}</p>
    </motion.div>
  );
}

export function StickySteps({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const total = steps.length;

  return (
    <div ref={ref} className="relative" style={{ height: `${total * 90 + 60}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        </div>
        <div className="container-wide grid items-center gap-10 md:grid-cols-2 relative z-10">
          <div className="relative mx-auto h-56 w-56 md:h-80 md:w-80">
            {steps.map((step, i) => (
              <GlyphItem key={step.num} step={step} progress={scrollYProgress} index={i} total={total} />
            ))}
          </div>
          <div className="relative h-64 md:h-72">
            {steps.map((step, i) => (
              <StepText key={step.num} step={step} progress={scrollYProgress} index={i} total={total} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
