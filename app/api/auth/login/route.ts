import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createUserAuthClient } from '@/lib/supabase';
import { setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Authenticate against Supabase on a THROWAWAY anon client (see
    // createUserAuthClient comment in lib/supabase.ts — signing in on the
    // admin singleton poisons its session store and breaks RLS-bypass for
    // every later service-role write in the process).
    const { data, error } = await createUserAuthClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Set session cookie
    setSessionCookie(data.session.access_token);

    // Phase G.5: new-login alert when IP or device changed. Comparison is
    // best-effort and must never block a good login.
    try {
      const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
      const uaRaw = req.headers.get('user-agent') || '';
      const device = /iphone/i.test(uaRaw) ? 'iPhone (Safari)'
        : /android/i.test(uaRaw) ? 'Android device'
        : /mac/i.test(uaRaw) ? 'MacOS browser'
        : /windows/i.test(uaRaw) ? 'Windows browser'
        : /linux/i.test(uaRaw) ? 'Linux browser'
        : uaRaw ? 'Unknown device' : 'Unknown device';
      const prevIp = profile.last_login_ip as string | null;
      const prevUa = (profile.last_login_ua as string | null) || '';
      const isNew = !!prevIp && (prevIp !== ip || prevUa !== uaRaw);
      // record this login regardless (first-ever login sets the baseline silently)
      await supabaseAdmin
        .from('profiles')
        .update({ last_login_ip: ip, last_login_ua: uaRaw, last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);
      if (isNew) {
        const { emails } = await import('@/lib/email/service');
        emails.newLoginAlert(profile.email, {
          name: profile.name || 'there',
          ipAddress: ip,
          device,
          location: 'Not resolved',
          loginTime: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
        });
      }
    } catch (e: any) {
      console.error('[login] new-login alert check failed:', e.message);
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        isPastor: profile.is_pastor,
        hasSignedAgreement: profile.has_signed_agreement,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
