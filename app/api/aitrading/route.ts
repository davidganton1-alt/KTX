import { NextRequest, NextResponse } from "next/server";
import {
  SYMBOLS,
  ASSET_CLASS,
  TRADE_TYPES,
  TECHNIQUES,
  fetchYahoo,
  syntheticPrice,
  stepEngine,
  currentPrice,
  snapshotFor,
  makeCandles,
  type EngineState,
  type Closed,
  type Position,
  NOTIONAL,
} from "@/lib/engine";

export const dynamic = "force-dynamic";

// Engine state lives here (resets on server restart; fine for a demo).
let state: EngineState = { positions: [], closed: [] };
let lastStep = 0;

function rngFromNow(now: number, salt: number) {
  let s = (Math.floor(now / 1000) + salt) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export async function GET(req: NextRequest) {
  const sym = (req.nextUrl.searchParams.get("symbol") || "BTC").toUpperCase();
  const rangeKey = (req.nextUrl.searchParams.get("range") || "3M").toUpperCase();
  const now = Date.now();

  // Throttle engine stepping to ~once per 1.5s so it's not re-seeded every poll.
  if (now - lastStep >= 1500) {
    lastStep = now;
    const r = rngFromNow(now, 1);
    stepEngine(state, now, r);
  }

  const liveRng = rngFromNow(now, sym.length);

  const real = await fetchYahoo(sym, rangeKey);
  const livePrice = real?.price ?? syntheticPrice(sym, now, liveRng);
  const change24h = real?.change24h ?? +((liveRng() - 0.45) * 4).toFixed(2);

  const candles = makeCandles(real, sym, now, liveRng);

  const bids: { p: number; q: number }[] = [];
  const asks: { p: number; q: number }[] = [];
  for (let i = 1; i <= 8; i++) {
    const spread = i * 0.0008;
    bids.push({ p: +(livePrice * (1 - spread)).toFixed(2), q: +((liveRng() * 3 + 0.1)).toFixed(3) });
    asks.push({ p: +(livePrice * (1 + spread)).toFixed(2), q: +((liveRng() * 3 + 0.1)).toFixed(3) });
  }

  const { open, closed: closedSym } = snapshotFor(state, sym, now, liveRng);

  return NextResponse.json(
    {
      symbol: sym,
      range: rangeKey,
      assetClass: ASSET_CLASS[sym] ?? "Crypto",
      price: livePrice,
      change24h,
      notional: NOTIONAL,
      candles,
      bids,
      asks,
      openPositions: open,
      closedTrades: closedSym.slice(0, 20),
      symbols: SYMBOLS,
      totalAssetClasses: 3,
      source: real ? "live" : "simulated",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
