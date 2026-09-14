import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// The member's own deposit history (scoped by session user id).
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('id, amount, pay_amount, currency, status, tier_at_deposit, deposit_address, created_at, confirmed_at')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      deposits: (data || []).map((d: any) => ({
        id: d.id,
        amount: Number(d.amount),
        pay_amount: d.pay_amount != null ? Number(d.pay_amount) : null,
        currency: d.currency,
        status: d.status,
        tier: d.tier_at_deposit,
        address: d.deposit_address,
        createdAt: d.created_at ? new Date(d.created_at).getTime() : 0,
        confirmedAt: d.confirmed_at ? new Date(d.confirmed_at).getTime() : null,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
