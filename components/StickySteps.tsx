"use client";

import { useRef } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { IllGiftHalo, IllPillars, IllEyeScan, IllTree } from "@/components/Illustrations";

interface Step {
  num: string;
  title: string;
  subtitle: string;
  body: string;
  bullets: string[];
  icon: string;
  color: string;
}

const ICONS: Record<string, (props: { className?: string }) => JSX.Element> = {
  IllGiftHalo,
  IllPillars,
  IllEyeScan,
  IllTree,
};

function GlyphItem({ step, progress, index, total }: { step: Step; progress: MotionValue<number>; index: number; total: number }) {
  const seg = 1 / total;
  const a = index * seg;
  const b = a + seg * 0.3;
  const c = a + seg * 0.92;
  const d = Math.min(1, a + seg * 1.1);
  
  const opacity = useTransform(progress, [a, b, c, d], index === 0 ? [1, 1, 1, 0] : [0, 1, 1, index === total - 1 ? 1 : 0]);
  const scale = useTransform(progress, [a, b], [0.72, 1]);
  const IconComponent = ICONS[step.icon];
  
  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 grid place-items-center">
      <div className="relative flex items-center justify-center">
        <div 
          className="absolute rounded-full blur-3xl opacity-30" 
          style={{ 
            backgroundColor: step.color,
            width: '24rem',
            height: '24rem',
          }} 
        />
        <div 
          className="absolute rounded-full border-2 opacity-20" 
          style={{ 
            borderColor: step.color,
            width: '20rem',
            height: '20rem',
            animation: 'spin 30s linear infinite',
          }} 
        />
        <div 
          className="absolute rounded-full border opacity-30" 
          style={{ 
            borderColor: step.color,
            width: '16rem',
            height: '16rem',
            animation: 'spin 25s linear infinite reverse',
          }} 
        />
        {IconComponent && <IconComponent className="relative w-96 h-96 md:w-[32rem] md:h-[32rem]" />}
      </div>
    </motion.div>
  );
}

function StepText({ step, progress, index, total }: { step: Step; progress: MotionValue<number>; index: number; total: number }) {
  const seg = 1 / total;
  const a = index * seg;
  const b = a + seg * 0.3;
  const c = a + seg * 0.9;
  const d = Math.min(1, a + seg * 1.1);
  
  const opacity = useTransform(progress, [a, b, c, d], index === 0 ? [1, 1, 1, 0] : [0, 1, 1, index === total - 1 ? 1 : 0]);
  const y = useTransform(progress, [a, b], [36, 0]);
  
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <span 
          className="text-6xl font-black opacity-20" 
          style={{ color: step.color }}
        >
          {step.num}
        </span>
        <span className="eyebrow" style={{ color: step.color }}>Step {step.num}</span>
      </div>
      
      <h3 className="text-4xl font-bold tracking-tight md:text-6xl mb-3">{step.title}</h3>
      
      <p className="text-base font-semibold uppercase tracking-widest mb-4" style={{ color: step.color }}>
        {step.subtitle}
      </p>
      
      <p className="max-w-lg text-base leading-relaxed text-[var(--muted)] mb-6">{step.body}</p>
      
      <ul className="space-y-2 mb-6">
        {step.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: step.color }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-[var(--fg)]">{bullet}</span>
          </li>
        ))}
      </ul>
      
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                backgroundColor: i === index ? step.color : 'var(--border)',
                width: i === index ? '2rem' : '0.5rem',
              }}
            />
          ))}
        </div>
        <span className="ml-2">{index + 1} of {total}</span>
      </div>
    </motion.div>
  );
}

export function StickySteps({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const total = steps.length;

  return (
    <div ref={ref} className="relative" style={{ height: `${total * 100 + 80}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} 
          />
        </div>
        
        <div className="container-wide grid items-center gap-16 md:grid-cols-2 relative z-10">
          <div className="relative mx-auto" style={{ width: '24rem', height: '24rem' }}>
            {steps.map((step, i) => (
              <GlyphItem key={step.num} step={step} progress={scrollYProgress} index={i} total={total} />
            ))}
          </div>
          
          <div className="relative" style={{ height: '32rem' }}>
            {steps.map((step, i) => (
              <StepText key={step.num} step={step} progress={scrollYProgress} index={i} total={total} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
