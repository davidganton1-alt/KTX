import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { processProfitWithdrawal } from '@/lib/profitWithdraw';

export const dynamic = 'force-dynamic';

// Automatic profit withdrawal: payout wallet -> NOWPayments -> user address.
// No admin approval by design (spec); safety comes from the atomic payout
// debit + real-time address validation. Shared core in lib/profitWithdraw.ts
// (also used by the legacy /api/wallet/withdraw proxy).
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { amount, network, address } = await req.json();

    const res = await processProfitWithdrawal(session.id, Number(amount), String(network || 'trc20'), String(address || ''));
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }
    return NextResponse.json(res.data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
