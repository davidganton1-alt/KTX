"use client";

import { useEffect, useRef } from "react";

export type RevealVariant =
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale"
  | "blur"
  | "none";

/**
 * Scroll-triggered reveal using a lightweight IntersectionObserver + CSS.
 * SSR renders the hidden state (opacity:0) and the client adds `.in` when the
 * element enters the viewport, so there is no hydration mismatch and no heavy
 * animation library on the critical path. Vary `variant` per page for a distinct
 * motion flavour; use `index` for stagger.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  index,
  className,
  as: As = "div",
  id,
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  index?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "main";
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = As as any;
  const d = index != null ? index * 0.08 : delay;
  const style = d ? { transitionDelay: `${d}s` } : undefined;

  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal reveal-${variant}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
