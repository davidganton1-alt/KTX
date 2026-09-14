import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { accrueUserProfit, accrueAllUsersProfit } from '@/lib/profitAccrual';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.role === 'admin') {
      // Admin can trigger accrual for all users or a specific user
      const body = await req.json().catch(() => ({} as any));
      const targetUserId = body.userId;

      if (targetUserId) {
        const result = await accrueUserProfit(String(targetUserId));
        return NextResponse.json({ success: result.success, result });
      }
      const summary = await accrueAllUsersProfit();
      return NextResponse.json({ success: summary.failed === 0, summary });
    }

    // Regular users can only accrue their own profit
    const result = await accrueUserProfit(session.id);
    return NextResponse.json({ success: result.success, result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
