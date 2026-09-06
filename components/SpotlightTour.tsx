"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TourStep = {
  id: string;
  title: string;
  desc: string;
};

export function SpotlightTour({ steps, onComplete, activeStep }: { steps: TourStep[]; onComplete: () => void; activeStep: number }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, align: "right" });

  useEffect(() => {
    if (activeStep <= 0 || activeStep > steps.length) return;
    const step = steps[activeStep - 1];
    const el = document.getElementById(step.id);
    
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const updateRect = () => {
      const r = el.getBoundingClientRect();
      setRect(r);
      
      // Smart positioning: put tooltip to the right, or bottom if no space
      const spaceRight = window.innerWidth - r.right;
      if (spaceRight > 320) {
        setTooltipPos({ top: r.top + r.height / 2, left: r.right + 20, align: "right" });
      } else {
        setTooltipPos({ top: r.bottom + 20, left: r.left + r.width / 2, align: "bottom" });
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [activeStep, steps]);

  if (activeStep <= 0 || activeStep > steps.length || !rect) return null;
  const step = steps[activeStep - 1];
  const isLast = activeStep === steps.length;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Dark overlay with spotlight cutout */}
      <div 
        className="absolute rounded-xl transition-all duration-300 ease-out"
        style={{
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          boxShadow: "0 0 0 9999px rgba(5, 8, 15, 0.85)",
          border: "2px solid var(--gold)",
        }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute z-[210] w-80 rounded-2xl border border-[var(--gold)]/40 bg-[#0B0F19] p-5 shadow-2xl"
        style={{
          top: tooltipPos.align === "right" ? tooltipPos.top - 60 : tooltipPos.top,
          left: tooltipPos.align === "right" ? tooltipPos.left : tooltipPos.left - 160,
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">Step {activeStep} of {steps.length}</span>
          <button onClick={onComplete} className="text-xs text-slate-500 hover:text-white">Skip</button>
        </div>
        <h3 className="text-lg font-bold text-white">{step.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
        
        <div className="mt-5 flex justify-between">
          <button onClick={onComplete} className="text-sm text-slate-500 hover:text-slate-300">Close</button>
          <button 
            onClick={() => isLast ? onComplete() : window.dispatchEvent(new CustomEvent("tour-next"))}
            className="rounded-lg bg-[var(--gold)] px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
          >
            {isLast ? "Finish Tour" : "Next →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
