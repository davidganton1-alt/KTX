// Core AI trade engine: consistent notional sizing across crypto / stocks / commodities.
// No Next.js imports here — this is a plain TS module the route wire-up consumes.

export const SYMBOLS = [
  "BTC", "ETH", "SOL", "XRP", "BNB", "USDT", "USDC",
  "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "JPM", "V", "WMT", "DIS", "KO",
  "XAU", "XAG", "WTI", "NG", "WHEAT", "CORN", "COFFEE", "SUGAR",
] as const;

export type AssetClass = "Crypto" | "US Stocks" | "Commodities";
export const ASSET_CLASS: Record<string, AssetClass> = {
  BTC: "Crypto", ETH: "Crypto", SOL: "Crypto", XRP: "Crypto", BNB: "Crypto", USDT: "Crypto", USDC: "Crypto",
  AAPL: "US Stocks", MSFT: "US Stocks", NVDA: "US Stocks", TSLA: "US Stocks", AMZN: "US Stocks",
  GOOGL: "US Stocks", META: "US Stocks", JPM: "US Stocks", V: "US Stocks", WMT: "US Stocks", DIS: "US Stocks", KO: "US Stocks",
  XAU: "Commodities", XAG: "Commodities", WTI: "Commodities", NG: "Commodities",
  WHEAT: "Commodities", CORN: "Commodities", COFFEE: "Commodities", SUGAR: "Commodities",
};

export const TRADE_TYPES = [
  "Trend Following", "Mean Reversion", "Arbitrage", "Breakout", "Market Making", "Sentiment",
];
export const TECHNIQUES = [
  "LSTM forecast", "RL execution", "Kalman vol filter", "Riskparity sizing", "Correlation hedge", "Order-flow fusion",
];

export const NOTIONAL = 2500; // $ exposure per position — same for BTC, AAPL or sugar

export type Position = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  entry: number;
  qty: number;
  notional: number;
  openedAt: number;
  type: string;
  technique: string;
};
export type Closed = {
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
};

export type EngineState = { positions: Position[]; closed: Closed[] };

