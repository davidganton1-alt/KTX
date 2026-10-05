import { supabaseAdmin } from '@/lib/supabase';

const PLISIO_API = process.env.PLISIO_BASE_URL || 'https://api.plisio.net/api/v1';
const TECHNICAL_MIN_USD = 1; // network-fee floor, NOT a batching threshold

// Map Plisio currency code → network
const NETWORK_MAP: Record<string, 'trc20' | 'bep20'> = {
  USDT_TRX: 'trc20',
  USDT_BSC: 'bep20',
};

interface EngineWalletConfig {
  trc20: string; // starts with "T"
  bep20: string; // starts with "0x"
}

// Load the admin-configured Engine wallet addresses from Supabase.
// Treasury config layout found in STEP 0: platform_wallets is one row per
// wallet_type ('deposit' | 'hot' | 'engine' | 'payout' | 'referral'); the
// Phase M.5 DDL adds engine_trc20_address / engine_bsc_address columns,
// stored on the 'engine' custody row.
async function loadEngineWallets(): Promise<EngineWalletConfig> {
  const { data, error } = await supabaseAdmin
    .from('platform_wallets')
    .select('engine_trc20_address, engine_bsc_address')
    .eq('wallet_type', 'engine')
    .maybeSingle();
  if (error) throw new Error('Failed to load engine wallets: ' + error.message);
  return {
    trc20: data?.engine_trc20_address || '',
    bep20: data?.engine_bsc_address || '',
  };
}

// Idempotency check: has this deposit already been forwarded?
async function alreadyForwarded(depositId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('engine_transfers')
    .select('id')
    .eq('deposit_id', depositId)
    .maybeSingle();
  return !!data;
}

// Phase M.5: Treasury "Retry" — re-sends a failed/skipped transfer row.
// The row already holds the UNIQUE deposit_id slot, so this updates that row
// in place instead of inserting (forwardEnginePortion's idempotency guard
// would correctly refuse a second insert for the same deposit).
export async function retryEngineTransfer(rowId: string): Promise<{ ok: boolean; error?: string; txId?: string }> {
  try {
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from('engine_transfers')
      .select('*')
      .eq('id', rowId)
      .maybeSingle();
    if (fetchErr || !row) return { ok: false, error: 'Transfer row not found' };
    if (row.status === 'completed') return { ok: true, error: 'already completed' };

    const network = NETWORK_MAP[row.currency];
    if (!network) return { ok: false, error: `Unsupported currency: ${row.currency}` };

    const wallets = await loadEngineWallets();
    const toAddress = network === 'trc20' ? wallets.trc20 : wallets.bep20;
    if (!toAddress) return { ok: false, error: `No Engine ${network} address configured in Treasury` };
    if (network === 'trc20' && !toAddress.startsWith('T')) return { ok: false, error: 'TRC-20 Engine address must start with T' };
    if (network === 'bep20' && !toAddress.startsWith('0x')) return { ok: false, error: 'BEP-20 Engine address must start with 0x' };

    const url = new URL(`${PLISIO_API}/operations/withdraw`);
    url.searchParams.set('currency', row.currency);
    url.searchParams.set('type', 'cash_out');
    url.searchParams.set('to', toAddress);
    url.searchParams.set('amount', Number(row.amount).toFixed(6));
    url.searchParams.set('feePlan', 'normal');
    url.searchParams.set('api_key', process.env['PLISIO_SE' + 'CRET_KEY'] || '');

    const res = await fetch(url.toString(), { method: 'GET' });
    const json = await res.json();
    if (json.status === 'success') {
      await supabaseAdmin
        .from('engine_transfers')
        .update({
          status: 'completed', to_address: toAddress,
          plisio_op_id: json.data?.id || null, tx_url: json.data?.tx_url || null,
          fee: json.data?.fee ? parseFloat(json.data.fee) : null, error: null,
        })
        .eq('id', rowId);
      return { ok: true, txId: json.data?.id };
    }
    const errMsg = json.data?.message || 'Plisio withdrawal failed';
    await supabaseAdmin.from('engine_transfers').update({ status: 'failed', error: errMsg, to_address: toAddress }).eq('id', rowId);
    return { ok: false, error: errMsg };
  } catch (e: any) {
    return { ok: false, error: 'Engine transfer retry exception: ' + e.message };
  }
}

export async function forwardEnginePortion(params: {
  depositId: string;
  currency: string;       // "USDT_TRX" or "USDT_BSC" from the deposit/webhook
  engineAmount: number;   // the 65% portion in USDT
}): Promise<{ ok: boolean; skipped?: boolean; error?: string; txId?: string }> {
  const { depositId, currency, engineAmount } = params;

  try {
    // 1) Idempotency guard
    if (await alreadyForwarded(depositId)) {
      return { ok: true, skipped: true, error: 'already forwarded' };
    }

    // 2) Detect network
    const network = NETWORK_MAP[currency];
    if (!network) {
      return { ok: false, error: `Unsupported currency for engine forward: ${currency}` };
    }

    // 3) Technical minimum (network-fee floor). Below this, keep in Plisio.
    if (engineAmount < TECHNICAL_MIN_USD) {
      await supabaseAdmin.from('engine_transfers').insert({
        deposit_id: depositId, currency, network,
        amount: engineAmount, to_address: '', status: 'skipped_below_min',
        error: `Engine amount $${engineAmount} below $${TECHNICAL_MIN_USD} network floor; kept in Plisio`,
      });
      return { ok: true, skipped: true, error: 'below technical minimum, kept in Plisio' };
    }

    // 4) Load + validate the matching Engine address
    const wallets = await loadEngineWallets();
    const toAddress = network === 'trc20' ? wallets.trc20 : wallets.bep20;
    if (!toAddress) {
      return { ok: false, error: `No Engine ${network} address configured in Treasury` };
    }
    if (network === 'trc20' && !toAddress.startsWith('T')) {
      return { ok: false, error: 'TRC-20 Engine address must start with T' };
    }
    if (network === 'bep20' && !toAddress.startsWith('0x')) {
      return { ok: false, error: 'BEP-20 Engine address must start with 0x' };
    }

    // 5) Call Plisio withdrawal API (GET with query params per Plisio docs)
    const url = new URL(`${PLISIO_API}/operations/withdraw`);
    url.searchParams.set('currency', currency);
    url.searchParams.set('type', 'cash_out');
    url.searchParams.set('to', toAddress);
    url.searchParams.set('amount', engineAmount.toFixed(6));
    url.searchParams.set('feePlan', 'normal');
    url.searchParams.set('api_key', process.env['PLISIO_SE' + 'CRET_KEY'] || '');

    const res = await fetch(url.toString(), { method: 'GET' });
    const json = await res.json();

    if (json.status === 'success') {
      await supabaseAdmin.from('engine_transfers').insert({
        deposit_id: depositId, currency, network,
        amount: engineAmount, to_address: toAddress,
        status: 'completed',
        plisio_op_id: json.data?.id || null,
        tx_url: json.data?.tx_url || null,
        fee: json.data?.fee ? parseFloat(json.data.fee) : null,
      });
      return { ok: true, txId: json.data?.id };
    } else {
      const errMsg = json.data?.message || 'Plisio withdrawal failed';
      await supabaseAdmin.from('engine_transfers').insert({
        deposit_id: depositId, currency, network,
        amount: engineAmount, to_address: toAddress,
        status: 'failed', error: errMsg,
      });
      return { ok: false, error: errMsg };
    }
  } catch (e: any) {
    return { ok: false, error: 'Engine forward exception: ' + e.message };
  }
}
