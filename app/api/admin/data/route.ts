import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { announcementsDb } from "@/lib/announcements";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = db.findAll().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    tier: u.tier,
    deposited: u.deposited,
    profit: u.profit,
    balance: u.balance,
    createdAt: u.createdAt,
    referredBy: u.referredBy,
    pastorName: u.pastorName,
    pastorShareRate: u.pastorShareRate,
    suspended: u.suspended || false,
  }));

  const withdrawals = db
    .findAll()
    .flatMap((u) =>
      u.withdrawals.map((w) => ({
        id: w.id,
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        amount: w.amount,
        requestedAt: w.requestedAt,
        status: w.status,
      }))
    )
    .sort((a, b) => b.requestedAt - a.requestedAt);

  const pastors = pastorsDb.approved().map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    ministry: p.ministry,
    shareRate: p.shareRate,
    earnedTotal: p.earnedTotal,
    available: pastorsDb.available(p),
    referrals: p.referrals,
    payouts: p.payouts || [],
    profitHistory: p.profitHistory || [],
  }));
  const pastorApplications = pastorsDb
    .all()
    .filter((p) => p.status === "pending")
    .map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      ministry: p.ministry,
      message: p.message,
      shareRate: p.shareRate,
      createdAt: p.createdAt,
    }));

  return NextResponse.json({
    users,
    withdrawals,
    pastors,
    pastorApplications,
    announcements: announcementsDb.all(),
  });
}
