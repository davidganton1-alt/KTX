import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllWallets } from '@/lib/walletService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only admins can see platform wallet balances
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const wallets = await getAllWallets();

    return NextResponse.json({
      wallets,
      summary: {
        total_hot: wallets.find(w => w.wallet_type === 'hot')?.balance || 0,
        total_payout: wallets.find(w => w.wallet_type === 'payout')?.balance || 0,
        total_referral: wallets.find(w => w.wallet_type === 'referral')?.balance || 0,
        total_engine: wallets.find(w => w.wallet_type === 'engine')?.balance || 0,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
