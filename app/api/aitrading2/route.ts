// app/api/aitrading2/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchYahoo, makeCandles, SYMBOLS, ASSET_CLASS } from "@/lib/engine";
import { rng } from "@/lib/rng";
import { fetchAllMarketData } from "@/lib/dataAggregator";
import { generateTrades } from "@/lib/strategy";
import { addTrades, getRecent } from "@/lib/tradesStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sym = searchParams.get("symbol") || "BTC";
  const range = searchParams.get("range") || "3M";

  const liveData = await fetchAllMarketData();
  const state = { positions: [], closed: [] as any[] };
  const trades = generateTrades(state, liveData);
  addTrades(trades);

  const snap = liveData.get(sym);
  const yahoo = await fetchYahoo(sym, range);
  const r = rng(Date.now());
  const candles = makeCandles(yahoo, sym, Date.now(), r);
  const price = snap?.price ?? 0;
  const change24h = yahoo
    ? +(((price - (yahoo.candles[0]?.c ?? price)) / (yahoo.candles[0]?.c ?? price)) * 100).toFixed(2)
    : 0;

  const recentTrades = getRecent(30);
  const openPositions = recentTrades.filter((t) => !t.exit).slice(0, 10);
  const closedTrades = recentTrades.filter((t) => t.exit).slice(0, 20);

  return NextResponse.json(
    {
      symbol: sym,
      range,
      assetClass: ASSET_CLASS[sym] || "Crypto",
      price: +price.toFixed(2),
      change24h,
      notional: 2500,
      candles,
      bids: [],
      asks: [],
      openPositions,
      closedTrades,
      symbols: SYMBOLS,
      totalAssetClasses: 3,
      source: yahoo ? "live" : "simulated",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
