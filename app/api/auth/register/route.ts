import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin, createUserAuthClient } from '@/lib/supabase';
import { setSessionCookie, supabaseIdFor } from '@/lib/auth';
import { db } from '@/lib/store';
import { pastorsDb } from '@/lib/pastorStore';
import { passwordErrorMessage } from '@/lib/passwordPolicy';
import { rateLimit, ipKey } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// Phase S.1: atomic JSON write helper (temp file + rename) for the id bridge.
function writeFileAtomic(p: string, data: string) {
  const tmp = p + '.tmp-' + process.pid + '-' + Date.now();
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, p);
}

// Registration on Supabase Auth (Phase 2 final). Pastor + member-referral
// linking restored: JSON stays the operational mirror (accrual math reads
// users.json), Supabase is the record of truth (profiles, flock_members,
// pastors.referrals). Mapping file grows so legacyIdFor()/supabaseIdFor()
// bridge new accounts immediately (reload-on-miss in lib/auth.ts).
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, pastor, refCode } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }

    // Phase S.1: normalize + validate email so lookups (forgot-password is an
    // exact match on lowercased email) can never miss a mixed-case account.
    const emailNorm = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Phase S.1: enforce the SAME policy as reset/change-password (previously
    // register accepted any 8-char string while every other door required
    // upper+lower+digit, so the entry credential was the weakest one).
    const policyErr = passwordErrorMessage(String(password));
    if (policyErr) {
      return NextResponse.json({ error: policyErr }, { status: 400 });
    }

    // Phase S.1: signup attempt limiter (10/hour/IP)
    const rl = rateLimit('register', ipKey(req), 10, 60 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    // Phase S.1: fail fast on duplicate email in the JSON mirror BEFORE
    // touching Supabase — previously a mirror duplicate created an orphaned
    // auth user + profile + wallet and then 400'd, bricking the email.
    if (db.findByEmail(emailNorm)) {
      return NextResponse.json({ error: 'Please use a different email. This one may already be registered.' }, { status: 409 });
    }

    // 1) Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailNorm,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError || !authData.user) {
      // Phase S.1: never echo the raw GoTrue message ('User already
      // registered' turned signup into an email-verification oracle).
      const dupish = /already registered|already exists/i.test(authError?.message || '');
      return NextResponse.json(
        { error: dupish ? 'Please use a different email. This one may already be registered.' : 'Registration failed. Please try again.' },
        { status: dupish ? 409 : 400 }
      );
    }
    const supaId = authData.user.id;

    // 2) Resolve pastor link (Supabase roster first, JSON approved list second)
    let pastorRow: any = null;
    let pastorJson: any = null;
    const pastorNameIn = typeof pastor === 'string' ? pastor.trim() : '';
    if (pastorNameIn) {
      let found: any = null;
      // Phase S.1: escape LIKE wildcards in user-typed pastor input
      const escapedPastor = pastorNameIn.replace(/[%_]/g, (m) => '\\' + m);
      for (const col of ['name', 'email']) {
        const { data } = await supabaseAdmin
          .from('pastors')
          .select('id, user_id, name, email, share_rate, referrals')
          .ilike(col, escapedPastor)
          .maybeSingle();
        if (data) { found = data; break; }
      }
      pastorRow = found;
      pastorJson = pastorsDb.findApprovedByName(pastorNameIn);
    }

    // 3) Resolve member referral code (JSON store owns referral codes)
    const referrer =
      typeof refCode === 'string' && refCode.trim() ? db.findByReferralCode(refCode.trim()) : undefined;

    // 4) Create profile (with pastor columns when linked)
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: supaId,
      email: emailNorm,
      name,
      role: 'user',
      referred_by: pastorRow?.user_id || null,
      pastor_name: pastorRow?.name || pastorJson?.name || null,
      pastor_share_rate: pastorRow ? Number(pastorRow.share_rate) : pastorJson?.shareRate ?? 0,
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(supaId);
      return NextResponse.json({ error: 'Profile creation failed: ' + profileError.message }, { status: 500 });
    }

    // 5) Wallet with $50 free credit + audit transaction.
    // Phase S.1: every step is awaited and error-checked now; a wallet failure
    // compensates by deleting the auth user (previously the credit tx was a
    // fire-and-forget .then(()=>{}) that could leave $50 funded with no audit
    // row and zero log evidence).
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .insert({ user_id: supaId, free_credit: 50, tier: 'none' });
    if (walletError) {
      console.error('[register] Wallet creation failed, rolling back account:', walletError.message);
      try { await supabaseAdmin.from('profiles').delete().eq('id', supaId); } catch {}
      try { await supabaseAdmin.auth.admin.deleteUser(supaId); } catch {}
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
    const { error: creditTxErr } = await supabaseAdmin
      .from('transactions')
      .insert({ user_id: supaId, type: 'free_credit', amount: 50, status: 'completed', notes: 'welcome credit' });
    if (creditTxErr) console.error('[register] CRITICAL: wallet funded but credit tx missing for %s: %s', supaId, creditTxErr.message);

    // 6) JSON operational mirror + id bridge (accrual & legacy routes read JSON)
    // Phase S.1: db.create failure also compensates (delete profile+wallet+auth
    // user) instead of leaving an orphan Supabase account that bricks the email.
    let jsonUser: any;
    try {
      jsonUser = db.create({ name, email: emailNorm, password });
    } catch (e: any) {
      console.error('[register] JSON mirror create failed, rolling back:', e.message);
      try { await supabaseAdmin.from('wallets').delete().eq('user_id', supaId); } catch {}
      try { await supabaseAdmin.from('profiles').delete().eq('id', supaId); } catch {}
      try { await supabaseAdmin.auth.admin.deleteUser(supaId); } catch {}
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
    try {
      const mapPath = path.join(process.cwd(), 'data', 'sb-id-mapping.json');
      const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      mapping[jsonUser.id] = supaId;
      mapping[supaId] = jsonUser.id;
      writeFileAtomic(mapPath, JSON.stringify(mapping, null, 2));
    } catch (e: any) {
      console.error('[register] mapping update failed:', e.message);
    }

    // 7) Pastor linking: flock_members + referrals++ (Supabase) and JSON mirror
    if (pastorRow || pastorJson) {
      if (pastorRow) {
        if (pastorRow.user_id) {
          const { error: flockError } = await supabaseAdmin
            .from('flock_members')
            .upsert(
              { pastor_id: pastorRow.id, user_id: supaId, joined_at: new Date().toISOString() },
              { onConflict: 'pastor_id,user_id' }
            );
          if (flockError) console.error('[register] flock insert failed:', flockError.message);
        }
        const { error: incError } = await supabaseAdmin
          .from('pastors')
          .update({ referrals: Number(pastorRow.referrals || 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', pastorRow.id);
        if (incError) console.error('[register] referrals bump failed:', incError.message);
      }
      if (pastorJson) {
        db.update(jsonUser.id, {
          referredBy: pastorJson.id,
          pastorName: pastorJson.name,
          pastorShareRate: pastorJson.shareRate,
        });
        pastorsDb.addReferral(pastorJson.id, name);
      }
    }

    // 8) Member referral link (JSON mirror + Supabase profiles.referred_by
    // only when there is no pastor link, matching legacy single-referrer model)
    if (referrer && referrer.id !== jsonUser.id) {
      db.linkMemberReferral(jsonUser.id, referrer.id, name);
      const refSupa = supabaseIdFor(referrer.id);
      if (refSupa && !(pastorRow || pastorJson)) {
        await supabaseAdmin.from('profiles').update({ referred_by: refSupa }).eq('id', supaId);
      }
    }

    // 9) Email identity. Supabase accounts are created with
    // email_confirm:true (admin bootstrap), so there is no gateway-issued
    // verification to honor. Phase S.1: the old "verification" was a facade —
    // a plaintext permanent token, returned TO THE CALLER, never enforced by
    // any route. It is removed: mark the account verified and stop pretending.
    db.update(jsonUser.id, { emailVerified: true });

    // 10) Auto-login (throwaway anon client — never signIn on the admin
    // singleton; it stores the session and every later service-role write
    // in the process then runs under this user's RLS context)
    const { data: signInData, error: signInError } = await createUserAuthClient().auth.signInWithPassword({
      email: emailNorm,
      password,
    });
    if (signInError || !signInData.session) {
      return NextResponse.json({ error: 'Account created but auto-login failed. Please sign in.' }, { status: 500 });
    }
    setSessionCookie(signInData.session.access_token, signInData.session.refresh_token);

    // Phase G: welcome email (queued, fire-and-forget)
    try {
      const { emails } = await import('@/lib/email/service');
      emails.welcome(emailNorm, { name, tier: 'Faithful', platformCredit: 50 });
    } catch {}

    const pastorResolved = (pastorRow?.name || pastorJson?.name) ?? null;
    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      pastor: pastorResolved,
      // Phase S.1: tell the UI when a supplied pastor/refCode did not resolve
      // (previously silently dropped — the member believed they joined a flock
      // that never received them).
      warnings: [
        pastorNameIn && !pastorResolved ? 'pastor_not_found' : null,
        typeof refCode === 'string' && refCode.trim() && !referrer ? 'referral_code_not_found' : null,
      ].filter(Boolean),
      user: { id: supaId, email: emailNorm, name, role: 'user' },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    // Phase S.1: never serialize internal error strings to the client.
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 400 });
  }
}
