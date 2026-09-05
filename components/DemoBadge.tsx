"use client";
import { useEffect, useState } from "react";

export function DemoBadge() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    fetch("/api/admin/engine-mode", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setShow(d.engineMode === "demo"))
      .catch(() => setShow(true));
  }, []);
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
      Demo engine · simulated executions on live data
    </span>
  );
}
