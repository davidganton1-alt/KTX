import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { creditWallet, debitWallet, getWalletBalance } from '@/lib/walletService';
import { createPayout, validatePayoutAddress } from '@/lib/nowpayments';

export const dynamic = 'force-dynamic';

// Automatic profit withdrawal: payout wallet -> NOWPayments -> user address.
// No admin approval by design (spec); safety comes from the atomic payout
// debit + real-time address validation.
//
// Paste corrections applied:
//  - rollback now CREDITS (the sketch called debitWallet with a negative
//    amount, which debitWallet rejects, and 'withdrawal_rollback' is not a
//    valid transaction_type in the audit CHECK).
//  - currency stored as the network-specific coin (usdttrc20 etc.) matching
//    the deposits convention from Phase A.
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
    const coin = 'usdt' + net; // usdttrc20 | usdt20(eth) ... NOWPayments codes

    // User's available accumulated profit
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('accumulated_profit, total_profit_withdrawn')
      .eq('id', session.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const availableProfit = +(Number(profile.accumulated_profit || 0) - Number(profile.total_profit_withdrawn || 0)).toFixed(4);
    if (availableProfit < amt) {
      return NextResponse.json({ error: `Insufficient profit. Available: $${availableProfit.toFixed(2)}` }, { status: 400 });
    }

    // Reserve BEFORE calling out: atomic debit on the payout wallet (RPC
    // rejects if funds moved under us, so no overdraft is possible).
    const payoutBalance = await getWalletBalance('payout');
    if (payoutBalance < amt) {
      return NextResponse.json({ error: 'Payout wallet temporarily low. Please try again later.' }, { status: 503 });
    }

    // Validate destination address against NOWPayments
    let valid = true;
    try {
      const validation = await validatePayoutAddress(address.trim(), coin);
      valid = validation.result;
    } catch (e: any) {
      // validation API hiccup: refuse rather than send to an unchecked address
      return NextResponse.json({ error: 'Address validation unavailable, please retry.' }, { status: 502 });
    }
    if (!valid) {
      return NextResponse.json({ error: 'Invalid destination address for ' + coin.toUpperCase() }, { status: 400 });
    }

    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        user_id: session.id,
        wallet_source: 'payout',
        withdrawal_type: 'profit',
        amount: amt,
        network_fee: 0,
        net_amount: amt,
        currency: coin,
        network: net,
        destination_address: address.trim(),
        status: 'processing',
      })
      .select()
      .single();

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ error: 'Failed to create withdrawal record' }, { status: 500 });
    }

    const debitSuccess = await debitWallet('payout', amt, 'withdrawal', session.id, withdrawal.id, 'Profit withdrawal');
    if (!debitSuccess) {
      await supabaseAdmin.from('withdrawals').update({ status: 'failed' }).eq('id', withdrawal.id);
      return NextResponse.json({ error: 'Payout wallet funds moved, please retry.' }, { status: 503 });
    }

    // Ask NOWPayments to actually pay out
    try {
      const payout = await createPayout({
        address: address.trim(),
        currency: coin,
        amount: amt,
      });

      await supabaseAdmin
        .from('withdrawals')
        .update({
          nowpayments_payout_id: String(payout.id),
          // NOWPayments payout is async: keep 'processing' until their
          // status says otherwise; UI shows it as on its way.
          status: payout.status === 'finished' || payout.status === 'confirming' ? 'completed' : 'processing',
          completed_at: payout.status === 'finished' ? new Date().toISOString() : null,
        })
        .eq('id', withdrawal.id);

      // Consume the user's profit balance only now that payout was accepted
      await supabaseAdmin
        .from('profiles')
        .update({
          total_profit_withdrawn: Number(profile.total_profit_withdrawn || 0) + amt,
        })
        .eq('id', session.id);

      // personal notification (JSON mirror during migration window)
      try {
        const { legacyIdFor } = await import('@/lib/auth');
        const { db } = await import('@/lib/store');
        db.notify(legacyIdFor(session.id), `Withdrawal of $${amt.toFixed(2)} is on its way (${net.toUpperCase()}).`, 'withdrawal');
      } catch {}

      return NextResponse.json({
        success: true,
        withdrawal_id: withdrawal.id,
        payout_id: payout.id,
        amount: amt,
        network: net,
        address: address.trim(),
      });
    } catch (payoutError: any) {
      // Payout failed -> refund the payout wallet
      await creditWallet('payout', amt, 'withdrawal', session.id, withdrawal.id, `ROLLBACK payout failed: ${payoutError.message}`.slice(0, 200));
      await supabaseAdmin.from('withdrawals').update({ status: 'failed' }).eq('id', withdrawal.id);
      return NextResponse.json({ error: 'Payout creation failed: ' + payoutError.message }, { status: 502 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
