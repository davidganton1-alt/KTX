// Strategy seam: you replace ONLY the body of generateTrades().
// The signature stays identical, so nothing else I build ever changes.

import type { EngineState, Position, Closed } from "./engine";
import { SYMBOLS, NOTIONAL, TRADE_TYPES, TECHNIQUES } from "./engine";

export interface MarketSnapshot {
  symbol: string;
  price: number;
  candles: { t: number; o: number; h: number; l: number; c: number }[];
}

export interface Trade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  entry: number;
  exit?: number;
  qty: number;
  notional: number;
  pnl?: number;
  openedAt: number;
  closedAt?: number;
  type: string;
  technique: string;
}

// DEMO implementation for now.
// YOU replace the BODY of this function with your real strategy (your trade secret).
// The signature stays identical, so nothing else I build ever changes.
export function generateTrades(state: EngineState, liveData: Map<string, MarketSnapshot>): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();

  // Close positions that have been held too long (demo: 30s–90s)
  for (let i = state.positions.length - 1; i >= 0; i--) {
    const p = state.positions[i];
    const held = now - p.openedAt;
    const maxHeld = 30000 + (p.id.charCodeAt(0) % 60000); // 30s–90s
    if (held > maxHeld || Math.random() > 0.92) {
      const snap = liveData.get(p.symbol);
      const cur = snap?.price ?? p.entry;
      const pnl = p.side === "BUY" ? (cur - p.entry) * p.qty : (p.entry - cur) * p.qty;
      trades.push({
        id: p.id, symbol: p.symbol, side: p.side,
        entry: p.entry, exit: +cur.toFixed(2), qty: p.qty,
        notional: p.notional, pnl: +pnl.toFixed(2),
        openedAt: p.openedAt, closedAt: now,
        type: p.type, technique: p.technique,
      });
      state.positions.splice(i, 1);
    }
  }

  // Open new positions across multiple symbols (demo: up to 8 concurrent)
  const wanted = Math.min(8, SYMBOLS.length);
  const toOpen = Math.max(0, wanted - state.positions.length);
  if (toOpen > 0) {
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
    let placed = 0;
    for (const sym of shuffled) {
      if (placed >= toOpen) break;
      if (state.positions.some((p) => p.symbol === sym)) continue;
      const snap = liveData.get(sym);
      if (!snap || snap.price <= 0) continue;
      const side: "BUY" | "SELL" = Math.random() > 0.5 ? "BUY" : "SELL";
      const qty = +(NOTIONAL / snap.price).toFixed(6);
      trades.push({
        id: Math.random().toString(36).slice(2, 10),
        symbol: sym, side,
        entry: +snap.price.toFixed(2), qty, notional: +(qty * snap.price).toFixed(2),
        openedAt: now,
        type: TRADE_TYPES[Math.floor(Math.random() * TRADE_TYPES.length)],
        technique: TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)],
      });
      state.positions.push({
        id: trades[trades.length - 1].id, symbol: sym, side,
        entry: trades[trades.length - 1].entry, qty, notional: trades[trades.length - 1].notional,
        openedAt: now,
        type: trades[trades.length - 1].type, technique: trades[trades.length - 1].technique,
      });
      placed++;
    }
  }

  return trades;
}
