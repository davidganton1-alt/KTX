"use client";

import { useEffect, useRef, useState } from "react";

// Smoothly counts up/down to `value` and pulses a soft glow when it rises.
export function AnimatedNumber({
  value,
  prefix = "",
  decimals = 2,
  className = "",
}: {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const [pulse, setPulse] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    if (to > from) {
      setPulse(true);
      const t = window.setTimeout(() => setPulse(false), 900);
      // cleanup below
      prev.current = to;
      // animate
      const start = performance.now();
      const dur = 600;
      let raf = 0;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(from + (to - from) * eased);
        if (p < 1) raf = requestAnimationFrame(step);
        else setDisplay(to);
      };
      raf = requestAnimationFrame(step);
      return () => {
        window.clearTimeout(t);
        cancelAnimationFrame(raf);
      };
    }
    prev.current = to;
    setDisplay(to);
  }, [value]);

  return (
    <span
      className={`${className} ${pulse ? "animate-softglow" : ""}`}
      style={{
        transition: "text-shadow 0.3s ease, color 0.3s ease",
      }}
    >
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
