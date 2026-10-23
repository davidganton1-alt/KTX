import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listStuckDeposits, runDepositReconcile } from '@/lib/depositReconcile';

export const dynamic = 'force-dynamic';

// Phase S.2: deposit reconciliation sweeper (admin UI surface). The actual
// logic lives in lib/depositReconcile.ts, shared with the daily profit cron
// beat so both use the exact same gateway-truth replay path.
// GET  -> list stuck deposits (funded-but-uncredited + stale waiting)
// POST -> { deposit_id? } run the sweep (optionally scoped to one row)

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { funded_stuck, stale_waiting } = await listStuckDeposits();
    return NextResponse.json({
      funded_stuck,
      stale_waiting,
      count: funded_stuck.length + stale_waiting.length,
    });
  } catch (e: any) {
    console.error('[deposits/reconcile] listing error:', e);
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
    const scoped = body.deposit_id ? String(body.deposit_id) : undefined;
    if (scoped) {
      const out = await runDepositReconcile(scoped, 1);
      if (!out.processed) return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
      return NextResponse.json({ ok: true, ...out });
    }
    const out = await runDepositReconcile();
    return NextResponse.json({ ok: true, ...out });
  } catch (e: any) {
    console.error('[deposits/reconcile] error:', e);
    return NextResponse.json({ error: 'Reconcile failed' }, { status: 500 });
  }
}
