import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { creditWallet, debitWallet } from '@/lib/walletService';
import { legacyIdFor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Admin: principal withdrawal approvals.
// Approve = debit hot wallet (user's net after fee) + move the request to
// 'awaiting_engine_transfer' (company then converts XMR->USDT and tops the
// hot wallet manually; alert shown in the Financial panel).
// Reject/failed = refund the reserved principal to the user's wallet.

async function refundPrincipal(withdrawal: any, reason: string) {
  try {
    const { data: w } = await supabaseAdmin
      .from('wallets')
      .select('id, principal')
      .eq('user_id', withdrawal.user_id)
      .maybeSingle();
    if (w) {
      await supabaseAdmin
        .from('wallets')
        .update({
          principal: +(Number(w.principal) + Number(withdrawal.amount)).toFixed(2),
          updated_at: new Date().toISOString(),
        })
        .eq('id', w.id);
    }
    const { db } = await import('@/lib/store');
    db.notify(legacyIdFor(withdrawal.user_id), `Principal withdrawal of $${Number(withdrawal.amount).toFixed(2)} ${reason}. Funds returned to your plan.`, 'withdrawal');
  } catch (e: any) {
    console.error('[principal-approvals] refund failed:', e.message);
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('id, user_id, amount, net_amount, network, destination_address, status, created_at, admin_notes, profiles:user_id(name, email)')
      .eq('withdrawal_type', 'principal')
      .in('status', ['pending_approval', 'awaiting_engine_transfer'])
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

    // two action sets: approve/reject on pending requests,
    // and mark-paid on ones already awaiting the engine transfer
    if (!['approve', 'reject', 'mark_paid'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve, reject or mark_paid' }, { status: 400 });
    }

    if (action === 'mark_paid') {
      const { data: w } = await supabaseAdmin
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawal_id)
        .eq('status', 'awaiting_engine_transfer')
        .maybeSingle();
      if (!w) {
        return NextResponse.json({ error: 'Not found or not awaiting transfer' }, { status: 404 });
      }
      await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          admin_notes: admin_notes ? `${w.admin_notes || ''} | ${admin_notes}` : (w.admin_notes || 'Paid out manually.'),
        })
        .eq('id', withdrawal_id);
      try {
        const { db } = await import('@/lib/store');
        db.notify(legacyIdFor(w.user_id), `Principal withdrawal of $${Number(w.net_amount).toFixed(2)} has been paid out.`, 'withdrawal');
      } catch {}
      return NextResponse.json({ success: true, message: 'Marked as paid' });
    }

    const { data: withdrawal } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawal_id)
      .eq('withdrawal_type', 'principal')
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
      await refundPrincipal(withdrawal, 'was rejected');
      return NextResponse.json({ success: true, message: 'Withdrawal rejected, principal returned' });
    }

    // APPROVE: commit the payout obligation against the hot wallet
    const netAmt = Number(withdrawal.net_amount);
    const debitSuccess = await debitWallet('hot', netAmt, 'withdrawal', withdrawal.user_id, withdrawal.id, `Principal withdrawal (net after fee)`);
    if (!debitSuccess) {
      // hot wallet short: fail the request AND return the reserved principal
      await supabaseAdmin
        .from('withdrawals')
        .update({ status: 'failed', admin_notes: 'Hot wallet insufficient at approval; principal returned' })
        .eq('id', withdrawal_id);
      await refundPrincipal(withdrawal, 'failed (hot wallet short)');
      return NextResponse.json({ error: 'Hot wallet insufficient - request failed and principal returned. Top up via Engine first.' }, { status: 503 });
    }

    await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'awaiting_engine_transfer',
        admin_approved_by: session.id,
        admin_approved_at: new Date().toISOString(),
        admin_notes: 'Approved. Awaiting Engine→Hot transfer (company manual action).',
      })
      .eq('id', withdrawal_id);

    try {
      const { db } = await import('@/lib/store');
      db.notify(legacyIdFor(withdrawal.user_id), `Principal withdrawal approved — $${netAmt.toFixed(2)} is being prepared for payout.`, 'withdrawal');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Withdrawal approved. Awaiting Engine→Hot wallet transfer (manual company action).',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
