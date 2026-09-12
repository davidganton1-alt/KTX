import { NextRequest, NextResponse } from 'next/server';
import { addToWaitlist, getWaitlist } from '@/lib/waitlist';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Supabase waitlist is the record of truth; the JSON file is mirrored during
// the migration window so the legacy count fallback keeps working.
export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from('waitlist')
      .select('id', { count: 'exact', head: true });
    if (count !== null) return NextResponse.json({ count: 1242 + count });
  } catch (e: any) {
    console.error('[waitlist] count read failed:', e.message);
  }
  const list = await getWaitlist();
  return NextResponse.json({ count: 1242 + list.length });
}

export async function POST(req: NextRequest) {
  const { email, pastorReferral } = await req.json().catch(() => ({} as any));
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }
  const clean = email.toLowerCase().trim();
  const referral = typeof pastorReferral === 'string' && pastorReferral.trim() ? pastorReferral.trim() : null;

  // duplicate check (Supabase first, then JSON mirror)
  try {
    const { data: dup } = await supabaseAdmin.from('waitlist').select('id').eq('email', clean).maybeSingle();
    if (dup) {
      // ensure the mirror also agrees it's a duplicate
      await addToWaitlist(clean);
      return NextResponse.json({ success: false, message: 'You are already on the waitlist!' }, { status: 409 });
    }
  } catch (e: any) {
    console.error('[waitlist] dup check failed:', e.message);
  }

  const result = await addToWaitlist(clean);
  if (!result.success) {
    return NextResponse.json(result, { status: 409 });
  }

  try {
    const { error } = await supabaseAdmin.from('waitlist').insert({ email: clean, pastor_referral: referral });
    if (error && !/duplicate/i.test(error.message)) console.error('[waitlist] sb insert failed:', error.message);
  } catch (e: any) {
    console.error('[waitlist] sb insert failed:', e.message);
  }

  // optional pastor referral: bump the pastor's referral count in Supabase
  if (referral) {
    try {
      const { data: pastor } = await supabaseAdmin
        .from('pastors')
        .select('id, referrals')
        .ilike('name', referral)
        .maybeSingle();
      if (pastor) {
        await supabaseAdmin
          .from('pastors')
          .update({ referrals: Number(pastor.referrals || 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', pastor.id);
      }
    } catch (e: any) {
      console.error('[waitlist] pastor referral bump failed:', e.message);
    }
  }

  return NextResponse.json(result);
}
