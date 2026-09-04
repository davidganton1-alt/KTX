"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxOrbs() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 4000], [0, -400]);
  const y2 = useTransform(scrollY, [0, 4000], [0, -700]);
  const y3 = useTransform(scrollY, [0, 4000], [0, -250]);
  const orb = "pointer-events-none fixed rounded-full mix-blend-screen blur-[90px] opacity-30";

  return (
    <div className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden" aria-hidden>
      <motion.div className={orb} style={{ y: y1, width: 560, height: 560, top: "-8%", left: "4%", background: "var(--gold)" }} />
      <motion.div className={orb} style={{ y: y2, width: 640, height: 640, top: "38%", right: "-10%", background: "var(--cyan)" }} />
      <motion.div className={orb} style={{ y: y3, width: 520, height: 520, bottom: "-12%", left: "28%", background: "var(--purple)" }} />
    </div>
  );
}
