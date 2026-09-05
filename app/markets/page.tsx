"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { GlowCard } from "@/components/GlowCard";
import { Sparkline } from "@/components/Sparkline";

type Asset = {
  id: string; symbol: string; name: string; class: string;
  price: number; change24h: number; marketCap: number | null; image?: string;
};

const CLASS_STYLE: Record<string, { grad: string; chip: string }> = {
  Crypto: { grad: "from-gold-light to-royal-violet", chip: "text-[var(--gold)]" },
  "US Stocks": { grad: "from-cyan-light to-royal-violet", chip: "text-[var(--cyan)]" },
  Commodities: { grad: "from-royal-violet to-gold-light", chip: "text-[var(--purple)]" },
};

const CLASS_VERSE: Record<string, string> = {
  Crypto: "A just weight is his delight. — Proverbs 11:1",
  "US Stocks": "The plans of the diligent lead surely to abundance. — Proverbs 21:5",
  Commodities: "The earth is the LORD's, and the fulness thereof. — Psalm 24:1",
};

const BIBLE_MARKETS = [
  { sym: "XAU", name: "Gold", verse: "More to be desired than much fine gold. — Psalm 19:10", story: "Solomon overlaid the temple with it. Kings measured wisdom by it. The AI weighs it every second." },
  { sym: "XAG", name: "Silver", verse: "The silver is mine, and the gold is mine. — Haggai 2:8", story: "Abraham paid 400 shekels of silver for the field of Machpelah — the first recorded purchase." },
  { sym: "WHEAT", name: "Wheat", verse: "Joseph gathered corn as the sand of the sea. — Genesis 41:49", story: "Seven fat years stored for seven lean — the first great stewardship of grain." },
  { sym: "WTI", name: "Oil", verse: "The wise took oil in their vessels. — Matthew 25:4", story: "Oil lit the temple lamps and the wise virgins' flames. It still moves the world." },
  { sym: "COPPER", name: "Copper", verse: "Out of the earth comes its copper. — Job 28:2", story: "The bronze sea and the temple pillars were cast from it — metalwork as worship." },
];

const fmt = (p: number) =>
  p >= 1000
    ? p.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtCap = (c: number | null) =>
  c == null ? "—" : c >= 1e12 ? `$${(c / 1e12).toFixed(2)}T` : c >= 1e9 ? `$${(c / 1e9).toFixed(1)}B` : `$${(c / 1e6).toFixed(1)}M`;

