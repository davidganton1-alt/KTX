import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { requireActiveSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Withdraw PROFIT only. Principal (deposits + free credit) is never withdrawn.
export async function POST(req: NextRequest) {
  const user = requireActiveSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { amount } = await req.json();
  try {
    const w = db.requestWithdrawal(user.id, Number(amount));
    db.notify(user.id, `Withdrawal of $${Number(amount).toFixed(2)} requested and pending review.`, "withdrawal");
    return NextResponse.json({ ok: true, withdrawal: w });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
