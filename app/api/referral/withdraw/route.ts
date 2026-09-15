import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getWalletBalance } from '@/lib/walletService';
import { isValidUSDTAddress } from '@/lib/plisio';

export const dynamic = 'force-dynamic';

// Referral withdrawals need ADMIN APPROVAL (unlike profit withdrawals).
// Request phase only: validate + reserve; funds move on approval
// (app/api/admin/referral-approvals).
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { amount, network, address } = await req.json();

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }
    const validNetworks = ['trc20', 'bep20', 'erc20'];
    const net = String(network || 'trc20');
    if (!validNetworks.includes(net)) {
      return NextResponse.json({ error: 'Invalid network (must be trc20, bep20, or erc20)' }, { status: 400 });
    }
    if (!isValidUSDTAddress(address.trim(), net)) {
      return NextResponse.json({ error: `Invalid ${net.toUpperCase()} USDT address format` }, { status: 400 });
    }

    // Available = matured earnings minus amounts already committed to
    // open withdrawal requests (prevents double-reserving the same money).
    const nowIso = new Date().toISOString();
    const [{ data: matured }, { data: committed }] = await Promise.all([
      supabaseAdmin
        .from('referral_earnings')
        .select('amount')
        .eq('referrer_id', session.id)
        .lte('available_at', nowIso),
      supabaseAdmin
        .from('withdrawals')
        .select('amount')
        .eq('user_id', session.id)
        .eq('withdrawal_type', 'referral')
        .in('status', ['pending_approval', 'approved', 'processing', 'completed']),
    ]);

    const maturedTotal = (matured || []).reduce((s, e) => s + Number(e.amount), 0);
    const committedTotal = (committed || []).reduce((s, w) => s + Number(w.amount), 0);
    const availableBalance = +(maturedTotal - committedTotal).toFixed(4);

    if (availableBalance < amt) {
      return NextResponse.json({
        error: `Insufficient available balance. Available: $${Math.max(0, availableBalance).toFixed(2)}`,
      }, { status: 400 });
    }

    // Soft platform-capacity check (actual debit happens on admin approval)
    const walletBalance = await getWalletBalance('referral');
    if (walletBalance < amt) {
      return NextResponse.json({ error: 'Referral wallet temporarily low. Please try again later.' }, { status: 503 });
    }

    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        user_id: session.id,
        wallet_source: 'referral',
        withdrawal_type: 'referral',
        amount: amt,
        network_fee: 0,
        net_amount: amt,
        currency: 'usdt' + net,
        network: net,
        destination_address: address.trim(),
        status: 'pending_approval',
      })
      .select()
      .single();

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ error: 'Failed to create withdrawal record' }, { status: 500 });
    }

    // Phase G: request-received email (queued)
    try {
      const { emails } = await import('@/lib/email/service');
      emails.referralWithdrawalRequested(session.email, {
        name: session.name || 'there',
        amount: amt,
        reviewBy: new Date(Date.now() + 24 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' (12–24h)',
      });
    } catch {}

    return NextResponse.json({
      success: true,
      withdrawal_id: withdrawal.id,
      amount: amt,
      status: 'pending_approval',
      message: 'Withdrawal request submitted. Awaiting admin approval (12-24 hours).',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
