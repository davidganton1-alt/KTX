import { NextRequest, NextResponse } from "next/server";
import { requireActiveSession } from "@/lib/auth";
import { processProfitWithdrawal } from "@/lib/profitWithdraw";

export const dynamic = "force-dynamic";

// Phase C.5: legacy JSON withdrawal flow is retired. Profit now lives in the
// Supabase ledger and pays out automatically to a crypto address via
// /api/profit/withdraw. This endpoint proxies to the same core so older
// clients that already send an address keep working; without one it points
// at the new flow instead of touching JSON funds.
export async function POST(req: NextRequest) {
  const u = await requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { amount, address, network } = await req.json().catch(() => ({} as any));

  if (!address) {
    return NextResponse.json(
      { error: "Profit withdrawals now pay straight to a crypto address (USDT). Open the Wallet tab and use Withdraw Profit." },
      { status: 400 }
    );
  }

  const res = await processProfitWithdrawal(u.id, Number(amount), String(network || "trc20"), String(address));
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: res.status });
  }
  return NextResponse.json({
    ok: true,
    withdrawal: { id: res.data.withdrawal_id, amount: res.data.amount, status: "processing" },
    payout_id: res.data.payout_id,
    firstWithdrawal: false,
    profit: 0,
  });
}
