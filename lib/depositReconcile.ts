// Phase S.2: deposit reconciliation sweeper core (shared by the admin route
// and the daily profit cron). Gateway is the truth: for every deposit row
// that never received its completion marker (engine_wallet_amount NULL, not
// expired/failed), ask Plisio what happened; if funded, replay a locally
// signed webhook into /api/webhooks/plisio (the same atomic claim +
// replay-safe credit pipeline real IPNs use — no second code path).
import { supabaseAdmin } from '@/lib/supabase';
import { getInvoiceStatus, signAsPlisioWebhook } from '@/lib/plisio';

const GW_FUNDED = ['paid', 'accepted', 'exchanged', 'converted', 'finished', 'completed'];
const SELF = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');

export async function listStuckDeposits(): Promise<{ funded_stuck: any[]; stale_waiting: any[] }> {
  const { data: notCredited } = await supabaseAdmin
    .from('deposits')
    .select('id, user_id, amount, currency, status, created_at, nowpayments_payment_id')
    .is('engine_wallet_amount', null)
    .neq('status', 'expired')
    .neq('status', 'failed')
    .neq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(200);
  const cutoff = new Date(Date.now() - 72 * 3600 * 1000).toISOString();
  const { data: staleWaiting } = await supabaseAdmin
    .from('deposits')
    .select('id, user_id, amount, currency, status, created_at, nowpayments_payment_id')
    .eq('status', 'waiting')
    .lt('created_at', cutoff)
    .limit(200);
  return { funded_stuck: notCredited || [], stale_waiting: staleWaiting || [] };
}

async function processOne(d: any): Promise<{ id: string; action: string; detail?: string }> {
  const txnId = d.nowpayments_payment_id;
  if (!txnId) return { id: d.id, action: 'skipped', detail: 'no gateway txn id' };
  let inv: any = null;
  try {
    inv = await getInvoiceStatus(String(txnId));
  } catch (e: any) {
    return { id: d.id, action: 'gateway_query_failed', detail: String(e.message || e).slice(0, 160) };
  }
  const gw = inv?.data || inv || {};
  const gwStatus = String(gw.status || '');
  if (GW_FUNDED.includes(gwStatus)) {
    const srcAmt = Number(gw.source_amount || d.amount);
    const payload = signAsPlisioWebhook({
      txn_id: String(txnId),
      status: 'paid',
      amount: String(gw.amount || srcAmt),
      source_amount: String(srcAmt),
      source_currency: gw.source_currency || 'USD',
      currency: gw.currency || d.currency || 'USDT_TRX',
      wallet_hash: gw.wallet_hash || '',
      order_number: gw.order_number || '',
    });
    const res = await fetch(`${SELF()}/api/webhooks/plisio?json=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { id: d.id, action: res.ok ? `replayed_webhook(${res.status})` : `replay_failed(${res.status})` };
  }
  if (gwStatus === 'expired' || gwStatus === 'failed') {
    await supabaseAdmin.from('deposits').update({ status: gwStatus }).eq('id', d.id).eq('status', d.status);
    return { id: d.id, action: `marked_${gwStatus}` };
  }
  return { id: d.id, action: 'gateway_says_' + (gwStatus || 'unknown'), detail: 'left as-is' };
}

export async function runDepositReconcile(scopeDepositId?: string, batch = 25): Promise<{ processed: number; results: { id: string; action: string; detail?: string }[] }> {
  let targets: any[];
  if (scopeDepositId) {
    const { data } = await supabaseAdmin.from('deposits').select('*').eq('id', scopeDepositId).maybeSingle();
    targets = data ? [data] : [];
  } else {
    const { funded_stuck, stale_waiting } = await listStuckDeposits();
    // Priority order: funded-but-uncredited first, then stale waiting; capped
    // per run so the daily beat never hammers the gateway API.
    targets = [...funded_stuck, ...stale_waiting].slice(0, batch);
  }
  const results: { id: string; action: string; detail?: string }[] = [];
  for (const d of targets) results.push(await processOne(d));
  return { processed: results.length, results };
}
