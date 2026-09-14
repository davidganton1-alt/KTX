import { NextRequest, NextResponse } from "next/server";
import { requireActiveSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { accrueUserProfit } from "@/lib/profitAccrual";

export const dynamic = "force-dynamic";

// Phase C.5: the legacy JSON accrual engine is retired — this route now
// proxies to the Supabase profit ledger (profiles.accumulated_profit) so
// older pages (app/dashboard) keep working. Idempotent per UTC day.
export async function POST(_req: NextRequest) {
  const u = await requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const result = await accrueUserProfit(u.id);
  if (!result.success) {
    return NextResponse.json({ error: result.error || "Accrual failed" }, { status: 400 });
  }

  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("accumulated_profit, total_profit_withdrawn, last_profit_accrual_at")
    .eq("id", u.id)
    .maybeSingle();
  const { data: w } = await supabaseAdmin
    .from("wallets")
    .select("principal, free_credit")
    .eq("user_id", u.id)
    .maybeSingle();

  const available = +(Number(prof?.accumulated_profit || 0) - Number(prof?.total_profit_withdrawn || 0)).toFixed(4);
  const balance = +((Number(w?.principal || 0) + Number(w?.free_credit || 0) + available)).toFixed(4);

  return NextResponse.json({
    ok: true,
    profit: available,
    balance,
    lastProfitDate: prof?.last_profit_accrual_at
      ? new Date(prof.last_profit_accrual_at).toISOString().slice(0, 10)
      : "",
    todayProfit: result.profitEarned,
  });
}
