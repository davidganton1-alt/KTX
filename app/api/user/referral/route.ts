import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { requireActiveSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Member referral program: your invite code/link, and the members you invited.
export async function GET() {
  const u = requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const code = db.ensureReferralCode(u.id);
  const invited = db.findAll().filter((m) => m.memberReferredBy === u.id);

  return NextResponse.json({
    code,
    link: `/register?ref=${code}`,
    bonus: db.MEMBER_REFERRAL_BONUS,
    referralBonusEarned: u.referralBonusEarned,
    referrals: invited.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      tier: m.tier,
      joinedAt: m.createdAt,
      funded: m.deposited > 0,
    })),
  });
}
