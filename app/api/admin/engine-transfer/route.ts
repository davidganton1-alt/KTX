import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { transferBetweenWallets } from '@/lib/walletService';

export const dynamic = 'force-dynamic';

// Admin: record an Engine->Hot custody transfer in the internal ledger.
// Physical movement (XMR conversion -> USDT into the hot wallet) happens
// out-of-band; this keeps platform_wallets honest about what's in custody.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { amount, notes } = await req.json();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const ok = await transferBetweenWallets(
      'engine',
      'hot',
      amt,
      'transfer',
      String(notes || 'Engine→Hot custody transfer (recorded)')
    );
    if (!ok) {
      return NextResponse.json({ error: 'Transfer failed (engine balance short or ledger error)' }, { status: 409 });
    }
    return NextResponse.json({ ok: true, amount: amt });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
