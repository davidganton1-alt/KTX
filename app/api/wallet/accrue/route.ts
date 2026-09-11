import { NextRequest, NextResponse } from "next/server";
import { requireActiveSession, supabaseIdFor } from "@/lib/auth";
import { db } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase";
import { syncWalletFromJson } from "@/lib/wallet";

export const dynamic = "force-dynamic";

// Accrue today's profit for the calling user (idempotent per day).
// The JSON accrual still runs (it also credits the referring pastor's share
// via pastorsDb inside db.accrueDaily); the Supabase ledger receives a
// completed 'profit' transaction and the synced wallets row.
export async function POST(_req: NextRequest) {
  const u = await requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const updated = db.accrueDaily(u.id);
  const gained = +(updated.profit - u.profit).toFixed(4);
  const todayProfit = updated.profitHistory[updated.profitHistory.length - 1]?.profit ?? 0;

  const sid = supabaseIdFor(u.id);
  if (sid) {
    if (gained > 0) {
      const { error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: sid,
          type: "profit",
          amount: gained,
          status: "completed",
          notes: "daily accrual",
        });
      if (error) console.error("[accrue] transaction insert failed:", error.message);
    }
    await syncWalletFromJson(sid, updated);
  }

  return NextResponse.json({
    ok: true,
    profit: updated.profit,
    balance: updated.balance,
    lastProfitDate: updated.lastProfitDate,
    todayProfit: gained > 0 ? todayProfit : 0,
  });
}
