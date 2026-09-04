"use client";

import { useEffect, useRef, useState } from "react";

type Snap = {
  symbol: string;
  range: string;
  price: number;
  change24h: number;
  candles: { t: number; o: number; h: number; l: number; c: number }[];
  bids: { p: number; q: number }[];
  asks: { p: number; q: number }[];
  openPositions: {
    id: string;
    symbol: string;
    side: "BUY" | "SELL";
    entry: number;
    qty: number;
    current: number;
    upnl: number;
    heldSec: number;
    type: string;
    technique: string;
    openedAt: number;
  }[];
  closedTrades: {
    id: string;
    symbol: string;
    side: "BUY" | "SELL";
    entry: number;
    exit: number;
    qty: number;
    pnl: number;
    openedAt: number;
    closedAt: number;
    type: string;
    technique: string;
  }[];
  symbols: string[];
};

const TRADE_TYPES = [
  { name: "Trend Following", desc: "Rides established momentum across crypto, stocks and commodities using moving-average crossovers.", icon: "↗" },
  { name: "Mean Reversion", desc: "Buys dips and sells rallies when price strays from its statistical norm.", icon: "⇄" },
  { name: "Arbitrage", desc: "Captures price gaps between related assets and venues in milliseconds.", icon: "⤬" },
  { name: "Breakout", desc: "Enters when price clears a key resistance or support level with volume.", icon: "⤒" },
  { name: "Market Making", desc: "Provides two-sided liquidity, earning the spread as price churns.", icon: "⇋" },
  { name: "Sentiment", desc: "Weights news and on-chain flow signals into short-term entries.", icon: "◈" },
];

const TECHNIQUES = [
  "LSTM / GRU sequence models for price forecasting",
  "Reinforcement learning for execution timing",
  "Kalman-filtered volatility estimation",
  "Risk-parity position sizing with drawdown guards",
  "Cross-asset correlation hedging",
  "On-chain and order-flow signal fusion",
];

const SYMBOLS_FALLBACK = ["BTC", "ETH", "SOL", "AAPL", "MSFT", "NVDA", "TSLA", "XAU", "XAG", "WTI", "COPPER", "WHEAT", "CORN", "COFFEE", "SUGAR"];

