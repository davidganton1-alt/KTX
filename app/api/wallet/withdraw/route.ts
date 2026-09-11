import { NextRequest, NextResponse } from "next/server";
import { requireActiveSession, supabaseIdFor } from "@/lib/auth";
import { db } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase";
import { syncWalletFromJson } from "@/lib/wallet";

export const dynamic = "force-dynamic";

// Withdraw PROFIT only. JSON remains the operational store (pending review
// list, reject restores funds); the Supabase transactions table records the
// withdrawal and the wallets row is re-synced as the funds ledger.
export async function POST(req: NextRequest) {
  const u = await requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { amount } = await req.json();
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0)
    return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });

  try {
    // throws "You can only withdraw profit." when amt > u.profit
    const w = db.requestWithdrawal(u.id, amt);
    db.notify(u.id, `Withdrawal of $${amt.toFixed(2)} requested and pending review.`, "withdrawal");
    const firstWithdrawal = !u.hasSharedFirstWithdrawal;
    db.update(u.id, { hasSharedFirstWithdrawal: true });

    const fresh = db.findById(u.id)!;
    const sid = supabaseIdFor(u.id);
    let tx = null;
    if (sid) {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: sid,
          type: "withdrawal",
          amount: amt,
          status: "pending",
          notes: `profit withdrawal ${w.id}`,
        })
        .select()
        .single();
      if (error) console.error("[withdraw] transaction insert failed:", error.message);
      else tx = data;
      await syncWalletFromJson(sid, fresh);
    }

    return NextResponse.json({
      ok: true,
      withdrawal: w,
      transaction: tx,
      firstWithdrawal,
      profit: fresh.profit,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
