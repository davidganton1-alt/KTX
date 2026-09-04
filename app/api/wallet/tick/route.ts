import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { requireActiveSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SYMBOLS = ["BTC","ETH","SOL","AAPL","MSFT","NVDA","TSLA","AMZN","GOOGL","META","XAU","WTI","NG","WHEAT","COPPER"];
const SIDES = ["BUY", "SELL"] as const;

// A small live accrual tick: 1/240 of the daily target per call (~every few
// seconds), capped so total never exceeds the daily target. Also emits a
// synthetic trade so the user sees the AI "working".
export async function POST(req: NextRequest) {
  const u = requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (u.dailyRate <= 0 || u.deposited <= 0)
    return NextResponse.json({ ok: true, tick: 0, trade: null });

  const principal = u.deposited + (u.deposited > 0 ? u.freeCredit : 0);
  const dailyTarget = +(principal * u.dailyRate).toFixed(2);
  const tickSize = +(dailyTarget / 240).toFixed(4);
  const earnedToday = u.profitHistory
    .filter((h) => h.date === u.lastProfitDate)
    .reduce((s, h) => s + h.profit, 0);
  const remaining = +(dailyTarget - earnedToday).toFixed(4);

  let tick = 0;
  if (remaining > 0) {
    tick = Math.min(tickSize, remaining);
    // small live randomness so the ticker feels alive
    tick = +(tick * (0.6 + Math.random() * 0.8)).toFixed(4);
    db.accrueAmount(u.id, tick);
  }

  // synthetic trade
  const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const side = SIDES[Math.floor(Math.random() * 2)];
  const trade = {
    id: cryptoRandom(),
    symbol: sym,
    side,
    qty: +(Math.random() * 2 + 0.01).toFixed(4),
    at: Date.now(),
  };

  return NextResponse.json({ ok: true, tick, trade, profit: u.profit, balance: u.balance });
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