function fmtDur(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function hexToRgba(hex: string, a: number) {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// Resolve a CSS var() color (e.g. "var(--bg)") to a concrete hex/rgb string so
// the canvas can paint an integral background that matches the active theme.
function resolveVarColor(varExpr: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const name = varExpr.replace("var(", "").replace(")", "").replace(/\s/g, "");
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  if (raw.startsWith("#")) return raw;
  if (raw.startsWith("rgb")) return raw;
  return fallback;
}

function hexA(color: string, a: number): string {
  if (color.startsWith("rgb")) {
    const nums = color.replace(/rgba?\(|\)/g, "").split(",").map((s) => s.trim());
    return `rgba(${nums[0]},${nums[1]},${nums[2]},${a})`;
  }
  if (color.startsWith("#")) {
    let v = color.replace("#", "");
    if (v.length === 3) v = v.split("").map((c) => c + c).join("");
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return `rgba(10,14,39,${a})`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

type Candle = { o: number; h: number; l: number; c: number };

function LiveCandleChart({
  seedCandles,
  seedKey,
  livePrice,
  up,
  onLive,
}: {
  seedCandles: { o: number; h: number; l: number; c: number }[];
  seedKey: string;
  livePrice: number;
  up: boolean;
  onLive?: (price: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Imperative animation state (never triggers React re-renders).
  const bufRef = useRef<Candle[]>([]);
  const targetRef = useRef<number>(0);
  const walkRef = useRef<number>(0);
  const seededKey = useRef<string>("");
  const zoomRef = useRef<number>(1);
  const offsetRef = useRef<number>(0);
  const dragRef = useRef<{ x: number; off: number } | null>(null);
  const sizeRef = useRef({ w: 1000, h: 460, dpr: 1 });
  const bgRef = useRef<string>("#0a0e27");

  // Resolve the active theme background once mounted and whenever it changes,
  // so the chart paints an integral background that matches day/night modes.
  useEffect(() => {
    const resolve = () =>
      (bgRef.current = resolveVarColor("var(--bg)", "#0a0e27"));
    resolve();
    if (typeof window === "undefined") return;
    const obs = new MutationObserver(resolve);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => obs.disconnect();
  }, []);

  const upRef = useRef(up);
  useEffect(() => {
    upRef.current = up;
  }, [up]);

  const [loading, setLoading] = useState(true);
  const [expand, setExpand] = useState(false);
  const expandRef = useRef(false);
  useEffect(() => {
    expandRef.current = expand;
  }, [expand]);

  // Clear the buffer the moment the symbol/range changes; the shimmer shows
  // until the fresh candles for the new key arrive.
  useEffect(() => {
    bufRef.current = [];
    seededKey.current = "";
    targetRef.current = 0;
    walkRef.current = 0;
    zoomRef.current = 1;
    offsetRef.current = 0;
    setLoading(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey]);

  // Seed ONCE per symbol/range. Must NOT run on every poll (a new candles
  // array reference each second) or the walk resets and the price flickers.
  useEffect(() => {
    if (seedCandles.length < 2) return;
    if (seededKey.current === seedKey) return;
    bufRef.current = seedCandles.map((c) => ({ ...c }));
    walkRef.current = bufRef.current[bufRef.current.length - 1].c;
    targetRef.current = walkRef.current;
    seededKey.current = seedKey;
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey, seedCandles]);

  // Live price target — updated whenever the parent polls.
  useEffect(() => {
    if (livePrice > 0) {
      targetRef.current = livePrice;
      if (walkRef.current === 0) walkRef.current = livePrice;
    }
  }, [livePrice]);

  // Keep the canvas backing store sized to its container (responsive).
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth || 1000;
      const h = expandRef.current ? Math.max(360, window.innerHeight - 160) : 460;
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Single animation loop: smoothly track the live target with a calm,
  // time-based walk, roll a new candle on a fixed cadence, and redraw the
  // canvas directly. No React state changes here, so the UI stays responsive
  // (button clicks never compete with a render storm).
  useEffect(() => {
    let raf = 0;
    let lastRoll = Date.now();
    let lastFrame = Date.now();
    let lastEmit = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Self-heal the backing store so the canvas is always crisp and
      // correctly sized, regardless of when it mounted.
      const wrap = wrapRef.current;
      const dpr = window.devicePixelRatio || 1;
      const w = wrap ? wrap.clientWidth || 1000 : 1000;
      const h = expandRef.current
        ? Math.max(360, window.innerHeight - 160)
        : wrap
        ? wrap.clientHeight || 460
        : 460;
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
      }
      sizeRef.current = { w, h, dpr };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Paint an integral background that matches the theme (no separate boxed
      // rectangle behind the chart). Resolved once so day/night themes match.
      const bg = bgRef.current;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, hexA(bg, 0.55));
      bgGrad.addColorStop(1, hexA(bg, 1));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const buf = bufRef.current;
      const n = buf.length;
      const zoom = zoomRef.current;
      const visibleCount = Math.max(8, Math.round(n / zoom));
      const start = Math.max(0, n - visibleCount - offsetRef.current);
      const view = buf.slice(start, start + visibleCount);
      if (view.length < 2) return;

      const PAD_T = 16;
      const PAD_B = 26;
      let min = Infinity;
      let max = -Infinity;
      for (const c of view) {
        if (c.h > max) max = c.h;
        if (c.l < min) min = c.l;
      }
      const pad = (max - min) * 0.12 || 1;
      const lo = min - pad;
      const hi = max + pad;
      const span = hi - lo || 1;
      const y = (v: number) => PAD_T + (1 - (v - lo) / span) * (h - PAD_T - PAD_B);
      const cw = w / view.length;
      const bodyW = Math.max(1.5, cw * 0.42);

      const UP = "#34d399";
      const DN = "#f87171";
      const GRID = "rgba(255,255,255,0.05)";
      const accent = upRef.current ? UP : DN;

      // Grid + price axis labels.
      const lines = 5;
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      for (let i = 0; i < lines; i++) {
        const gy = PAD_T + ((h - PAD_T - PAD_B) / (lines - 1)) * i;
        const price = hi - (span * i) / (lines - 1);
        ctx.strokeStyle = GRID;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
        ctx.fillStyle = "rgba(154,163,199,0.7)";
        ctx.fillText(price.toLocaleString("en-US", { maximumFractionDigits: 2 }), 6, gy - 3);
      }

      // Candles.
      for (let i = 0; i < view.length; i++) {
        const c = view[i];
        const x = i * cw + cw / 2;
        const bull = c.c >= c.o;
        const col = bull ? UP : DN;
        const yo = y(c.o);
        const yc = y(c.c);
        const top = Math.min(yo, yc);
        const bh = Math.max(1.5, Math.abs(yc - yo));
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(x, y(c.h));
        ctx.lineTo(x, y(c.l));
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = col;
        ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
      }

      // Trend line + fill.
      const pts: [number, number][] = view.map((c, i) => [(i / (view.length - 1)) * w, y(c.c)]);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (const [px, py] of pts) ctx.lineTo(px, py);
      ctx.lineTo(w, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, hexToRgba(accent, 0.16));
      grad.addColorStop(1, hexToRgba(accent, 0));
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Last price marker + tag.
      const last = buf[buf.length - 1].c;
      const lastY = y(last);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(w, lastY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(w - 5, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
      roundRectPath(ctx, w - 86, lastY - 11, 84, 22, 4);
      ctx.fill();
      ctx.fillStyle = "#0a0e27";
      ctx.font = "700 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(last.toLocaleString("en-US", { maximumFractionDigits: 2 }), w - 44, lastY);
    };

    const step = () => {
      const buf = bufRef.current;
      if (buf.length >= 2) {
        const now = Date.now();
        const dt = Math.min(64, now - lastFrame);
        lastFrame = now;
        const forming = buf[buf.length - 1];
        const target = targetRef.current || walkRef.current || forming.c;
        // Time-based exponential smoothing (~settles toward target in ~1s)
        // plus a tiny, dt-scaled noise so the line is gently alive.
        const k = 1 - Math.pow(0.0009, dt / 1000);
        walkRef.current =
          walkRef.current + (target - walkRef.current) * k + (Math.random() - 0.5) * Math.abs(target) * 0.00004 * dt;
        const next = walkRef.current;
        forming.c = next;
        if (next > forming.h) forming.h = next;
        if (next < forming.l) forming.l = next;
        if (now - lastRoll >= 1500) {
          lastRoll = now;
          buf.push({ o: next, h: next, l: next, c: next });
          if (buf.length > 120) buf.shift();
        }
        if (onLive && now - lastEmit >= 250) {
          lastEmit = now;
          onLive(next);
        }
        draw();
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onLive]);

  const zoomBy = (delta: number) => {
    zoomRef.current = Math.min(6, Math.max(1, +(zoomRef.current + delta).toFixed(2)));
  };

  return (
    <div className={expand ? "fixed inset-0 z-50 flex flex-col bg-[var(--bg)] p-4" : ""}>
      <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
        <button onClick={() => zoomBy(-0.5)} className="rounded border border-[var(--border)] px-2 py-1 hover:border-[var(--gold)]">−</button>
        <button onClick={() => zoomBy(0.5)} className="rounded border border-[var(--border)] px-2 py-1 hover:border-[var(--gold)]">+</button>
        <button onClick={() => { zoomRef.current = 1; offsetRef.current = 0; }} className="rounded border border-[var(--border)] px-2 py-1 hover:border-[var(--gold)]">Reset</button>
        <button onClick={() => setExpand((e) => !e)} className="rounded border border-[var(--border)] px-2 py-1 hover:border-[var(--gold)]">
          {expand ? "Close" : "Expand"}
        </button>
        <span>scroll to zoom · drag to pan</span>
      </div>
      <div ref={wrapRef} className="relative w-full" style={{ height: expand ? "calc(100vh - 120px)" : 460 }}>
        <canvas
          ref={canvasRef}
          className="w-full cursor-grab touch-none select-none rounded-xl border border-[var(--border)] active:cursor-grabbing"
          onWheel={(e) => {
            zoomBy(e.deltaY > 0 ? 0.25 : -0.25);
          }}
          onMouseDown={(e) => {
            dragRef.current = { x: e.clientX, off: offsetRef.current };
          }}
          onMouseMove={(e) => {
            if (!dragRef.current) return;
            const dx = e.clientX - dragRef.current.x;
            const shift = Math.round((-dx / 6) * zoomRef.current);
            offsetRef.current = Math.max(0, dragRef.current.off + shift);
          }}
          onMouseUp={() => {
            dragRef.current = null;
          }}
          onMouseLeave={() => {
            dragRef.current = null;
          }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
              Loading live market history…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TradeEngine({ full = false, demo = false }: { full?: boolean; demo?: boolean }) {
  const [sym, setSym] = useState("BTC");
  const [range, setRange] = useState("3M");
  const [snap, setSnap] = useState<Snap | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [live, setLive] = useState<number | null>(null);
  const liveRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRole(d?.role ?? null))
      .catch(() => setRole(null));
  }, []);

  useEffect(() => {
    let active = true;
    async function pull() {
      try {
        const res = await fetch(`/api/aitrading?symbol=${sym}&range=${range}`);
        const json = await res.json();
        if (active) setSnap(json);
      } catch {
        /* ignore */
      }
    }
    pull();
    liveRef.current = window.setInterval(pull, 1000);
    return () => {
      active = false;
      if (liveRef.current) window.clearInterval(liveRef.current);
    };
  }, [sym, range]);

  const up = (snap?.change24h ?? 0) >= 0;

  return (
    <div className="min-h-screen px-3 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1600px]">
        {full && (
          <a
            href={role === "admin" ? "/admin" : role === "user" ? "/console" : "/"}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            <span aria-hidden>←</span> Back to {role === "admin" ? "Admin" : role === "user" ? "Dashboard" : "Home"}
          </a>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold md:text-4xl">
                AI <span className="gradient-text">Trade Engine</span>
              </h1>
              <span className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-profit" /> live
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Every position is opened and closed by the engine with full transparency: the entry price, the exit price, the realized profit or loss, and exactly how long it was held. Nothing is hidden.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(snap?.symbols ?? SYMBOLS_FALLBACK).map((s) => (
              <button
                key={s}
                onClick={() => setSym(s)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  s === sym ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[var(--muted)]">History</span>
            {["1M", "3M", "1Y", "ALL"].map((rf) => (
              <button
                key={rf}
                onClick={() => setRange(rf)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  rf === range ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {rf === "ALL" ? "All time" : rf}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 xl:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{sym} / USD</p>
                <p className="mt-1 text-3xl font-bold">{snap ? `$${(live ?? snap.price).toLocaleString("en-US")}` : "—"}</p>
              </div>
              <span className={`text-sm font-semibold ${up ? "text-profit" : "text-loss"}`}>
                {snap ? `${up ? "+" : ""}${snap.change24h}%` : ""} today
              </span>
            </div>
            <div className="mt-4">
              <LiveCandleChart seedCandles={snap?.candles ?? []} seedKey={sym + (snap?.range ?? range)} livePrice={snap?.price ?? 0} up={up} onLive={setLive} />
            </div>
          </div>

          {!demo && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">Order book</h2>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-loss">Asks</p>
                {(snap?.asks ?? []).map((a, i) => (
                  <div key={`a${i}`} className="flex justify-between text-sm">
                    <span className="text-loss">{a.p.toLocaleString("en-US")}</span>
                    <span className="text-[var(--muted)]">{a.q}</span>
                  </div>
                ))}
                <div className="my-2 border-t border-[var(--border)] pt-2 text-center text-sm font-semibold">
                  {snap ? `$${snap.price.toLocaleString("en-US")}` : "—"}
                </div>
                <p className="text-xs text-profit">Bids</p>
                {(snap?.bids ?? []).map((b, i) => (
                  <div key={`b${i}`} className="flex justify-between text-sm">
                    <span className="text-profit">{b.p.toLocaleString("en-US")}</span>
                    <span className="text-[var(--muted)]">{b.q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Open positions</h2>
            <span className="text-xs text-[var(--muted)]">{snap?.openPositions.length ?? 0} active</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)]">
                  <th className="py-2">Symbol</th>
                  <th>Side</th>
                  <th>Bought @</th>
                  <th>Now</th>
                  <th>Qty</th>
                  <th>Unrealized</th>
                  <th>Held</th>
                  <th>Strategy</th>
                </tr>
              </thead>
              <tbody>
                {(snap?.openPositions ?? []).map((p) => (
                  <tr key={p.id} className="border-t border-[var(--border)]">
                    <td className="py-2 font-mono font-semibold">{p.symbol}</td>
                    <td className={p.side === "BUY" ? "text-profit" : "text-loss"}>{p.side}</td>
                    <td>${p.entry.toLocaleString("en-US")}</td>
                    <td>${p.current.toLocaleString("en-US")}</td>
                    <td>{p.qty}</td>
                    <td className={p.upnl >= 0 ? "text-profit" : "text-loss"}>{p.upnl >= 0 ? "+" : ""}{p.upnl.toFixed(2)}</td>
                    <td className="text-[var(--muted)]">{fmtDur(p.heldSec)}</td>
                    <td className="text-xs text-[var(--muted)]">{p.type} · {p.technique}</td>
                  </tr>
                ))}
                {(snap?.openPositions.length ?? 0) === 0 && (
                  <tr><td colSpan={8} className="py-4 text-[var(--muted)]">No open positions right now. The engine is watching for entries.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--gold)]/30 bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold">Closed trades (realized P&L)</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">What the AI opened, what it sold at, the profit or loss, and how long it held.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)]">
                  <th className="py-2">Symbol</th>
                  <th>Side</th>
                  <th>Opened @</th>
                  <th>Closed @</th>
                  <th>Qty</th>
                  <th>P&L</th>
                  <th>Held</th>
                  <th>Strategy</th>
                </tr>
              </thead>
              <tbody>
                {(snap?.closedTrades ?? []).map((t) => (
                  <tr key={t.id} className="border-t border-[var(--border)]">
                    <td className="py-2 font-mono font-semibold">{t.symbol}</td>
                    <td className={t.side === "BUY" ? "text-profit" : "text-loss"}>{t.side}</td>
                    <td>${t.entry.toLocaleString("en-US")}</td>
                    <td>${t.exit.toLocaleString("en-US")}</td>
                    <td>{t.qty}</td>
                    <td className={`font-semibold ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
                    </td>
                    <td className="text-[var(--muted)]">{fmtDur(Math.floor((t.closedAt - t.openedAt) / 1000))}</td>
                    <td className="text-xs text-[var(--muted)]">{t.type} · {t.technique}</td>
                  </tr>
                ))}
                {(snap?.closedTrades.length ?? 0) === 0 && (
                  <tr><td colSpan={8} className="py-4 text-[var(--muted)]">No closed trades yet. They will appear as the engine takes profit or cuts risk.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!demo && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold">Trade types the engine runs</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Each position is chosen by a model that weighs these strategies against live risk limits.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {TRADE_TYPES.map((t) => (
                  <div key={t.name} className="rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--gold)]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-[var(--gold)]">{t.icon}</span>
                      <p className="font-semibold">{t.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold">Techniques under the hood</h2>
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                {TECHNIQUES.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-[var(--gold)]">▹</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Demonstration engine. Prices, positions and P&amp;L are simulated for transparency and preview.
        </p>

        {!full && (
          <p className="mt-4 text-center text-sm">
            <a href="/ai-trading" className="text-[var(--gold)] hover:underline">Open full-screen engine →</a>
          </p>
        )}
      </div>
    </div>
  );
}
