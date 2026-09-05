"use client";

import { useEffect, useRef, useState } from "react";
import { AssetBadge } from "@/components/AssetBadge";
import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";

type Asset = {
  id: string;
  symbol: string;
  name: string;
  class: "Crypto" | "US Stocks" | "Commodities";
  price: number;
  change24h: number | null;
  marketCap: number | null;
  image?: string;
};

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
}

function fmtBig(n: number | null) {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return fmtUsd(n);
}

const GROUPS: { key: Asset["class"]; icon: any; title: string; blurb: string }[] = [
  { key: "Crypto", icon: "coins", title: "Crypto", blurb: "Digital assets the engine reads second by second." },
  { key: "US Stocks", icon: "chart", title: "US Stocks", blurb: "Blue-chip and mega-cap equities across the market." },
  { key: "Commodities", icon: "spark", title: "Commodities", blurb: "Hard assets: metals, energy and the harvest." },
];

export default function MarketsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [flash, setFlash] = useState<Record<string, "up" | "down">>({});
  const [filter, setFilter] = useState<"All" | Asset["class"]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<number | null>(null);
  const prevPrices = useRef<Record<string, number>>({});

  async function load() {
    try {
      const res = await fetch("/api/markets");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load markets");
      const next = json.assets as Asset[];
      const f: Record<string, "up" | "down"> = {};
      for (const a of next) {
        const prev = prevPrices.current[a.id];
        if (prev != null && a.price !== prev) f[a.id] = a.price > prev ? "up" : "down";
        prevPrices.current[a.id] = a.price;
      }
      setFlash(f);
      setAssets(next);
      setUpdated(Date.now());
      setError(null);
      window.setTimeout(() => setFlash({}), 600);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const shown = filter === "All" ? assets : assets.filter((a) => a.class === filter);
  const gainers = assets.filter((a) => (a.change24h ?? 0) >= 0).length;
  const losers = assets.length - gainers;
  const movers = [...assets].sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
  const best = movers[0];
  const worst = movers[movers.length - 1];

  const ticker = assets.length ? [...assets, ...assets] : [];

  return (
    <Reveal as="main" variant="up" className="container-wide py-16">
      {/* HERO */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-4">
            <SectionIcon name="globe" size={56} />
          </div>
          <p className="eyebrow">The watched markets</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">
            Live <span className="gradient-text">Markets</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            The engine trades across crypto, US stocks and commodities, reading each
            market every second with the patience of a steward. Prices refresh live
            every 3 seconds; green and red flash as they move.
          </p>
        </div>
        <div className="text-xs text-[var(--muted)]">
          {updated && (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-profit" />
              Updated {new Date(updated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* TICKER */}
      {assets.length > 0 && (
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] py-3">
          <div className="ticker">
            {ticker.map((a, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm">
                <AssetBadge symbol={a.symbol} assetClass={a.class} size={22} image={a.image} />
                <span className="font-semibold">{a.symbol}</span>
                <span className="text-[var(--muted)]">{fmtUsd(a.price)}</span>
                <span className={(a.change24h ?? 0) >= 0 ? "text-profit" : "text-loss"}>
                  {(a.change24h ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(a.change24h ?? 0).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Markets watched</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--gold)]">{assets.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Advancing</p>
          <p className="mt-2 text-3xl font-extrabold text-profit">{gainers}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Declining</p>
          <p className="mt-2 text-3xl font-extrabold text-loss">{losers}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Top mover</p>
          <p className="mt-2 truncate text-lg font-bold">
            {best?.symbol}{" "}
            <span className="text-profit">+{(best?.change24h ?? 0).toFixed(1)}%</span>
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="mt-8 flex flex-wrap gap-2">
        {(["All", "Crypto", "US Stocks", "Commodities"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === c
                ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--gold)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-loss/40 bg-loss/10 p-3 text-sm text-loss">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-10 text-[var(--muted)]">Loading markets…</p>
      ) : (
        <>
          {GROUPS.filter((g) => filter === "All" || filter === g.key).map((g) => {
            const items = shown.filter((a) => a.class === g.key);
            if (!items.length) return null;
            return (
              <section key={g.key} className="mt-12">
                <div className="mb-5 flex items-center gap-3">
                  <SectionIcon name={g.icon} size={40} />
                  <div>
                    <h2 className="text-xl font-bold">{g.title}</h2>
                    <p className="text-xs text-[var(--muted)]">{g.blurb}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((a) => (
                    <div
                      key={a.id}
                      className={`card flex flex-col gap-3 p-5 transition hover:-translate-y-1 ${
                        flash[a.id] === "up"
                          ? "border-profit/60"
                          : flash[a.id] === "down"
                          ? "border-loss/60"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AssetBadge symbol={a.symbol} assetClass={a.class} size={40} image={a.image} />
                          <div>
                            <div className="font-semibold">{a.symbol}</div>
                            <div className="text-xs text-[var(--muted)]">{a.name}</div>
                          </div>
                        </div>
                        <span className="rounded-full bg-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                          {a.class}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div
                          className={`text-xl font-bold transition-colors duration-300 ${
                            flash[a.id] === "up" ? "text-profit" : flash[a.id] === "down" ? "text-loss" : ""
                          }`}
                        >
                          {fmtUsd(a.price)}
                        </div>
                        <div className={`text-sm ${(a.change24h ?? 0) >= 0 ? "text-profit" : "text-loss"}`}>
                          {(a.change24h ?? 0) >= 0 ? "+" : ""}
                          {(a.change24h ?? 0).toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                        <span>{a.marketCap != null ? `Mkt cap ${fmtBig(a.marketCap)}` : "Spot commodity"}</span>
                        <span className="text-[var(--gold)]">engine watches</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {filter === "All" && best && worst && (
            <section className="mt-12 grid gap-4 md:grid-cols-2">
              <div className="card-grad flex items-center gap-4 p-6">
                <AssetBadge symbol={best.symbol} assetClass={best.class} size={48} image={best.image} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-profit">Strongest today</p>
                  <p className="text-lg font-bold">
                    {best.name} <span className="text-profit">+{(best.change24h ?? 0).toFixed(2)}%</span>
                  </p>
                </div>
              </div>
              <div className="card-grad flex items-center gap-4 p-6">
                <AssetBadge symbol={worst.symbol} assetClass={worst.class} size={48} image={worst.image} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-loss">Softest today</p>
                  <p className="text-lg font-bold">
                    {worst.name} <span className="text-loss">{(worst.change24h ?? 0).toFixed(2)}%</span>
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <div className="mt-12 card-grad p-6 text-center md:p-8">
        <p className="text-sm text-[var(--muted)]">
          &ldquo;The wise store up choice food and olive oil, but fools gulp theirs
          down.&rdquo; <span className="text-[var(--gold)]">— Proverbs 21:20</span>
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--muted)]">
          Markets are a trust to be tended, not chased. The engine holds this posture:
          patient entries, disciplined sizing, and daily profit you can withdraw.
        </p>
        <a href="/ai-trading" className="btn-gold mt-5 inline-flex">
          Watch the engine trade
        </a>
      </div>
    </Reveal>
  );
}
