import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getInvoiceStatus, signAsPlisioWebhook } from '@/lib/plisio';

export const dynamic = 'force-dynamic';

const GW_FUNDED = ['paid', 'accepted', 'exchanged', 'converted', 'finished', 'completed'];

// Phase S.1: if the gateway says the invoice FUNDED but our row never made
// it past a pre-funded state (missed/dropped webhooks), replay a locally
// signed payload into our own webhook — same atomic claim + replay-safe
// pipeline, no second code path, signature-guard preserved.
async function replayIfFunded(deposit: any): Promise<void> {
  try {
    // Phase S.1: replayable iff never fully credited (engine marker NULL) and
    // not already expired/failed.
    if (deposit.engine_wallet_amount != null) return;
    if (['expired', 'failed'].includes(String(deposit.status))) return;
    if (!deposit.nowpayments_payment_id) return;

    const inv = await getInvoiceStatus(String(deposit.nowpayments_payment_id));
    const gw = inv?.data || inv || {};
    if (!GW_FUNDED.includes(String(gw.status || ''))) {
      // Gateway says expired/failed while we still show waiting: mirror it.
      if ((gw.status === 'expired' || gw.status === 'failed') && deposit.status === 'waiting') {
        await supabaseAdmin.from('deposits').update({ status: gw.status }).eq('id', deposit.id).eq('status', 'waiting');
      }
      return;
    }
    const srcAmt = Number(gw.source_amount || deposit.amount);
    const payload = signAsPlisioWebhook({
      txn_id: String(deposit.nowpayments_payment_id),
      status: 'paid',
      amount: String(gw.amount || srcAmt),
      source_amount: String(srcAmt),
      source_currency: gw.source_currency || 'USD',
      currency: gw.currency || deposit.currency || 'USDT_TRX',
      wallet_hash: gw.wallet_hash || '',
      order_number: gw.order_number || '',
    });
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
    await fetch(`${site}/api/webhooks/plisio?json=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // never break the poll on a reconcile attempt
  }
}

// Poll endpoint for the deposit modal: server reads our OWN deposits row
// (never trusts client) so the UI can follow waiting -> confirming -> ...
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const paymentId = req.nextUrl.searchParams.get('paymentId');
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId required' }, { status: 400 });
    }

    const { data: deposit, error } = await supabaseAdmin
      .from('deposits')
      .select('id, status, amount, pay_amount, confirmed_at, deposit_address, tier_at_deposit, nowpayments_payment_id, engine_wallet_amount, currency')
      .eq('nowpayments_payment_id', paymentId)
      .eq('user_id', session.id)
      .maybeSingle();

    if (error || !deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    // Phase S.1: gateway-truth net (see replayIfFunded). Awaited, so the
    // row we return reflects the replay when one was needed.
    await replayIfFunded(deposit);

    let view: any = deposit;
    const stillStuck = deposit.engine_wallet_amount == null;
    if (stillStuck) {
      const { data: fresh } = await supabaseAdmin
        .from('deposits')
        .select('status, amount, pay_amount, confirmed_at, deposit_address, tier_at_deposit')
        .eq('id', deposit.id)
        .maybeSingle();
      if (fresh) view = { ...deposit, ...fresh };
    }

    return NextResponse.json({
      status: view.status,
      amount: Number(view.amount),
      pay_amount: view.pay_amount != null ? Number(view.pay_amount) : null,
      confirmed_at: view.confirmed_at,
      deposit_address: view.deposit_address,
      tier: view.tier_at_deposit,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
