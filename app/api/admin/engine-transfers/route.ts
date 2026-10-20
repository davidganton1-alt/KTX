import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { retryEngineTransfer } from '@/lib/engineForward';
import { isValidUSDTAddress } from '@/lib/plisio';

export const dynamic = 'force-dynamic';

// Phase M.5 admin: Engine transfer config + history + retry.
// GET  -> { config: {trc20,bep20}, transfers: engine_transfers rows }
// POST -> { action: 'save_config'|'retry', ... }
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const [{ data: cfg }, { data: transfers, error }] = await Promise.all([
      supabaseAdmin
        .from('platform_wallets')
        .select('engine_trc20_address, engine_bsc_address')
        .eq('wallet_type', 'engine')
        .maybeSingle(),
      supabaseAdmin
        .from('engine_transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
    ]);
    // Phase S.1: degrade gracefully instead of 500-ing the whole Treasury
    // panel while the engine_transfers DDL / platform_wallets columns are
    // still pending — the UI shows a 'table missing' hint from the flag.
    if (error && /does not exist|relation|column/i.test(error.message)) {
      return NextResponse.json({
        config: { trc20: (cfg as any)?.engine_trc20_address || '', bep20: (cfg as any)?.engine_bsc_address || '' },
        transfers: [],
        table_missing: true,
        detail: error.message,
      });
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      config: { trc20: cfg?.engine_trc20_address || '', bep20: cfg?.engine_bsc_address || '' },
      transfers: transfers || [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json();
    const action = String(body.action || '');

    if (action === 'save_config') {
      const trc20 = String(body.engine_trc20_address || '').trim();
      const bep20 = String(body.engine_bsc_address || '').trim();
      // Hard-validate on save: never persist an address that could lose funds.
      // Phase S.1: full shape validation (prefix alone accepted 'Txx'), and an
      // EMPTY field means 'leave the stored value unchanged' — previously a
      // single-field edit with the other box blank nulled the other address.
      if (trc20 && !isValidUSDTAddress(trc20, 'trc20')) {
        return NextResponse.json({ error: 'TRC-20 Engine address is not a valid Tron USDT address' }, { status: 400 });
      }
      if (bep20 && !isValidUSDTAddress(bep20, 'bep20')) {
        return NextResponse.json({ error: 'BEP-20 Engine address is not a valid BSC (0x…) address' }, { status: 400 });
      }
      const patchCols: Record<string, string> = {};
      if (trc20) patchCols.engine_trc20_address = trc20;
      if (bep20) patchCols.engine_bsc_address = bep20;
      if (!Object.keys(patchCols).length) {
        return NextResponse.json({ error: 'Enter at least one Engine address to save' }, { status: 400 });
      }
      const { error } = await supabaseAdmin
        .from('platform_wallets')
        .update(patchCols)
        .eq('wallet_type', 'engine');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'retry') {
      const id = String(body.transfer_id || '');
      if (!id) return NextResponse.json({ error: 'transfer_id required' }, { status: 400 });
      const res = await retryEngineTransfer(id);
      return NextResponse.json(res, { status: res.ok ? 200 : 502 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
