import { NextRequest, NextResponse } from "next/server";
import { requireActiveSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { TIER_RATES } from "@/lib/profitAccrual";

export const dynamic = "force-dynamic";

const SYMBOLS = ["BTC","ETH","SOL","AAPL","MSFT","NVDA","TSLA","AMZN","GOOGL","META","XAU","WTI","NG","WHEAT","COPPER"];
const SIDES = ["BUY", "SELL"] as const;

// Phase C.5: money no longer moves here. Funds accrue once daily via
// /api/profit/accrue or the cron (Supabase ledger). This endpoint is kept
// for the live activity UI: it returns a display-only 1/240th slice of the
// tier's daily target plus a synthetic trade, reading REAL profit/balance
// from the new ledger.
export async function POST(_req: NextRequest) {
  const u = await requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [{ data: w }, { data: prof }] = await Promise.all([
    supabaseAdmin.from("wallets").select("principal, free_credit, tier").eq("user_id", u.id).maybeSingle(),
    supabaseAdmin.from("profiles").select("accumulated_profit, total_profit_withdrawn").eq("id", u.id).maybeSingle(),
  ]);

  const principal = Number(w?.principal || 0) + Number(w?.free_credit || 0);
  const rate = TIER_RATES[String(w?.tier || "")] || 0;
  const available = +(Number(prof?.accumulated_profit || 0) - Number(prof?.total_profit_withdrawn || 0)).toFixed(4);

  let tick = 0;
  if (principal > 0 && rate > 0) {
    const tickSize = (principal * rate) / 240;
    tick = +(tickSize * (0.6 + Math.random() * 0.8)).toFixed(4);
  }

  const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const side = SIDES[Math.floor(Math.random() * 2)];
  const trade = {
    id: cryptoRandom(),
    symbol: sym,
    side,
    qty: +(Math.random() * 2 + 0.01).toFixed(4),
    at: Date.now(),
  };

  return NextResponse.json({ ok: true, tick, trade, profit: available, balance: principal + available });
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
