import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Referral earnings dashboard data: totals split by the 7-day hold, with
// amounts already committed to pending/approved withdrawals subtracted from
// "available" so the same dollars can't be requested twice.
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const now = new Date();

    const [{ data: earnings, error }, { data: committed }] = await Promise.all([
      supabaseAdmin
        .from('referral_earnings')
        .select('*')
        .eq('referrer_id', session.id)
        .order('earned_at', { ascending: false }),
      supabaseAdmin
        .from('withdrawals')
        .select('amount, status')
        .eq('user_id', session.id)
        .eq('withdrawal_type', 'referral')
        .in('status', ['pending_approval', 'approved', 'processing', 'completed']),
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allEarnings = earnings || [];
    const committedTotal = (committed || []).reduce((sum, w) => sum + Number(w.amount), 0);

    const availableRows = allEarnings.filter((e) => new Date(e.available_at) <= now);
    const pendingRows = allEarnings.filter((e) => new Date(e.available_at) > now);

    const totalEarned = +allEarnings.reduce((s, e) => s + Number(e.amount), 0).toFixed(4);
    const grossAvailable = +availableRows.reduce((s, e) => s + Number(e.amount), 0).toFixed(4);
    // what's actually withdrawable right now = matured minus already-requested
    const availableBalance = +Math.max(0, grossAvailable - committedTotal).toFixed(4);
    const pendingBalance = +pendingRows.reduce((s, e) => s + Number(e.amount), 0).toFixed(4);

    return NextResponse.json({
      totalEarned,
      availableBalance,
      pendingBalance,
      inReviewBalance: +Math.min(committedTotal, grossAvailable).toFixed(4),
      principalCount: allEarnings.filter((e) => e.earning_type === 'principal').length,
      profitCount: allEarnings.filter((e) => e.earning_type === 'profit').length,
      earnings: allEarnings.slice(0, 50),
      available: availableRows.slice(0, 20),
      pending: pendingRows.slice(0, 20),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
