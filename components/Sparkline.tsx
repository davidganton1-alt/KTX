"use client";
import { motion } from "framer-motion";

export function Sparkline({ points, up = true }: { points: number[]; up?: boolean }) {
  const max = Math.max(...points), min = Math.min(...points);
  const W = 120, H = 40;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${((i / (points.length - 1)) * W).toFixed(1)},${(H - ((p - min) / (max - min || 1)) * (H - 6) - 3).toFixed(1)}`)
    .join(" ");
  const color = up ? "var(--profit)" : "var(--loss)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-10 w-full">
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    </svg>
  );
}
