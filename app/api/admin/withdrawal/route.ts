import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const admin = getSession();
  if (!admin || admin.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const wid = req.nextUrl.searchParams.get("wid");
  const status = req.nextUrl.searchParams.get("status");
  if (!wid || (status !== "approved" && status !== "rejected"))
    return NextResponse.json({ error: "Bad request" }, { status: 400 });

  // find the user who owns this withdrawal
  const users = db.findAll();
  for (const u of users) {
    const w = u.withdrawals.find((x) => x.id === wid);
    if (w) {
      db.setWithdrawalStatus(u.id, wid, status as "approved" | "rejected");
      return NextResponse.json({ ok: true });
    }
  }
  return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
}
