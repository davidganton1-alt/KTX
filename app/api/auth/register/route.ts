import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';
import { setSessionCookie, supabaseIdFor } from '@/lib/auth';
import { db } from '@/lib/store';
import { pastorsDb } from '@/lib/pastorStore';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

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
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // 1) Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Registration failed' }, { status: 400 });
    }
    const supaId = authData.user.id;

    // 2) Resolve pastor link (Supabase roster first, JSON approved list second)
    let pastorRow: any = null;
    let pastorJson: any = null;
    const pastorNameIn = typeof pastor === 'string' ? pastor.trim() : '';
    if (pastorNameIn) {
      let found: any = null;
      for (const col of ['name', 'email']) {
        const { data } = await supabaseAdmin
          .from('pastors')
          .select('id, user_id, name, email, share_rate, referrals')
          .ilike(col, pastorNameIn)
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
      email,
      name,
      role: 'user',
      referred_by: pastorRow?.user_id || null,
      pastor_name: pastorRow?.name || pastorJson?.name || null,
      pastor_share_rate: pastorRow ? Number(pastorRow.share_rate) : pastorJson?.shareRate ?? 0,
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(supaId);
      return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 });
    }

    // 5) Wallet with $50 free credit + audit transaction
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .insert({ user_id: supaId, free_credit: 50, tier: 'none' });
    if (walletError) console.error('Wallet creation failed:', walletError);
    else {
      supabaseAdmin
        .from('transactions')
        .insert({ user_id: supaId, type: 'free_credit', amount: 50, status: 'completed', notes: 'welcome credit' })
        .then(() => {});
    }

    // 6) JSON operational mirror + id bridge (accrual & legacy routes read JSON)
    const jsonUser = db.create({ name, email, password });
    try {
      const mapPath = path.join(process.cwd(), 'data', 'sb-id-mapping.json');
      const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      mapping[jsonUser.id] = supaId;
      mapping[supaId] = jsonUser.id;
      fs.writeFileSync(mapPath, JSON.stringify(mapping, null, 2));
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

    // 9) Verification email (dev-mode link returned for the UI)
    const verifyToken = crypto.randomBytes(32).toString('hex');
    db.update(jsonUser.id, { verifyToken, emailVerified: false });
    const verifyLink = sendVerificationEmail(email, verifyToken);

    // 10) Auto-login
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !signInData.session) {
      return NextResponse.json({ error: 'Account created but auto-login failed. Please sign in.' }, { status: 500 });
    }
    setSessionCookie(signInData.session.access_token);

    return NextResponse.json({
      success: true,
      verifyLink,
      message: 'Account created. Please verify your email to continue.',
      pastor: (pastorRow?.name || pastorJson?.name) ?? null,
      user: { id: supaId, email, name, role: 'user' },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed.' }, { status: 400 });
  }
}
