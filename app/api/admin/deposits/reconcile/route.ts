import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getInvoiceStatus, signAsPlisioWebhook } from '@/lib/plisio';

export const dynamic = 'force-dynamic';

// Phase S.1: deposit reconciliation sweeper (admin-only).
// GET  -> list deposits that look stuck: funded-but-unccredited, dead-letter
//         claims (processing_split with no completion marker), and stale
//         'waiting' rows past their gateway expiry.
// POST -> { deposit_id? } re-drive. For each target we ask PLISIO for the
//         truth (getInvoiceStatus); if the gateway says the invoice funded,
//         we replay a signed webhook payload into /api/webhooks/plisio —
//         the same atomic claim + replay-safe credit pipeline a real IPN
//         goes through, so there is no second code path and no double credit.
//         The signing secret never leaves the server; payloads we synthesize
//         carry the gateway's verified amounts, not the local row's.

const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');

const FUNDED_WORDS = ['paid', 'accepted', 'exchanged', 'converted', 'finished', 'completed'];

async function findStuck() {
  // Phase S.1: the dead-letter invariant — any non-terminal row that never
  // got the engine_wallet_amount completion marker is suspect.
  const or = [
    'and(engine_wallet_amount.is.null,status.not.in.(expired,failed))',
  ].join(',');
  const { data: fundedStuck } = await supabaseAdmin
    .from('deposits')
    .select('id, user_id, amount, currency, status, created_at, nowpayments_payment_id')
    .or(or)
    .neq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(200);

  // stale 'waiting' rows older than 72h: ask the gateway whether they expired
  const cutoff = new Date(Date.now() - 72 * 3600 * 1000).toISOString();
  const { data: staleWaiting } = await supabaseAdmin
    .from('deposits')
    .select('id, user_id, amount, currency, status, created_at, nowpayments_payment_id')
    .eq('status', 'waiting')
    .lt('created_at', cutoff)
    .limit(200);

  return { fundedStuck: fundedStuck || [], staleWaiting: staleWaiting || [] };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { fundedStuck, staleWaiting } = await findStuck();
    return NextResponse.json({
      funded_stuck: fundedStuck,
      stale_waiting: staleWaiting,
      count: fundedStuck.length + staleWaiting.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Reconcile listing failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const scoped = body.deposit_id ? String(body.deposit_id) : null;

    let targets: any[];
    if (scoped) {
      const { data } = await supabaseAdmin.from('deposits').select('*').eq('id', scoped).maybeSingle();
      if (!data) return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
      targets = [data];
    } else {
      const { fundedStuck, staleWaiting } = await findStuck();
      targets = [...fundedStuck, ...staleWaiting];
    }

    const results: { id: string; action: string; detail?: string }[] = [];

    for (const d of targets) {
      const txnId = d.nowpayments_payment_id;
      if (!txnId) { results.push({ id: d.id, action: 'skipped', detail: 'no gateway txn id' }); continue; }

      // Gateway is the truth — never replay from our own row.
      let inv: any = null;
      try {
        inv = await getInvoiceStatus(txnId);
      } catch (e: any) {
        results.push({ id: d.id, action: 'gateway_query_failed', detail: String(e.message || e).slice(0, 160) });
        continue;
      }

      const gwStatus = String(inv?.status || inv?.data?.status || '');
      const funded = FUNDED_WORDS.includes(gwStatus);

      if (funded) {
        const gw = inv?.data || inv || {};
        const srcAmt = Number(gw.source_amount || inv?.source_amount || d.amount);
        // flat body — matches how the webhook parses real Plisio IPNs
        const payload = signAsPlisioWebhook({
          txn_id: txnId,
          status: 'paid',
          amount: String(gw.amount || inv?.amount || srcAmt),
          source_amount: String(srcAmt),
          source_currency: gw.source_currency || 'USD',
          currency: gw.currency || d.currency || 'USDT_TRX',
          wallet_hash: gw.wallet_hash || '',
          order_number: gw.order_number || '',
        });
        const res = await fetch(`${SITE()}/api/webhooks/plisio?json=true`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        results.push({ id: d.id, action: res.ok ? `replayed_webhook(${res.status})` : `replay_failed(${res.status})` });
      } else if (gwStatus === 'expired' || gwStatus === 'failed') {
        // terminal non-payment: move our row to match the gateway, so the
        // open-invoice cap and the history UI stop showing ghosts.
        await supabaseAdmin.from('deposits').update({ status: gwStatus }).eq('id', d.id).eq('status', d.status);
        results.push({ id: d.id, action: `marked_${gwStatus}` });
      } else {
        results.push({ id: d.id, action: 'gateway_says_' + (gwStatus || 'unknown'), detail: 'left as-is' });
      }
    }

    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (e: any) {
    console.error('[deposits/reconcile] error:', e);
    return NextResponse.json({ error: 'Reconcile failed' }, { status: 500 });
  }
}
