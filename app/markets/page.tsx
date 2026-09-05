"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { GlowCard } from "@/components/GlowCard";
import { Sparkline } from "@/components/Sparkline";
import { AssetVectorLogo } from "@/components/AssetVectorLogo";

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

const VENUES = ["Coinbase", "Binance", "NYSE", "NASDAQ", "CME", "COMEX", "LME", "ICE"];

const BIBLE_MARKETS = [
  { sym: "XAU", name: "Gold", verse: "More to be desired than much fine gold. — Psalm 19:10", story: "Solomon overlaid the temple with it. Kings measured wisdom by it. The AI weighs it every second." },
  { sym: "XAG", name: "Silver", verse: "The silver is mine, and the gold is mine. — Haggai 2:8", story: "Abraham paid 400 shekels of silver for the field of Machpelah — the first recorded purchase." },
  { sym: "WHEAT", name: "Wheat", verse: "Joseph gathered corn as the sand of the sea. — Genesis 41:49", story: "Seven fat years stored for seven lean — the first great stewardship of grain." },
  { sym: "WTI", name: "Oil", verse: "The wise took oil in their vessels. — Matthew 25:4", story: "Oil lit the temple lamps and the wise virgins' flames. It still moves the world." },
  { sym: "COPPER", name: "Copper", verse: "Out of the earth comes its copper. — Job 28:2", story: "The bronze sea and the temple pillars were cast from it — metalwork as worship." },
];

/* ── custom SVG commodity logos ── */
const GLYPHS: Record<string, React.ReactNode> = {
  XAU: <><path d="M8 9h8l2 4H6l2-4z" /><path d="M5 15h9l1.5 3H3.5L5 15z" /></>,
  XAG: <><circle cx="12" cy="12" r="7" /><path d="M12 8.5v7M8.5 12h7" /></>,
  WTI: <path d="M12 4c3 4 6 7 6 10a6 6 0 1 1-12 0c0-3 3-6 6-10z" />,
  NG: <path d="M12 4c1 3 5 5 5 9a5 5 0 1 1-10 0c0-2 1-3.5 2-5.5.8 1.6 2 2.5 3-3.5z" />,
  WHEAT: <><path d="M12 21V8" /><path d="M12 8C9 8 8 6 8 4c3 0 4 2 4 4zm0 0c3 0 4-2 4-4-3 0-4 2-4 4zm0 5c-3 0-4-2-4-4 3 0 4 2 4 4zm0 0c3 0 4-2 4-4-3 0-4 2-4 4z" /></>,
  CORN: <><path d="M12 3c3 3 4 7 4 10s-1 7-4 8c-3-1-4-5-4-8s1-7 4-8z" /><path d="M12 6v14M9.5 9.5h5M9.5 13.5h5" /></>,
  COFFEE: <><path d="M5 9h11v5a5 5 0 0 1-10 0V9z" /><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2M8.5 4.5c0 1-1 1-1 2M12.5 4.5c0 1-1 1-1 2" /></>,
  SUGAR: <><path d="M8 9h8v8H8z" /><path d="M8 9l3-3h8l-3 3M16 17l3-3V6" /></>,
  COPPER: <><path d="M12 4l6 3.5v7L12 18l-6-3.5v-7L12 4z" /><circle cx="12" cy="11" r="2" /></>,
};

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
  const dim = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-14 w-14" : "h-10 w-10";
  if (a.image)
    return <img src={a.image} alt={a.symbol} className={`${dim} rounded-full border border-[var(--border)] object-cover`} />;
  return <AssetVectorLogo symbol={a.symbol} className={`${dim} rounded-full`} />;
}

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="tabular-nums text-[var(--gold)]">--:--:-- UTC</span>;
  return <span className="tabular-nums text-[var(--gold)]">{now.toUTCString().slice(17, 25)} UTC</span>;
}

