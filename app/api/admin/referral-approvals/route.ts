import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { creditWallet, debitWallet } from '@/lib/walletService';
import { createWithdrawal, usdtTicker } from '@/lib/plisio';

export const dynamic = 'force-dynamic';

// Admin: list + process pending referral withdrawal requests.
// Approval is when money actually moves (referral wallet -> Plisio payout).

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('id, user_id, amount, network, destination_address, status, created_at, profiles:user_id(name, email)')
      .eq('withdrawal_type', 'referral')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ withdrawals: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { withdrawal_id, action, admin_notes } = await req.json();

    if (!withdrawal_id) {
      return NextResponse.json({ error: 'withdrawal_id required' }, { status: 400 });
    }
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    // Conditional fetch: only a still-pending request can be processed
    const { data: withdrawal } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawal_id)
      .eq('withdrawal_type', 'referral')
      .eq('status', 'pending_approval')
      .maybeSingle();

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found or already processed' }, { status: 404 });
    }

    if (action === 'reject') {
      await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'rejected',
          admin_approved_by: session.id,
          admin_approved_at: new Date().toISOString(),
          admin_notes: admin_notes || 'Rejected by admin',
        })
        .eq('id', withdrawal_id);
      // no funds moved; the reservation is released automatically
      try {
        const { legacyIdFor } = await import('@/lib/auth');
        const { db } = await import('@/lib/store');
        db.notify(legacyIdFor(withdrawal.user_id), `Referral withdrawal of $${Number(withdrawal.amount).toFixed(2)} was not approved.`, 'withdrawal');
      } catch {}
      return NextResponse.json({ success: true, message: 'Withdrawal rejected' });
    }

    // APPROVE: debit the referral wallet atomically
    const amt = Number(withdrawal.amount);
    const net = String(withdrawal.network || 'trc20');
    const debitSuccess = await debitWallet('referral', amt, 'withdrawal', withdrawal.user_id, withdrawal.id, 'Referral withdrawal (approved)');
    if (!debitSuccess) {
      await supabaseAdmin.from('withdrawals').update({ status: 'failed', admin_notes: 'Referral wallet insufficient at approval time' }).eq('id', withdrawal_id);
      return NextResponse.json({ error: 'Failed to debit referral wallet' }, { status: 500 });
    }

    try {
      const payout = await createWithdrawal({
        currency: usdtTicker(net as 'trc20' | 'bep20' | 'erc20'),
        to: withdrawal.destination_address,
        amount: amt,
      });

      await supabaseAdmin
        .from('withdrawals')
        .update({
          nowpayments_payout_id: String(payout.id || payout.txn_id || ''),
          status: 'completed',
          admin_approved_by: session.id,
          admin_approved_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          admin_notes: admin_notes || null,
        })
        .eq('id', withdrawal_id);

      try {
        const { legacyIdFor } = await import('@/lib/auth');
        const { db } = await import('@/lib/store');
        db.notify(legacyIdFor(withdrawal.user_id), `Referral withdrawal of $${amt.toFixed(2)} approved and sent (${net.toUpperCase()}).`, 'withdrawal');
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Withdrawal approved and sent',
        payout_id: payout.id || payout.txn_id,
      });
    } catch (payoutError: any) {
      // Payout failed -> refund the referral wallet (credit, not negative debit)
      await creditWallet('referral', amt, 'withdrawal', withdrawal.user_id, withdrawal.id, `ROLLBACK payout failed: ${payoutError.message}`.slice(0, 200));
      await supabaseAdmin
        .from('withdrawals')
        .update({ status: 'failed', admin_notes: `Payout failed: ${payoutError.message}`.slice(0, 200) })
        .eq('id', withdrawal_id);
      return NextResponse.json({ error: 'Payout failed: ' + payoutError.message, rolled_back: true }, { status: 502 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
