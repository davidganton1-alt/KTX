import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidUSDTAddress } from '@/lib/plisio';

export const dynamic = 'force-dynamic';

// Principal withdrawal: ADMIN-APPROVED, 50% early-exit fee during the tier
// holding period, 0% after. Request phase reserves the principal (moves it
// out of `principal` so it can't be withdrawn twice); reject refunds it,
// approval hands off to admin/principal-approvals (hot wallet + engine
// transfer flow).
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
      return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
    }
    if (!isValidUSDTAddress(address.trim(), net)) {
      return NextResponse.json({ error: `Invalid ${net.toUpperCase()} USDT address` }, { status: 400 });
    }

    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('id, principal, tier, deposit_at')
      .eq('user_id', session.id)
      .maybeSingle();

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const principal = Number(wallet.principal || 0);
    if (principal < amt) {
      return NextResponse.json({ error: `Insufficient principal. Available: $${principal.toFixed(2)}` }, { status: 400 });
    }

    // Holding period: longest tier the user has reached (6/9/12 months)
    const tier = String(wallet.tier || 'faithful');
    const holdingMonths = tier === 'ambassador' ? 12 : tier === 'steward' ? 9 : 6;
    const depositDate = wallet.deposit_at ? new Date(wallet.deposit_at) : new Date();
    const holdingEndDate = new Date(depositDate);
    holdingEndDate.setMonth(holdingEndDate.getMonth() + holdingMonths);
    const inHoldingPeriod = new Date() < holdingEndDate;

    const fee = inHoldingPeriod ? 0.5 : 0;
    const netAmount = +(amt * (1 - fee)).toFixed(2);

    // Reserve first (atomic conditional decrement; refund on insert failure)
    const { data: reserved } = await supabaseAdmin
      .from('wallets')
      .update({ principal: +(principal - amt).toFixed(2), updated_at: new Date().toISOString() })
      .eq('id', wallet.id)
      .gte('principal', amt)
      .select('id')
      .maybeSingle();
    if (!reserved) {
      return NextResponse.json({ error: 'Principal moved while requesting, please retry.' }, { status: 409 });
    }

    // Reserve in the JSON operational store too — the state route mirrors
    // JSON -> Supabase wallets, so a JSON-only reservation would be undone
    // (and a Supabase-only one gets overwritten on the next read).
    const { legacyIdFor } = await import('@/lib/auth');
    const { db } = await import('@/lib/store');
    const lid = legacyIdFor(session.id);
    const ju = db.findById(lid);
    if (ju) {
      db.update(lid, { deposited: +(Number(ju.deposited || 0) - amt).toFixed(2) });
    }

    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        user_id: session.id,
        wallet_source: 'hot',
        withdrawal_type: 'principal',
        amount: amt,
        network_fee: +(amt - netAmount).toFixed(2),
        net_amount: netAmount,
        currency: 'usdt' + net,
        network: net,
        destination_address: address.trim(),
        status: 'pending_approval',
        admin_notes: inHoldingPeriod
          ? `Early withdrawal (${holdingMonths}-month hold). 50% fee applied.`
          : `Hold period complete. No fee.`,
      })
      .select()
      .single();

    if (withdrawalError || !withdrawal) {
      // release the reservation (both stores)
      await supabaseAdmin
        .from('wallets')
        .update({ principal: +(Number(wallet.principal)).toFixed(2) })
        .eq('id', wallet.id);
      try {
        const { legacyIdFor: lif } = await import('@/lib/auth');
        const { db: d } = await import('@/lib/store');
        const lid2 = lif(session.id);
        const ju2 = d.findById(lid2);
        if (ju2) d.update(lid2, { deposited: +(Number(ju2.deposited || 0) + amt).toFixed(2) });
      } catch {}
      return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 });
    }

    // notify via the JSON operational store (history only: intentionally NOT
    // added to the JSON withdrawals list, so the legacy admin review tab
    // can't process the same request through a second flow)
    try {
      const { legacyIdFor } = await import('@/lib/auth');
      const { db } = await import('@/lib/store');
      const lid = legacyIdFor(session.id);
      db.notify(lid, `Principal withdrawal of $${amt.toFixed(2)} requested${inHoldingPeriod ? ' (50% early fee applies)' : ''}.`, 'withdrawal');
    } catch {}

    return NextResponse.json({
      success: true,
      withdrawal_id: withdrawal.id,
      amount: amt,
      fee: fee * 100,
      net_amount: netAmount,
      in_holding_period: inHoldingPeriod,
      holding_end_date: holdingEndDate.toISOString(),
      message: `Principal withdrawal request submitted. Awaiting admin approval (12-24 hours). ${inHoldingPeriod ? '50% early exit fee applied.' : 'No fee - holding period complete.'}`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
