"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Phase K-revert: opt-in animated features for /markets charts only.
// Defaults preserve the original static look for every other consumer
// (e.g. the homepage preview). MarketsClient passes smooth / liveDot / label:
//   smooth  - normalize to a fixed-length path so price updates morph, not jump
//   liveDot - settle + breathing glow on the latest point (drawn after mount)
//   label   - hover tooltip (smooth fade in/out)

const SAMPLES = 24; // fixed path length -> framer-motion can interpolate `d`

function resample(points: number[], n: number): number[] {
  if (points.length === 0) return new Array(n).fill(0);
  if (points.length === 1) return new Array(n).fill(points[0]);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (points.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(lo + 1, points.length - 1);
    out.push(points[lo] + (points[hi] - points[lo]) * (t - lo));
  }
  return out;
}

function toPath(vals: number[], W: number, H: number): string {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  return vals
    .map((p, i) => `${i === 0 ? "M" : "L"}${((i / (vals.length - 1)) * W).toFixed(1)},${(H - ((p - min) / range) * (H - 6) - 3).toFixed(1)}`)
    .join(" ");
}

export function Sparkline({
  points,
  up = true,
  smooth = false,
  liveDot = false,
  label,
}: {
  points: number[];
  up?: boolean;
  smooth?: boolean;
  liveDot?: boolean;
  label?: string;
}) {
  const [hover, setHover] = useState(false);
  const W = 120, H = 40;
  const color = up ? "var(--profit)" : "var(--loss)";

  // Smooth mode: fixed point count so the `d` string has an identical command
  // structure every update -> framer-motion morphs instead of jumping.
  const vals = useMemo(
    () => (smooth ? resample(points, SAMPLES) : points.length ? points : [0]),
    [points, smooth]
  );
  const d = useMemo(() => toPath(vals, W, H), [vals]);

  const lastY = useMemo(() => {
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const range = max - min || 1;
    const p = vals[vals.length - 1];
    return H - ((p - min) / range) * (H - 6) - 3;
  }, [vals]);

  return (
    <div
      className="relative"
      onMouseEnter={liveDot ? () => setHover(true) : undefined}
      onMouseLeave={liveDot ? () => setHover(false) : undefined}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-10 w-full">
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1, d }}
          viewport={{ once: true }}
          transition={{
            pathLength: { duration: 1.5, ease: "easeInOut" },
            d: { duration: 0.9, ease: "easeInOut" },
          }}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        />
        {liveDot && (
          <motion.circle
            cx={W}
            cy={lastY}
            r={2}
            fill={color}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [1, 0.5, 1], scale: 1 }}
            transition={{
              opacity: { delay: 1.8, duration: 3, repeat: Infinity, ease: "easeInOut" },
              scale: { delay: 1.3, duration: 0.5, ease: "easeOut" },
            }}
            style={{ transformOrigin: `${W}px ${lastY}px`, filter: `drop-shadow(0 0 4px ${color})` }}
          />
        )}
      </svg>
      <AnimatePresence>
        {liveDot && hover && label && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none absolute -top-7 right-0 z-10 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--bg-soft)] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--fg)] shadow-lg"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
