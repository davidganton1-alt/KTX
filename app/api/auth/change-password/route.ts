import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { passwordErrorMessage } from '@/lib/passwordPolicy';

export const dynamic = 'force-dynamic';

// Phase I: change password for a signed-in user. The current password is
// verified by actually signing in with Supabase Auth (the same verifier the
// login route uses) on a THROWAWAY client — signing in on the shared
// supabaseAdmin singleton would swap its bearer token to the user's JWT and
// break the admin call that follows.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required.' }, { status: 400 });
    }
    const weak = passwordErrorMessage(String(newPassword));
    if (weak) {
      return NextResponse.json({ error: weak }, { status: 400 });
    }

    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', session.id)
      .maybeSingle();
    if (!prof?.email) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    // Verify current password against the authoritative store.
    const probe = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error: signInErr } = await probe.auth.signInWithPassword({
      email: prof.email,
      password: String(currentPassword),
    });
    if (signInErr) {
      return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 401 });
    }

    const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(session.id, {
      password: String(newPassword),
    });
    if (pwErr) {
      console.error('[change-password] auth update failed:', pwErr.message);
      return NextResponse.json({ error: 'We could not update your password. Please try again.' }, { status: 500 });
    }

    // Keep the JSON operational mirror's scrypt hash in sync.
    try {
      const { legacyIdFor } = await import('@/lib/auth');
      const { db } = await import('@/lib/store');
      const ju = db.findById(legacyIdFor(session.id));
      if (ju?.email) db.setPasswordByEmail(ju.email, String(newPassword));
    } catch (e: any) {
      console.error('[change-password] JSON mirror sync failed:', e.message);
    }

    // Notify.
    try {
      const { emails } = await import('@/lib/email/service');
      emails.passwordChanged(prof.email, {
        name: prof.name || 'there',
        changedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      });
    } catch (e: any) {
      console.error('[change-password] email failed:', e.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Change failed.' }, { status: 500 });
  }
}
