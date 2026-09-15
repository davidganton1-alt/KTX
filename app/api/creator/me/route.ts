import { NextResponse } from 'next/server';
import { getSession, legacyIdFor } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, is_creator, is_pastor')
      .eq('id', session.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.is_creator && profile.role !== 'creator') {
      return NextResponse.json({ error: 'Not a creator' }, { status: 403 });
    }

    const { data: application } = await supabaseAdmin
      .from('creator_applications')
      .select('*')
      .eq('user_id', session.id)
      .eq('status', 'approved')
      .maybeSingle();

    // Community: profiles this creator referred (same link mechanism as members,
    // 5% rate applies because is_creator is set).
    const { data: members } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, wallets(principal, tier)')
      .eq('referred_by', session.id);
    const referrals = (members || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      tier: m.wallets?.[0]?.tier ?? m.wallets?.tier ?? 'none',
      deposited: Number(m.wallets?.[0]?.principal ?? m.wallets?.principal ?? 0),
    }));

    // Invite link: creators share a member-style referral code link.
    let inviteLink = `/register?ref=${session.id.slice(0, 6)}`;
    try {
      const jsonId = legacyIdFor(session.id);
      const ju = jsonId ? db.findById(jsonId) : null;
      if (ju) inviteLink = `/register?ref=${db.ensureReferralCode(ju.id)}`;
    } catch {}

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      isCreator: true,
      brandName: application?.brand_name || null,
      platform: application?.platform || null,
      platformHandle: application?.platform_handle || null,
      followerCount: application?.follower_count || 0,
      contentNiche: application?.content_niche || null,
      referrals,
      referralsCount: referrals.length,
      inviteLink,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
