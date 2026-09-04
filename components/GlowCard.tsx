"use client";
import { ReactNode, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function GlowCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 180, damping: 22 });
  const bg = useTransform([px, py], ([x, y]) =>
    `radial-gradient(320px circle at ${x}% ${y}%, rgba(245,201,123,.14), transparent 65%)`
  );

  function onMove(e: React.MouseEvent) {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mx.set(x); my.set(y); px.set(x * 100); py.set(y * 100);
  }

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); mx.set(0.5); my.set(0.5); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`card relative overflow-hidden ${className}`}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{ background: bg, opacity: hover ? 1 : 0 }}
        />
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  );
}
