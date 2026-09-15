import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, email, brand_name, platform, platform_handle, follower_count, content_niche, application_text } = await req.json();

    if (!name || !email || !platform || !platform_handle) {
      return NextResponse.json({ error: 'Name, email, platform, and handle are required' }, { status: 400 });
    }

    const validPlatforms = ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'other'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // One open application per user
    const { data: existing } = await supabaseAdmin
      .from('creator_applications')
      .select('id, status')
      .eq('user_id', session.id)
      .in('status', ['pending', 'approved'])
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: existing.status === 'approved' ? 'You are already an approved creator' : 'An application is already under review' },
        { status: 409 }
      );
    }

    const { data: application, error } = await supabaseAdmin
      .from('creator_applications')
      .insert({
        user_id: session.id,
        name,
        email,
        brand_name: brand_name || null,
        platform,
        platform_handle,
        follower_count: Number(follower_count) || 0,
        content_niche: content_niche || null,
        application_text: application_text || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      application_id: application.id,
      message: 'Application submitted. You will be notified once reviewed.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
