import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { getSession, legacyIdFor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const u = db.findById(legacyIdFor(user.id));
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { amount } = await req.json();
  const res = db.withdrawDeposit(legacyIdFor(user.id), Number(amount));
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  const fresh = db.findById(legacyIdFor(user.id))!;
  return NextResponse.json({
    ok: true,
    penaltyPct: Math.round(res.penalty * 100),
    net: res.net,
    deposited: fresh.deposited,
    balance: fresh.balance,
  });
}
