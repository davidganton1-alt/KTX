import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { creditWallet, debitWallet } from '@/lib/walletService';
import { plisioWithdraw, plisioTickerFor } from '@/lib/plisioPayout';

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
    if (!['approve', 'reject', 'mark_paid'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve, reject or mark_paid' }, { status: 400 });
    }

    // Phase S.1: manual paid-out for rows parked in awaiting_engine_transfer
    // (previously referral rows had NO manual completion path — an erc20 or
    // gateway-blocked request could never be closed except by failing it).
    if (action === 'mark_paid') {
      const { data: w } = await supabaseAdmin
        .from('withdrawals').select('*')
        .eq('id', withdrawal_id).eq('withdrawal_type', 'referral')
        .eq('status', 'awaiting_engine_transfer').maybeSingle();
      if (!w) return NextResponse.json({ error: 'Not found or not awaiting transfer' }, { status: 404 });
      await supabaseAdmin.from('withdrawals').update({
        status: 'completed', completed_at: new Date().toISOString(),
        admin_approved_by: session.id,
        admin_notes: admin_notes ? `${w.admin_notes || ''} | ${admin_notes}` : (w.admin_notes || 'Paid out manually.'),
      }).eq('id', withdrawal_id);
      try {
        const { legacyIdFor } = await import('@/lib/auth');
        const { db } = await import('@/lib/store');
        db.notify(legacyIdFor(w.user_id), `Referral withdrawal of $${Number(w.amount).toFixed(2)} has been paid out.`, 'withdrawal');
      } catch {}
      return NextResponse.json({ success: true, message: 'Marked as paid' });
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
      try {
        const { emails } = await import('@/lib/email/service');
        const { getRecipient } = await import('@/lib/email/recipient');
        const recip = await getRecipient(withdrawal.user_id);
        if (recip) emails.referralWithdrawalDecision(recip.email, { name: recip.name, amount: Number(withdrawal.amount), approved: false, reason: admin_notes || undefined });
      } catch {}
      return NextResponse.json({ success: true, message: 'Withdrawal rejected' });
    }

    // APPROVE: debit the referral wallet atomically
    const amt = Number(withdrawal.amount);
    const net = String(withdrawal.network || 'trc20');

    // Phase S.1: claim to 'processing' before moving money (double-click /
    // second-admin protection; 'processing' is already a legal withdrawals
    // status used by the profit flow).
    const { data: claimedRow } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'processing', admin_approved_by: session.id, admin_approved_at: new Date().toISOString() })
      .eq('id', withdrawal_id)
      .eq('status', 'pending_approval')
      .select('id')
      .maybeSingle();
    if (!claimedRow) {
      return NextResponse.json({ error: 'Withdrawal already being processed' }, { status: 409 });
    }

    // Phase S.1: re-validate the user's committed total at APPROVAL time, not
    // just at request time — closes the check-then-insert race where two
    // concurrent requests both passed the available check. The row we are
    // approving counts as committed; other open rows must not exceed matured.
    try {
      const nowIso = new Date().toISOString();
      const { data: maturedRows } = await supabaseAdmin
        .from('referral_earnings').select('amount')
        .eq('referrer_id', withdrawal.user_id).lte('available_at', nowIso);
      const { data: openRows } = await supabaseAdmin
        .from('withdrawals').select('amount')
        .eq('user_id', withdrawal.user_id).eq('withdrawal_type', 'referral')
        .in('status', ['pending_approval', 'approved', 'processing', 'completed']);
      const maturedTotal = (maturedRows || []).reduce((s, e) => s + Number(e.amount), 0);
      const openTotal = (openRows || []).reduce((s, w) => s + Number(w.amount), 0);
      if (openTotal > maturedTotal + 0.01) {
        await supabaseAdmin.from('withdrawals').update({
          status: 'failed',
          admin_notes: `Over-subscribed at approval: committed $${openTotal.toFixed(2)} > matured $${maturedTotal.toFixed(2)}`,
        }).eq('id', withdrawal_id);
        return NextResponse.json({ error: 'User has exceeded matured referral earnings across open requests. This one was failed and released.' }, { status: 409 });
      }
    } catch (ve: any) {
      console.error('[referral-approvals] committed re-validation error (proceeding with care):', ve.message);
    }

    const debitSuccess = await debitWallet('referral', amt, 'withdrawal', withdrawal.user_id, withdrawal.id, 'Referral withdrawal (approved)');
    if (!debitSuccess) {
      await supabaseAdmin.from('withdrawals').update({ status: 'failed', admin_notes: 'Referral wallet insufficient at approval time' }).eq('id', withdrawal_id);
      return NextResponse.json({ error: 'Failed to debit referral wallet' }, { status: 500 });
    }

    try {
      const ticker = plisioTickerFor(String(withdrawal.network || 'trc20'));
      if (!ticker) {
        // Legacy/unsupported network row (e.g. erc20 created before Phase M.5):
        // keep the debit reserved and park for manual settlement + mark_paid
        // instead of failing and refunding into an unpayable loop.
        await supabaseAdmin.from('withdrawals').update({
          status: 'awaiting_engine_transfer',
          admin_notes: `Unsupported payout network '${withdrawal.network}'. Settle manually, then Mark paid.`,
        }).eq('id', withdrawal_id);
        return NextResponse.json({ success: true, message: 'Parked as awaiting manual transfer (unsupported network)' });
      }
      const payout = await plisioWithdraw({
        currency: ticker,
        toAddress: String(withdrawal.destination_address),
        amount: amt,
      });
      if (!payout.ok) throw new Error(payout.error || 'Payout failed');

      await supabaseAdmin
        .from('withdrawals')
        .update({
          nowpayments_payout_id: String(payout.txId || ''),
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

      try {
        const { emails } = await import('@/lib/email/service');
        const { getRecipient } = await import('@/lib/email/recipient');
        const recip = await getRecipient(withdrawal.user_id);
        if (recip) emails.referralWithdrawalDecision(recip.email, { name: recip.name, amount: amt, approved: true, network: net.toUpperCase() });
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Withdrawal approved and sent',
        payout_id: payout.txId,
      });
    } catch (payoutError: any) {
      // Payout failed -> refund the referral wallet (credit, not negative debit)
      // Phase S.1: the rollback result is now CHECKED. If the refund credit
      // itself fails, the row stays 'processing' (reservation held) with a
      // CRITICAL log — the user cannot re-request money sitting in a wallet we
      // could not restore.
      const rolledBack = await creditWallet('referral', amt, 'withdrawal', withdrawal.user_id, undefined, `ROLLBACK payout failed (withdrawal ${withdrawal.id}): ${payoutError.message}`.slice(0, 200));
      if (!rolledBack) {
        console.error('[referral-approvals] CRITICAL: refund credit FAILED for withdrawal %s ($%s). Row held in processing for manual reconciliation.', withdrawal_id, amt);
        return NextResponse.json({ error: 'Payout failed AND refund needs manual review.', rolled_back: false }, { status: 502 });
      }
      await supabaseAdmin
        .from('withdrawals')
        .update({ status: 'failed', admin_notes: `Payout failed: ${payoutError.message}`.slice(0, 200) })
        .eq('id', withdrawal_id);
      // Phase G: tell the user their payout failed (queued, best-effort)
      try {
        const { emails } = await import('@/lib/email/service');
        const { getRecipient } = await import('@/lib/email/recipient');
        const recip = await getRecipient(withdrawal.user_id);
        if (recip) emails.referralWithdrawalDecision(recip.email, { name: recip.name, amount: amt, approved: false, reason: 'Payout processing failed — funds returned; please re-request.' });
      } catch {}
      return NextResponse.json({ error: 'Payout failed: ' + payoutError.message, rolled_back: true }, { status: 502 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
