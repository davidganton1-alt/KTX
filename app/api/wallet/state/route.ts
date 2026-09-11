import { NextResponse } from "next/server";
import { getSession, legacyIdFor } from "@/lib/auth";
import { db, TIERS, type Tier } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase";
import { syncWalletFromJson, walletBalance, type WalletRow } from "@/lib/wallet";

export const dynamic = "force-dynamic";

// Supabase wallets row is the funds record of truth; the JSON store still
// carries operational lists (withdrawals/deposits/profitHistory/notifications)
// during the migration window and is synced into Supabase on every read.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const jsonId = legacyIdFor(session.id);
  const u = db.findById(jsonId); // null for Supabase-only (newly registered) users

  if (u) await syncWalletFromJson(session.id, u);

  let { data: wallet } = await supabaseAdmin
    .from("wallets")
    .select("*")
    .eq("user_id", session.id)
    .maybeSingle();

  if (!wallet) {
    const { data: created } = await supabaseAdmin
      .from("wallets")
      .insert({
        user_id: session.id,
        free_credit: u?.freeCredit ?? 50,
        principal: 0,
        profit: 0,
        tier: "none",
      })
      .select()
      .single();
    wallet = created;
  }

  if (!wallet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const w = wallet as WalletRow;
  const tier = ((w.tier && w.tier !== "none" ? w.tier : u?.tier) || "none") as
    | Exclude<Tier, "none">
    | "none";
  const profit = Number(w.profit);
  const deposited = Number(w.principal);
  const freeCredit = Number(w.free_credit);
  const balance = walletBalance(w);
  const dailyRate = Number(w.daily_rate ?? u?.dailyRate ?? 0);

  return NextResponse.json({
    id: session.id,
    name: u?.name ?? session.name,
    email: u?.email ?? session.email,
    role: u?.role ?? session.role,
    tier,
    freeCredit,
    deposited,
    balance,
    profit,
    dailyRate,
    lastProfitDate: u?.lastProfitDate ?? "",
    profitHistory: u?.profitHistory ?? [],
    deposits: u?.deposits ?? [],
    holdMonths: TIERS[tier as Exclude<Tier, "none">]?.holdMonths ?? 0,
    withdrawals: u?.withdrawals ?? [],
    freeCreditUnlocked: deposited > 0,
    emailVerified: u?.emailVerified ?? true,
    twoFactorEnabled: u?.twoFactorEnabled ?? false,
    hasSharedFirstWithdrawal: u?.hasSharedFirstWithdrawal ?? false,
    trustpilotInvitations: u?.trustpilotInvitations ?? [],
    pastorName: u?.pastorName ?? null,
    pastorShareRate: u?.pastorShareRate ?? null,
    referralBonusEarned: u?.referralBonusEarned ?? 0,
    memberReferralsCount: u?.memberReferrals?.length ?? 0,
    notifications: u?.notifications ?? [],
    lastSeenNotifs: u?.lastSeenNotifs ?? 0,
    suspended: u?.suspended || false,
    accruedTotal: Number(w.accrued_total),
  });
}
