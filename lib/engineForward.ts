import { supabaseAdmin } from '@/lib/supabase';
import { plisioWithdraw } from '@/lib/plisioPayout';
import { normalizeTicker, isValidUSDTAddress } from '@/lib/plisio';

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
// Phase S.1: a query ERROR (e.g. table absent) must not read as "not
// forwarded" — otherwise a transient failure between a successful send and
// its audit insert could double-send real funds. On error we report
// 'unknown' and the caller refuses to send until it can prove no prior row.
async function forwardGuard(depositId: string): Promise<'clear' | 'exists' | 'error'> {
  const { data, error } = await supabaseAdmin
    .from('engine_transfers')
    .select('id, status')
    .eq('deposit_id', depositId)
    .maybeSingle();
  if (error) return 'error';
  return data ? 'exists' : 'clear';
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

    const normalized = normalizeTicker(row.currency);
    const network = normalized ? NETWORK_MAP[normalized] : undefined;
    if (!network || !normalized) return { ok: false, error: `Unsupported currency: ${row.currency}` };

    const wallets = await loadEngineWallets();
    const toAddress = network === 'trc20' ? wallets.trc20 : wallets.bep20;
    if (!toAddress) return { ok: false, error: `No Engine ${network} address configured in Treasury` };
    if (!isValidUSDTAddress(toAddress, network)) return { ok: false, error: `Stored Engine ${network.toUpperCase()} address is not a valid USDT address shape` };

    // Phase S.1: atomic claim failed/skipped -> retrying. Only the request that
    // wins this conditional update may call Plisio (double-click cannot
    // double-send). If the send then fails we mark it back to 'failed'.
    const { data: claimedRow } = await supabaseAdmin
      .from('engine_transfers')
      .update({ status: 'retrying' })
      .eq('id', rowId)
      .in('status', ['failed', 'skipped_below_min'])
      .select('id')
      .maybeSingle();
    if (!claimedRow) return { ok: false, error: 'Retry already in flight (row was claimed by another request)' };

    const pw = await plisioWithdraw({ currency: normalized, toAddress, amount: Number(row.amount) });
    if (pw.ok) {
      const { error: upErr } = await supabaseAdmin
        .from('engine_transfers')
        .update({
          status: 'completed', to_address: toAddress, currency: normalized,
          plisio_op_id: pw.txId || null, tx_url: pw.txUrl || null,
          fee: pw.fee ? parseFloat(pw.fee) : null, error: null,
        })
        .eq('id', rowId);
      if (upErr) console.error('[engineForward] CRITICAL: retry send SUCCEEDED but completion update failed:', pw.txId, upErr.message);
      return { ok: true, txId: pw.txId };
    }
    const errMsg = pw.error || 'Plisio withdrawal failed';
    const { error: failUpErr } = await supabaseAdmin
      .from('engine_transfers').update({ status: 'failed', error: errMsg, to_address: toAddress, currency: normalized }).eq('id', rowId);
    if (failUpErr) console.error('[engineForward] retry failure update failed:', failUpErr.message);
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
    // 1) Idempotency guard. On a guard ERROR we must not send (a prior send
    // may exist but be unverifiable) — fail closed, surface the error so
    // Treasury can act once the table/state is healthy.
    const guard = await forwardGuard(depositId);
    if (guard === 'exists') {
      return { ok: true, skipped: true, error: 'already forwarded' };
    }
    if (guard === 'error') {
      return { ok: false, error: `engine_transfers guard unreadable (table missing or erroring); refusing to send to avoid double-forward` };
    }

    // 2) Detect network (normalized ticker; bare 'USDT'/ERC variants refused)
    const normalized = normalizeTicker(currency);
    const network = normalized ? NETWORK_MAP[normalized] : undefined;
    if (!network) {
      return { ok: false, error: `Unsupported currency for engine forward: ${currency}` };
    }

    // 3) Technical minimum (network-fee floor). Below this, keep in Plisio.
    if (engineAmount < TECHNICAL_MIN_USD) {
      const { error: skipErr } = await supabaseAdmin.from('engine_transfers').insert({
        deposit_id: depositId, currency: normalized!, network,
        amount: engineAmount, to_address: '', status: 'skipped_below_min',
        error: `Engine amount $${engineAmount} below $${TECHNICAL_MIN_USD} network floor; kept in Plisio`,
      });
      if (skipErr) console.error('[engineForward] skipped_below_min audit insert failed:', skipErr.message);
      return { ok: true, skipped: true, error: 'below technical minimum, kept in Plisio' };
    }

    // 4) Load + validate the matching Engine address
    const wallets = await loadEngineWallets();
    const toAddress = network === 'trc20' ? wallets.trc20 : wallets.bep20;
    if (!toAddress) {
      return { ok: false, error: `No Engine ${network} address configured in Treasury` };
    }
    // Phase S.1: full shape validation (prefix-only checks accepted 'Txx'
    // garbage which then failed at the gateway with real money at stake).
    if (!isValidUSDTAddress(toAddress, network)) {
      return { ok: false, error: `Stored Engine ${network.toUpperCase()} address is not a valid USDT address shape` };
    }

    // 5) Call Plisio withdrawal through the shared validated payout helper
    const pw = await plisioWithdraw({ currency: normalized!, toAddress, amount: engineAmount });

    if (pw.ok) {
      const { error: insErr } = await supabaseAdmin.from('engine_transfers').insert({
        deposit_id: depositId, currency: normalized!, network,
        amount: engineAmount, to_address: toAddress,
        status: 'completed',
        plisio_op_id: pw.txId || null,
        tx_url: pw.txUrl || null,
        fee: pw.fee ? parseFloat(pw.fee) : null,
      });
      if (insErr) {
        // The money MOVED but the audit row failed: this is the exact case the
        // guard protects on replay. CRITICAL log with the op id for manual
        // reconciliation; return ok so no automatic re-send is attempted.
        console.error('[engineForward] CRITICAL: forward SUCCEEDED but audit insert failed. deposit=%s op=%s amount=%s err=%s',
          depositId, pw.txId, engineAmount, insErr.message);
      }
      return { ok: true, txId: pw.txId };
    } else {
      const errMsg = pw.error || 'Plisio withdrawal failed';
      const { error: insErr2 } = await supabaseAdmin.from('engine_transfers').insert({
        deposit_id: depositId, currency: normalized!, network,
        amount: engineAmount, to_address: toAddress,
        status: 'failed', error: errMsg,
      });
      if (insErr2) console.error('[engineForward] failure audit insert failed:', insErr2.message, '| send error was:', errMsg);
      return { ok: false, error: errMsg };
    }
  } catch (e: any) {
    return { ok: false, error: 'Engine forward exception: ' + e.message };
  }
}
