import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { passwordErrorMessage } from '@/lib/passwordPolicy';

export const dynamic = 'force-dynamic';

// Phase I: redeem a reset token (single-use, 24h expiry). The token secret
// never lives in the DB — only its SHA-256 hash — so we hash the presented
// value and match. Password is updated in Supabase Auth (the authoritative
// verifier used by /api/auth/login); the JSON operational mirror and the
// profiles.user_id mapping keep pace.
export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }
    const weak = passwordErrorMessage(String(newPassword));
    if (weak) {
      return NextResponse.json({ error: weak }, { status: 400 });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const { data: row } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token', tokenHash)
      .maybeSingle();

    if (!row) {
      return NextResponse.json({ error: 'This reset link is invalid. Please request a new one.' }, { status: 400 });
    }
    if (row.used_at) {
      return NextResponse.json({ error: 'This reset link has already been used. Please request a new one.' }, { status: 400 });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Consume atomically: only the request that flips used_at proceeds.
    const { data: consumed } = await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', row.id)
      .is('used_at', null)
      .select('id')
      .maybeSingle();
    if (!consumed) {
      return NextResponse.json({ error: 'This reset link has already been used. Please request a new one.' }, { status: 400 });
    }

    // Update the authoritative credential.
    const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(row.user_id, {
      password: String(newPassword),
    });
    if (pwErr) {
      console.error('[reset-password] auth update failed:', pwErr.message);
      return NextResponse.json({ error: 'We could not update your password. Please try again.' }, { status: 400 });
    }

    // Keep the JSON operational mirror's scrypt hash in sync.
    try {
      const { legacyIdFor } = await import('@/lib/auth');
      const { db } = await import('@/lib/store');
      const ju = db.findById(legacyIdFor(row.user_id));
      if (ju?.email) db.setPasswordByEmail(ju.email, String(newPassword));
    } catch (e: any) {
      console.error('[reset-password] JSON mirror sync failed:', e.message);
    }

    // Notify the account holder.
    try {
      const { data: prof } = await supabaseAdmin.from('profiles').select('name, email').eq('id', row.user_id).maybeSingle();
      const { emails } = await import('@/lib/email/service');
      emails.passwordChanged(prof?.email || '', {
        name: prof?.name || 'there',
        changedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      });
    } catch (e: any) {
      console.error('[reset-password] email failed:', e.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Reset failed.' }, { status: 500 });
  }
}