function seedSeries(price: number, change: number): number[] {
  const start = price / (1 + change / 100);
  const drift = (price - start) / 24;
  const pts: number[] = [];
  let v = start;
  for (let i = 0; i < 24; i++) {
    v += drift + (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * price * 0.0015;
    pts.push(v);
  }
  pts.push(price);
  return pts;
}

function AssetLogo({ a, size = "md" }: { a: Asset; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-6 w-6 text-[8px]" : size === "lg" ? "h-14 w-14 text-base" : "h-10 w-10 text-[10px]";
  const st = CLASS_STYLE[a.class] || CLASS_STYLE.Commodities;
  if (a.image)
    return <img src={a.image} alt={a.symbol} className={`${dim} rounded-full border border-[var(--border)] object-cover`} />;
  return (
    <div className={`grid ${dim} shrink-0 place-items-center rounded-full bg-gradient-to-br ${st.grad} font-extrabold text-[#0a0e27]`}>
      {a.symbol.slice(0, 3)}
    </div>
  );
}

function Monogram({ sym, cls, size = "md" }: { sym: string; cls: string; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-[10px]";
  const st = CLASS_STYLE[cls] || CLASS_STYLE.Commodities;
  return (
    <div className={`grid ${dim} shrink-0 place-items-center rounded-full bg-gradient-to-br ${st.grad} font-extrabold text-[#0a0e27] shadow-gold`}>
      {sym.slice(0, 3)}
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="tabular-nums text-[var(--gold)]">{now.toUTCString().slice(17, 25)} UTC</span>;
}

function AssetCard({ a, hist, flash }: { a: Asset; hist: Record<string, number[]>; flash: Record<string, string> }) {
  const up = a.change24h >= 0;
  const f = flash[a.id];
  return (
    <GlowCard className="p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <AssetLogo a={a} />
          <div>
            <p className="font-bold leading-tight">{a.symbol}</p>
            <p className="text-[11px] text-[var(--muted)]">{a.name}</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${up ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"}`}>
          {up ? "+" : ""}{a.change24h.toFixed(1)}%
        </span>
      </div>
      <p className={`mt-4 text-2xl font-extrabold tabular-nums ${f === "up" ? "animate-softglow" : f === "down" ? "animate-flashdown" : ""}`}>
        ${fmt(a.price)}
      </p>
      <p className="text-[11px] text-[var(--muted)]">Mcap {fmtCap(a.marketCap)}</p>
      <div className="mt-3"><Sparkline points={hist[a.id] || [a.price]} up={up} /></div>
    </GlowCard>
  );
}

export default function MarketsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [filter, setFilter] = useState("All");
  const [flash, setFlash] = useState<Record<string, string>>({});
  const [hist, setHist] = useState<Record<string, number[]>>({});
  const prevRef = useRef<Record<string, number>>({});

  async function load() {
    try {
      const res = await fetch("/api/markets", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const list: Asset[] = data.assets || [];
      setAssets(list);
      setClasses(data.classes || []);
      setUpdatedAt(new Date());

      const changes: Record<string, string> = {};
      for (const a of list) {
        const old = prevRef.current[a.id];
        if (old != null && old !== a.price) changes[a.id] = a.price > old ? "up" : "down";
        prevRef.current[a.id] = a.price;
      }
      if (Object.keys(changes).length) {
        setFlash(changes);
        setTimeout(() => setFlash({}), 900);
      }

      setHist((prev) => {
        const next: Record<string, number[]> = {};
        for (const a of list) {
          const old = prev[a.id];
          next[a.id] = old ? [...old.slice(-39), a.price] : seedSeries(a.price, a.change24h);
        }
        return next;
      });
    } catch {
      /* keep last good data */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const featured = assets.find((a) => a.class === "Crypto") || assets[0];
  const shown = filter === "All" ? classes : classes.filter((c) => c === filter);
  const sig = featured ? Math.min(97, Math.round(62 + Math.abs(featured.change24h) * 7)) : 0;

  return (
    <main>
      {/* ── TERMINAL HEADER ── */}
      <section className="container-wide pt-14 md:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-profit" /> Live markets
            </p>
            <h1 className="section-title mt-2 text-4xl md:text-6xl">
              Every market the AI <span className="gradient-text">watches</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
              From the gold of Solomon to the silicon of today — every asset below is weighed with honest scales, watched around the clock, and traded with guardrails on.
            </p>
          </div>
          <div className="glass flex items-center gap-4 rounded-full px-5 py-2.5 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5 font-bold text-profit">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-profit" /> LIVE
            </span>
            <span>Updated {updatedAt ? updatedAt.toLocaleTimeString() : "—"}</span>
            <LiveClock />
          </div>
        </div>
      </section>

      {/* ── LOGO MARQUEE TICKER ── */}
      {assets.length > 0 && (
        <div className="ticker-fade mt-8 overflow-hidden border-y border-[var(--border)] bg-white/[0.02] py-3">
          <div className="ticker">
            {[...assets, ...assets].map((a, i) => (
              <span key={i} className="flex items-center gap-2.5 text-xs text-[var(--muted)]">
                <AssetLogo a={a} size="sm" />
                <b className="text-[var(--fg)]">{a.symbol}</b> ${fmt(a.price)}
                <i className={`not-italic font-bold ${a.change24h >= 0 ? "text-profit" : "text-loss"}`}>
                  {a.change24h >= 0 ? "+" : ""}{a.change24h.toFixed(1)}%
                </i>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── LOGO WALL ── */}
      {assets.length > 0 && (
        <section className="container-wide pt-10">
          <Reveal variant="up">
            <div className="text-center">
              <h2 className="section-title text-3xl md:text-5xl">{assets.length} markets. <span className="gradient-text">One disciplined AI.</span></h2>
            </div>
            <div className="mt-8 flex flex-wrap items-start justify-center gap-x-5 gap-y-6">
              {assets.map((a) => (
                <div key={a.id} className="group flex w-16 flex-col items-center gap-2" title={a.name}>
                  <div className="transition duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(245,201,123,.55)]">
                    <AssetLogo a={a} />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--muted)] transition group-hover:text-[var(--gold)]">{a.symbol}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── AI SPOTLIGHT ── */}
      {featured && (
        <section className="container-wide pt-10">
          <Reveal variant="up">
            <GlowCard className="p-6 md:p-8">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <p className="eyebrow">AI spotlight</p>
                  <div className="mt-4 flex items-center gap-4">
                    <AssetLogo a={featured} size="lg" />
                    <div>
                      <h2 className="text-2xl font-extrabold">{featured.name}</h2>
                      <p className="text-xs text-[var(--muted)]">{featured.class} · {featured.symbol}</p>
                    </div>
                  </div>
                  <p className={`mt-5 text-5xl font-extrabold tabular-nums md:text-6xl ${flash[featured.id] === "up" ? "animate-softglow" : flash[featured.id] === "down" ? "animate-flashdown" : ""}`}>
                    ${fmt(featured.price)}
                  </p>
                  <p className={`mt-2 text-sm font-bold ${featured.change24h >= 0 ? "text-profit" : "text-loss"}`}>
                    {featured.change24h >= 0 ? "▲ +" : "▼ "}{featured.change24h.toFixed(2)}% · 24h
                  </p>
                </div>
                <div>
                  <div className="h-28 md:h-32">
                    <Sparkline points={hist[featured.id] || [featured.price]} up={featured.change24h >= 0} />
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                      <span>Signal strength</span>
                      <span className="font-bold text-[var(--gold)]">{sig}%</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-[var(--border)]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${sig}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-gold-light to-cyan-light"
                      />
                    </div>
                    <p className="mt-3 text-[11px] text-[var(--muted)]">Refreshes every 3 seconds · Mcap {fmtCap(featured.marketCap)}</p>
                  </div>
                </div>
              </div>
            </GlowCard>
          </Reveal>
        </section>
      )}

      {/* ── FILTERS ── */}
      <section className="container-wide pt-10">
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...classes].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pill transition ${filter === f ? "!border-[var(--gold)] !text-[var(--gold)] bg-[var(--gold)]/10" : "hover:border-[var(--gold)]/50 hover:text-[var(--gold)]"}`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto hidden text-xs text-[var(--muted)] md:block">{assets.length} assets tracked</span>
        </div>
      </section>

      {/* ── ASSET GROUPS (with class verses) ── */}
      <div className="container-wide space-y-12 pb-4 pt-8">
        {shown.map((cls) => {
          const list = assets.filter((a) => a.class === cls);
          if (!list.length) return null;
          const st = CLASS_STYLE[cls] || CLASS_STYLE.Commodities;
          return (
            <section key={cls}>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">{cls}</h3>
                <span className={`text-xs ${st.chip}`}>{list.length} assets</span>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
              </div>
              <p className="mt-1 text-xs italic text-[var(--gold)]">{CLASS_VERSE[cls]}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((a, i) => (
                  <Reveal key={a.id} variant="up" index={i % 4}>
                    <AssetCard a={a} hist={hist} flash={flash} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── MARKETS OF THE BIBLE ── */}
      <section className="container-wide py-12">
        <div className="text-center">
          <p className="eyebrow">From scripture to screen</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">Markets of the <span className="gradient-text">Bible</span>, trading today</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--muted)]">The same metals, grains and oils that moved kingdoms still move markets — and the AI trades them with the same discipline.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {BIBLE_MARKETS.map((m, i) => {
            const live = assets.find((x) => x.symbol === m.sym);
            return (
              <Reveal key={m.sym} variant="up" index={i}>
                <GlowCard className="flex h-full flex-col p-5">
                  <div className="flex items-center gap-3">
                    <Monogram sym={m.sym} cls="Commodities" />
                    <div>
                      <p className="font-bold leading-tight">{m.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">{m.sym}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs italic leading-relaxed text-[var(--gold)]">{m.verse}</p>
                  <p className="mt-3 flex-1 text-xs leading-relaxed text-[var(--muted)]">{m.story}</p>
                  {live && (
                    <p className="mt-4 rounded-full border border-[var(--border)] bg-[var(--bg)]/50 px-3 py-1 text-center text-[11px] font-bold text-[var(--profit)]">
                      Live on KTX · ${fmt(live.price)}
                    </p>
                  )}
                </GlowCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── TRANSPARENCY BAND ── */}
      <section className="container-wide py-12">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal variant="left">
            <p className="eyebrow">Honest in all sight</p>
            <h2 className="section-title mt-2 text-3xl md:text-5xl">Nothing hidden, <span className="gradient-text">nothing hyped</span></h2>
            <p className="mt-4 text-sm italic leading-relaxed text-[var(--muted)]">
              "Providing for honest things, not only in the sight of the Lord, but also in the sight of men." — 2 Corinthians 8:21
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex gap-3"><span className="text-[var(--gold)]">✦</span> Live prices refreshed every 3 seconds — no stale screens.</li>
              <li className="flex gap-3"><span className="text-[var(--gold)]">✦</span> Every AI trade logged with entry, exit and hold time.</li>
              <li className="flex gap-3"><span className="text-[var(--gold)]">✦</span> Your profit shown daily, withdrawable daily.</li>
            </ul>
          </Reveal>
          <Reveal variant="right">
            <div className="card p-8 text-center md:p-10">
              <p className="text-2xl font-light italic leading-snug md:text-3xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                "More to be desired are they than gold, yea, than much fine gold."
              </p>
              <p className="eyebrow mt-5">Psalm 19:10</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ENGINE CTA ── */}
      <Reveal as="section" variant="blur" className="container-wide py-14">
        <div className="card-grad flex flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <p className="eyebrow">The engine</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              Watch the AI trade <span className="gradient-text">these exact markets</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Every signal, entry and exit — logged and visible, around the clock.</p>
          </div>
          <a href="/ai-trading" className="btn-primary shrink-0">Watch the engine trade</a>
        </div>
      </Reveal>
    </main>
  );
}
