import { NextResponse } from "next/server";
import { db, TIERS, type Tier } from "@/lib/store";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const u = db.findById(user.id);
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    tier: u.tier,
    freeCredit: u.freeCredit,
    deposited: u.deposited,
    balance: u.balance,
    profit: u.profit,
    dailyRate: u.dailyRate,
    lastProfitDate: u.lastProfitDate,
    profitHistory: u.profitHistory,
    deposits: u.deposits,
    holdMonths: TIERS[u.tier as Exclude<Tier, "none">]?.holdMonths ?? 0,
    withdrawals: u.withdrawals,
    freeCreditUnlocked: u.deposited > 0,
    emailVerified: u.emailVerified,
    twoFactorEnabled: u.twoFactorEnabled,
    pastorName: u.pastorName,
    pastorShareRate: u.pastorShareRate,
    referralBonusEarned: u.referralBonusEarned,
    memberReferralsCount: u.memberReferrals.length,
    notifications: u.notifications,
    lastSeenNotifs: u.lastSeenNotifs,
    suspended: u.suspended || false,
  });
}
