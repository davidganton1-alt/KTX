"use client";
import { ReactNode, useRef } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";

function Line({ children, progress, index, total }: {
  children: ReactNode; progress: MotionValue<number>; index: number; total: number;
}) {
  const seg = 0.86 / total;
  const a = index * seg, b = a + seg * 0.3, c = a + seg * 0.8, d = a + seg * 1.05;
  const isLast = index === total - 1;
  const opacity = useTransform(progress, [a, b, c, isLast ? 9 : d], isLast ? [0, 1, 1, 1] : [0, 1, 1, 0]);
  const y = useTransform(progress, [a, b], [44, 0]);
  const blur = useTransform(progress, [a, b], [10, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.h1
      style={{ opacity, y, filter }}
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl lg:text-8xl"
    >
      {children}
    </motion.h1>
  );
}

export function HeroLines({ lines }: { lines: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} style={{ height: `${110 * lines.length + 120}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center justify-center">
        {lines.map((l, i) => (
          <Line key={i} progress={scrollYProgress} index={i} total={lines.length}>{l}</Line>
        ))}
      </div>
    </div>
  );
}
