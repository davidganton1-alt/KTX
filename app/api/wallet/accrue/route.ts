import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Accrue today's profit for the calling user (idempotent per day).
export async function POST(req: NextRequest) {
  const user = getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const u = db.accrueDaily(user.id);
  return NextResponse.json({
    ok: true,
    profit: u.profit,
    balance: u.balance,
    lastProfitDate: u.lastProfitDate,
    todayProfit: u.profitHistory[u.profitHistory.length - 1]?.profit ?? 0,
  });
}