// ---- Yahoo price cache (TTL 12s) ----
type Cached = { price: number; change24h: number; candles: { o: number; h: number; l: number; c: number }[]; at: number };
const RANGES: Record<string, { range: string; interval: string }> = {
  "1M": { range: "1mo", interval: "1d" },
  "3M": { range: "3mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
  ALL: { range: "5y", interval: "1wk" },
};
const TICKER: Record<string, string> = {
  BTC: "BTC-USD",
  ETH: "ETH-USD",
  SOL: "SOL-USD",
  XRP: "XRP-USD",
  BNB: "BNB-USD",
  USDT: "USDT-USD",
  USDC: "USDC-USD",
  AAPL: "AAPL", MSFT: "MSFT", NVDA: "NVDA", TSLA: "TSLA", AMZN: "AMZN", GOOGL: "GOOGL", META: "META",
  JPM: "JPM", V: "V", WMT: "WMT", DIS: "DIS", KO: "KO",
  XAU: "GC=F", XAG: "SI=F", WTI: "CL=F", NG: "NG=F",
  WHEAT: "ZW=F", CORN: "ZC=F", COFFEE: "KC=F", SUGAR: "SB=F",
};
const cache = new Map<string, Cached>();
const TTL = 12000;

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export async function fetchYahoo(sym: string, rangeKey = "3M"): Promise<Cached | null> {
  const cacheKey = `${sym}:${rangeKey}`;
  const hit = cache.get(cacheKey);
  const now = Date.now();
  if (hit && now - hit.at < TTL) return hit;
  const ticker = TICKER[sym] ?? `${sym}-USD`;
  const { range, interval } = RANGES[rangeKey] ?? RANGES["3M"];
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`,
      { signal: ctrl.signal, cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } }
    );
    clearTimeout(t);
    if (!res.ok) throw new Error("bad");
    const data = await res.json();
    const r = data?.chart?.result?.[0];
    if (!r) throw new Error("no result");
    const ts: number[] = r.timestamp;
    const q = r.indicators?.quote?.[0];
    const candles: { o: number; h: number; l: number; c: number }[] = [];
    for (let i = 0; i < ts.length; i++) {
      const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
      if (c == null || h == null || l == null || o == null) continue;
      candles.push({ o: +o.toFixed(2), h: +h.toFixed(2), l: +l.toFixed(2), c: +c.toFixed(2) });
    }
    if (candles.length < 2) throw new Error("no candles");
    const price = +candles[candles.length - 1].c.toFixed(2);
    const prevClose = r.meta?.chartPreviousClose ?? candles[candles.length - 2].c;
    const change24h = +(((price - prevClose) / prevClose) * 100).toFixed(2);
    const out: Cached = { price, change24h, candles, at: now };
    cache.set(cacheKey, out);
    return out;
  } catch {
    return hit ?? null;
  }
}

// Synthetic fallback price when Yahoo is unreachable.
export function syntheticPrice(sym: string, now: number, r: () => number): number {
  const base = 100 + (sym.charCodeAt(0) + sym.charCodeAt(sym.length - 1)) * 7;
  const wobble = Math.sin(now / 9000 + sym.length) * base * 0.02;
  return +(base + wobble + (r() - 0.5) * base * 0.01).toFixed(2);
}

// ---- engine: state lives in the caller (route) so one process clears on restart ----
export function stepEngine(state: EngineState, now: number, rngFn: () => number) {
  // close old positions
  for (let i = state.positions.length - 1; i >= 0; i--) {
    const p = state.positions[i];
    const held = now - p.openedAt;
    const maxHeld = 6000 + (p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 6000);
    if (held > maxHeld || rngFn() > 0.85) {
      const cur = currentPrice(state, p.symbol, now, rngFn);
      const pnl = p.side === "BUY" ? (cur - p.entry) * p.qty : (p.entry - cur) * p.qty;
      state.closed.unshift({
        id: p.id, symbol: p.symbol, side: p.side,
        entry: p.entry, exit: +cur.toFixed(2), qty: p.qty,
        pnl: +pnl.toFixed(2), openedAt: p.openedAt, closedAt: now,
        type: p.type, technique: p.technique,
      });
      state.positions.splice(i, 1);
    }
  }
  if (state.closed.length > 60) state.closed.length = 60;

  // open new positions so we have up to 5 active across symbols
  const wanted = Math.min(5, SYMBOLS.length);
  const toOpen = Math.max(0, wanted - state.positions.length);
  if (toOpen > 0) {
    const shuffled = [...SYMBOLS].sort(() => rngFn() - 0.5);
    let placed = 0;
    for (const s of shuffled) {
      if (placed >= toOpen) break;
      if (state.positions.some((p) => p.symbol === s)) continue;
      const live = currentPrice(state, s, now, rngFn);
      const side: "BUY" | "SELL" = rngFn() > 0.5 ? "BUY" : "SELL";
      const qty = +(NOTIONAL / live).toFixed(2); // same $ exposure regardless of price
      state.positions.push({
        id: Math.random().toString(36).slice(2),
        symbol: s, side,
        entry: +live.toFixed(2), qty, notional: +(qty * live).toFixed(2),
        openedAt: now,
        type: TRADE_TYPES[Math.floor(rngFn() * TRADE_TYPES.length)],
        technique: TECHNIQUES[Math.floor(rngFn() * TECHNIQUES.length)],
      });
      placed++;
    }
  }
}

export function currentPrice(state: EngineState, sym: string, now: number, rngFn: () => number): number {
  // If we have a cached Yahoo price for the default 3M range, use it; else synthesize.
  if (cache.size > 0) {
    const r = cache.get(`${sym}:3M`);
    if (r && r.price > 0) return r.price;
  }
  return syntheticPrice(sym, now, rngFn);
}

export function snapshotFor(state: EngineState, sym: string, now: number, rngFn: () => number) {
  const open = state.positions.filter((p) => p.symbol === sym).map((p) => {
    const cur = currentPrice(state, p.symbol, now, rngFn);
    const upnl = p.side === "BUY" ? (cur - p.entry) * p.qty : (p.entry - cur) * p.qty;
    return {
      id: p.id, symbol: p.symbol, side: p.side,
      entry: p.entry, qty: p.qty, current: +cur.toFixed(2),
      upnl: +upnl.toFixed(2),
      heldSec: Math.floor((now - p.openedAt) / 1000),
      type: p.type, technique: p.technique, openedAt: p.openedAt,
      notional: p.notional,
    };
  });
  const closedSym = state.closed.filter((t) => t.symbol === sym);
  return { open, closed: closedSym };
}

// ---- candle builder (real or synthetic) ----
export function makeCandles(real: Cached | null, sym: string, now: number, rngFn: () => number): { t: number; o: number; h: number; l: number; c: number }[] {
  if (real && real.candles.length >= 8) {
    return real.candles.map((c, i) => ({
      t: now - (real.candles.length - 1 - i) * 3600_000,
      o: c.o, h: c.h, l: c.l, c: c.c,
    }));
  }
  const r = rngFn;
  const candles: { t: number; o: number; h: number; l: number; c: number }[] = [];
  let price = currentPrice({ positions: [], closed: [] }, sym, now, rngFn);
  for (let i = 39; i >= 0; i--) {
    const open = price * (1 + (r() - 0.5) * 0.004);
    const close = open * (1 + (r() - 0.48) * 0.01);
    const high = Math.max(open, close) * (1 + r() * 0.004);
    const low = Math.min(open, close) * (1 - r() * 0.004);
    candles.push({ t: now - i * 1500, o: +open.toFixed(2), h: +high.toFixed(2), l: +low.toFixed(2), c: +close.toFixed(2) });
    price = close;
  }
  return candles;
}
