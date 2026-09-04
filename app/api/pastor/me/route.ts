import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Pastor's own panel data: their earnings, share rate, the flock they
// have referred (members linked to them), activity feed, payout history and
// shareable referral link.
export async function GET() {
  const s = getSession();
  if (!s) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const me = db.findById(s.id);
  if (!me || !me.isPastor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const pastor = pastorsDb.findById(me.id) || pastorsDb.findApprovedByName(me.name);
  const referred = db
    .findAll()
    .filter((u) => u.referredBy === me.id || u.pastorName === me.name)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      tier: u.tier,
      deposited: u.deposited,
      profit: u.profit,
      pastorShareRate: u.pastorShareRate,
    }));

  const earned = pastor?.earnedTotal ?? 0;
  const shareRate = pastor?.shareRate ?? 5;
  const available = pastor ? pastorsDb.available(pastor) : 0;
  // Shareable link: prefills the pastor's name on the register page.
  const inviteLink = `/register?pastor=${encodeURIComponent(pastor?.name ?? me.name)}`;

  // Leaderboard among approved pastors (by referrals, then earnings).
  const leaders = pastorsDb
    .approved()
    .slice()
    .sort((a, b) => b.referrals - a.referrals || b.earnedTotal - a.earnedTotal)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      ministry: p.ministry,
      referrals: p.referrals,
      earnedTotal: p.earnedTotal,
      isYou: p.id === pastor?.id,
    }));

  return NextResponse.json({
    name: me.name,
    email: me.email,
    earnedTotal: earned,
    available,
    shareRate,
    referrals: referred,
    referralsCount: referred.length,
    inviteLink,
    events: (pastor?.events ?? []).slice(0, 30),
    payouts: pastor?.payouts ?? [],
    profitHistory: pastor?.profitHistory ?? [],
    leaders,
  });
}
