import { promises as fs } from "fs";
import path from "path";
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
  // --- ENGINE MODE CHECK ---
  let engineMode = 'demo';
  try {
    const modePath = path.join(process.cwd(), 'data', 'engine-mode.json');
    const modeData = await fs.readFile(modePath, 'utf-8');
    const parsed = JSON.parse(modeData);
    engineMode = parsed.mode || 'demo';
  } catch (error) {
    engineMode = 'demo';
  }

  if (engineMode === 'demo') {
    const nowMs = Date.now();
    const simulatedCandles = [];
    let basePrice = sym === 'BTC' ? 64000 : sym === 'ETH' ? 3400 : sym === 'AAPL' ? 220 : 150;
    for (let i = 60; i >= 0; i--) {
      const t = nowMs - (i * 5000);
      const volatility = basePrice * 0.002;
      const o = basePrice + (Math.random() - 0.5) * volatility;
      const c = o + (Math.random() - 0.5) * volatility;
      const h = Math.max(o, c) + Math.random() * volatility * 0.5;
      const l = Math.min(o, c) - Math.random() * volatility * 0.5;
      simulatedCandles.push({ t, o, h, l, c, v: Math.random() * 100 });
      basePrice = c;
    }
    return NextResponse.json(
      { symbol: sym, range, assetClass: ASSET_CLASS[sym] || "Crypto", price: +basePrice.toFixed(2), change24h: 1.25, notional: 2500, candles: simulatedCandles, bids: [], asks: [], openPositions: [], closedTrades: [], symbols: SYMBOLS, totalAssetClasses: 3, source: "simulated" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
  // --- END ENGINE MODE CHECK ---

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

