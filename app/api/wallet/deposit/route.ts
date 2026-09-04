import { NextRequest, NextResponse } from "next/server";
import { db, TIERS, type Tier } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { requireActiveSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = requireActiveSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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