function RangeBar({ price, change }: { price: number; change: number }) {
  const span = Math.max(0.4, Math.abs(change));
  const low = price / (1 + span / 100);
  const high = price * (1 + span / 100);
  const pos = Math.max(4, Math.min(96, ((price - low) / (high - low)) * 100));
  return (
    <div className="mt-3">
      <div className="relative h-1 rounded-full bg-[var(--border)]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-loss via-gold-light to-profit opacity-50" />
        <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--fg)] shadow-gold" style={{ left: `${pos}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-[var(--muted)]"><span>24h low</span><span>24h high</span></div>
    </div>
  );
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
      <RangeBar price={a.price} change={a.change24h} />
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

  const gainers = [...assets].filter((a) => a.change24h >= 0).sort((a, b) => b.change24h - a.change24h);
  const decliners = [...assets].filter((a) => a.change24h < 0).sort((a, b) => a.change24h - b.change24h);
  const avg = assets.length ? assets.reduce((s, a) => s + a.change24h, 0) / assets.length : 0;
  const temp = Math.max(4, Math.min(96, 50 + avg * 12));
  const tempLabel = temp < 35 ? "Cautious" : temp < 65 ? "Steady" : "Bold";

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

      {/* ── LOGO WALL + VENUES ── */}
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
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">Prices mirror</span>
              {VENUES.map((v) => (
                <span key={v} className="pill !py-1 text-[10px] font-bold tracking-wider">{v}</span>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── AI SPOTLIGHT (scan ring) ── */}
      {featured && (
        <section className="container-wide pt-10">
          <Reveal variant="up">
            <GlowCard className="p-6 md:p-8">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <p className="eyebrow">AI spotlight</p>
                  <div className="mt-5 flex items-center gap-5">
                    <div className="relative">
                      <div className="scan-ring" />
                      <AssetLogo a={featured} size="lg" />
                    </div>
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

      {/* ── MARKET PULSE TILES ── */}
      {assets.length > 0 && (
        <section className="container-wide pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Reveal variant="up">
              <GlowCard className="p-5">
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Market temperature</span>
                  <span className="font-bold text-[var(--gold)]">{tempLabel}</span>
                </div>
                <div className="relative mt-3 h-1.5 rounded-full bg-gradient-to-r from-loss via-gold-light to-profit opacity-80">
                  <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--bg)] bg-[var(--fg)] shadow-gold" style={{ left: `${temp}%` }} />
                </div>
                <p className="mt-2 text-[10px] text-[var(--muted)]">Average 24h move across all tracked assets</p>
              </GlowCard>
            </Reveal>
            <Reveal variant="up" index={1}>
              <GlowCard className="p-5">
                <p className="text-xs text-[var(--muted)]">Gainers</p>
                <p className="mt-1 text-2xl font-extrabold text-profit">{gainers.length}</p>
                {gainers[0] && <p className="mt-1 text-[11px] text-[var(--muted)]">Leading: <b className="text-profit">{gainers[0].symbol} +{gainers[0].change24h.toFixed(1)}%</b></p>}
              </GlowCard>
            </Reveal>
            <Reveal variant="up" index={2}>
              <GlowCard className="p-5">
                <p className="text-xs text-[var(--muted)]">Decliners</p>
                <p className="mt-1 text-2xl font-extrabold text-loss">{decliners.length}</p>
                {decliners[0] && <p className="mt-1 text-[11px] text-[var(--muted)]">Weakest: <b className="text-loss">{decliners[0].symbol} {decliners[0].change24h.toFixed(1)}%</b></p>}
              </GlowCard>
            </Reveal>
          </div>
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

      {/* ── ASSET GROUPS ── */}
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
            const fake: Asset = { id: m.sym, symbol: m.sym, name: m.name, class: "Commodities", price: live?.price || 0, change24h: 0, marketCap: null };
            return (
              <Reveal key={m.sym} variant="up" index={i}>
                <GlowCard className="flex h-full flex-col p-5">
                  <div className="flex items-center gap-3">
                    <AssetLogo a={fake} />
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
