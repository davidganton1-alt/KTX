import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
      .select('status, amount, pay_amount, confirmed_at, deposit_address, tier_at_deposit')
      .eq('nowpayments_payment_id', paymentId)
      .eq('user_id', session.id)
      .maybeSingle();

    if (error || !deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: deposit.status,
      amount: Number(deposit.amount),
      pay_amount: deposit.pay_amount != null ? Number(deposit.pay_amount) : null,
      confirmed_at: deposit.confirmed_at,
      deposit_address: deposit.deposit_address,
      tier: deposit.tier_at_deposit,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
