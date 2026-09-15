import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;

// Phase I: forgot-password. Issues a single-use 24h token stored as a SHA-256
// hash (the DB never holds the usable secret), emails the reset link, and
// always answers 200 so callers can't enumerate registered emails.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      // Malformed request is not "account not found" — but keep it generic too.
      return NextResponse.json({ success: true });
    }
    const normalized = String(email).trim().toLowerCase();

    let exists = false;
    try {
      // Rate limit: max 3 reset tokens per email in the last hour.
      const { count } = await supabaseAdmin
        .from('password_reset_tokens')
        .select('id', { count: 'exact', head: true })
        .eq('email', normalized)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if ((count ?? 0) >= 3) {
        // Same generic response: rate-limit hits must not reveal existence.
        console.log(`[forgot-password] rate limited for ${normalized}`);
        return NextResponse.json({ success: true });
      }

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email')
        .eq('email', normalized)
        .maybeSingle();

      if (profile) {
        exists = true;
        const raw = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');

        const { error: insErr } = await supabaseAdmin.from('password_reset_tokens').insert({
          user_id: profile.id,
          email: normalized,
          token: tokenHash,
          expires_at: new Date(Date.now() + DAY_MS).toISOString(),
        });

        if (!insErr) {
          const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kingdomtradex.com').replace(/\/+$/, '');
          const resetLink = `${site}/reset-password?token=${raw}`;
          const { emails } = await import('@/lib/email/service');
          emails.passwordReset(profile.email || normalized, {
            name: profile.name || 'there',
            resetLink,
          });
        } else {
          console.error('[forgot-password] token insert failed:', insErr.message);
        }
      }
    } catch (e: any) {
      console.error('[forgot-password] internal:', e.message);
    }

    console.log(`[forgot-password] request for ${normalized}, user existed: ${exists}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Even on unexpected failure, don't leak whether the address exists.
    return NextResponse.json({ success: true });
  }
}
