import { NextResponse } from 'next/server';
import { accrueAllUsersProfit } from '@/lib/profitAccrual';
import { runEmailDigests } from '@/lib/email/digests';

export const dynamic = 'force-dynamic';

// Secured endpoint for external cron services (e.g., cron-job.org):
// POST daily with 'Authorization: Bearer <CRON_SECRET_KEY>'.
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.CRON_SECRET_KEY;

    if (!expectedKey) {
      // fail closed: no key configured -> feature disabled
      return NextResponse.json({ error: 'Cron not configured' }, { status: 501 });
    }
    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await accrueAllUsersProfit();

    // Phase G: piggyback the email digests (weekly summaries + agreement
    // reminders) on the same daily beat; failures never block accrual.
    let digests = null;
    try {
      digests = await runEmailDigests();
    } catch (e: any) {
      console.error('[profit-cron] digests failed:', e.message);
    }

    return NextResponse.json({ success: summary.failed === 0, summary, digests });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
