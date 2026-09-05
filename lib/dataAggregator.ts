// lib/dataAggregator.ts
import { fetchYahoo, makeCandles, SYMBOLS } from "./engine";
import { rng } from "./rng";
import type { MarketSnapshot } from "./strategy";

export async function fetchAllMarketData(): Promise<Map<string, MarketSnapshot>> {
  const map = new Map<string, MarketSnapshot>();
  const r = rng(Date.now());
  const now = Date.now();

  for (const sym of SYMBOLS) {
    try {
      const yahoo = await fetchYahoo(sym, "3M");
      const candles = makeCandles(yahoo, sym, now, r);
      const price = yahoo?.price ?? candles[candles.length - 1]?.c ?? 0;
      map.set(sym, { symbol: sym, price, candles });
    } catch {
      map.set(sym, { symbol: sym, price: 0, candles: [] });
    }
  }

  return map;
}
