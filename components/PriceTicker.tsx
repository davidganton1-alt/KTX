"use client";

import { useEffect, useRef, useState } from "react";

type Asset = { symbol: string; price: number; change24h: number | null; class: string };

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 4 : 2,
  });
}

export function PriceTicker() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/markets");
        const json = await res.json();
        if (active) setAssets(json.assets ?? []);
      } catch {
        /* ignore */
      }
    }
    load();
    const t = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  if (assets.length === 0) {
    return (
      <div className="h-9 border-b border-[var(--border)] bg-[var(--bg)]" />
    );
  }

  // duplicate the list so the marquee loops seamlessly
  const row = [...assets, ...assets];

  return (
    <div className="ticker-fade relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg)]/70 backdrop-blur">
      <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap py-2">
        {row.map((a, i) => (
          <span key={i} className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-[var(--fg)]">{a.symbol}</span>
            <span className="text-[var(--muted)]">{fmt(a.price)}</span>
            <span className={(a.change24h ?? 0) >= 0 ? "text-profit" : "text-loss"}>
              {(a.change24h ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(a.change24h ?? 0).toFixed(2)}%
            </span>
            <span className="text-[var(--border)]">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
