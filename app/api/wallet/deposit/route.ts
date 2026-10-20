import { NextRequest, NextResponse } from "next/server";
import { db, TIERS, type Tier } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { requireActiveSession, supabaseIdFor } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getEngineMode } from "@/lib/engineMode";

export const dynamic = "force-dynamic";

// Phase S.1: this is the DEMO funding path only. It writes users.json money
// fields which wallet/state mirrors into Supabase — harmless while the
// platform runs in demo mode, but once LIVE it is a no-gateway self-credit
// backdoor. Hard rules:
//   1) engine mode must be 'demo'
//   2) the account must have ZERO gateway-backed deposits (any Supabase
//      deposit row that passed the webhook split has real money behind it —
//      demo funding after that would fork the ledger)
export async function POST(req: NextRequest) {
  const user = await requireActiveSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (getEngineMode() !== "demo") {
    return NextResponse.json(
      { error: "Demo funding is disabled while the platform runs in live mode. Make a real deposit instead." },
      { status: 410 }
    );
  }

  const sid = supabaseIdFor(user.id) || user.id;
  const { data: realDeposits, error: depErr } = await supabaseAdmin
    .from("deposits")
    .select("id")
    .eq("user_id", sid)
    .not("engine_wallet_amount", "is", null)
    .limit(1);
  if (!depErr && realDeposits && realDeposits.length > 0) {
    return NextResponse.json(
      { error: "This account has gateway-backed deposits; demo funding is disabled for it." },
      { status: 410 }
    );
  }

  const { amount, tier } = await req.json();
  const t = tier as Exclude<Tier, "none">;
  if (!TIERS[t]) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  const conf = TIERS[t];
  if (typeof amount !== "number" || amount < conf.min || amount > conf.max) {
    return NextResponse.json(
      { error: `Amount must be between $${conf.min} and $${conf.max} for ${conf.label}.` },
      { status: 400 }
    );
  }

  const firstDeposit = user.deposited === 0;
  const u = db.deposit(user.id, amount, t);

  // Member referral program: one-time bonus to the referrer on first funding.
  if (firstDeposit) db.creditMemberReferralBonus(user.id);

  // Pastor feed: record the deposit for the referring pastor.
  if (u.referredBy) pastorsDb.addDepositEvent(u.referredBy, u.name, amount);

  db.notify(user.id, `Deposit of $${amount.toLocaleString("en-US")} confirmed on the ${conf.label} plan.`, "system");

  return NextResponse.json({
    ok: true,
    balance: u.balance,
    freeCreditUnlocked: u.deposited > 0,
    tier: u.tier,
    dailyRate: u.dailyRate,
  });
}
