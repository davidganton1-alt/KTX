import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

// ── ID bridging (Phase 2 migration window) ──
// Supabase auth returns Supabase uuids; the JSON stores (users.json, pastors,
// chat) are keyed by the legacy ids. data/sb-id-mapping.json links them.
let _supaToJson: Record<string, string> | null = null;
let _jsonToSupa: Record<string, string> | null = null;
function loadMapping() {
  if (_supaToJson) return;
  try {
    const m = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'sb-id-mapping.json'), 'utf8'));
    _supaToJson = Object.fromEntries(Object.entries(m).map(([j, s]) => [s as string, j as string]));
    _jsonToSupa = m as Record<string, string>;
  } catch {
    _supaToJson = {};
    _jsonToSupa = {};
  }
}
/** Supabase uuid -> legacy JSON user id (falls through to itself if unmapped). */
export function legacyIdFor(supabaseId: string): string {
  loadMapping();
  if (_supaToJson![supabaseId]) return _supaToJson![supabaseId];
  // mapping file may have grown at runtime (new pastor approvals) — reload once
  _supaToJson = null;
  loadMapping();
  return _supaToJson![supabaseId] || supabaseId;
}
/** Legacy JSON user id -> Supabase uuid (null if unmapped). */
export function supabaseIdFor(jsonId: string): string | null {
  loadMapping();
  if (_jsonToSupa![jsonId]) return _jsonToSupa![jsonId];
  _jsonToSupa = null;
  _supaToJson = null;
  loadMapping();
  return _jsonToSupa![jsonId] || null;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isPastor?: boolean;
  hasSignedAgreement?: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-session');
    
    if (!sessionCookie?.value) return null;

    // Verify the session token with Supabase
    let { data: { user }, error } = await supabaseAdmin.auth.getUser(sessionCookie.value);

    // Phase S.1: the GoTrue ACCESS token expires (~1h) long before the 7-day
    // cookie. On expiry, transparently rotate using the httpOnly refresh
    // cookie ('ktx_refresh') via a throwaway client, then re-mint the session
    // cookie. This ends the silent 401-logouts after an hour of idle time.
    // NOTE: refresh rotates the refresh token server-side too (GoTrue reuses
    // it); we overwrite the cookie with whatever the response carries.
    if (error || !user) {
      const refreshCookie = cookieStore.get('ktx_refresh');
      if (refreshCookie?.value) {
        try {
          const { createUserAuthClient } = await import('@/lib/supabase');
          const anon = createUserAuthClient();
          const { data: refreshed, error: refErr } = await anon.auth.refreshSession({
            refresh_token: refreshCookie.value,
          });
          if (!refErr && refreshed.user && refreshed.session) {
            try { setSessionCookie(refreshed.session.access_token, refreshed.session.refresh_token); } catch {}
            user = refreshed.user;
            error = null;
          } else {
            return null; // refresh token revoked/expired: hard logout
          }
        } catch {
          return null;
        }
      }
    }

    if (error || !user) return null;

    // Fetch profile to get role and other fields
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return null;

    // Phase S.1: suspension fails closed in the CORE resolver (previously only
    // six legacy endpoints honored it; money routes and dashboards did not).
    try {
      const { db } = await import('@/lib/store');
      const ju = db.findById(legacyIdFor(user.id));
      if (ju && ju.suspended) return null;
    } catch {}

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name || '',
      role: profile.role,
      isPastor: profile.is_pastor,
      hasSignedAgreement: profile.has_signed_agreement,
    };
  } catch (error) {
    console.error('getSession error:', error);
    return null;
  }
}

export function setSessionCookie(token: string, refreshToken?: string) {
  cookies().set('sb-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  // Phase S.1: refresh token stored server-side-reachable only via this
  // httpOnly cookie; getSession rotates it. Never exposed to JS.
  if (refreshToken) {
    cookies().set('ktx_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }
}

export function clearSessionCookie() {
  cookies().delete('sb-session');
  cookies().delete('ktx_refresh'); // Phase S.1: true logout clears BOTH
}

// ── COMPATIBILITY EXPORTS (for routes not yet migrated to Supabase) ──
// These keep existing JSON-based routes working during the migration

export const AUTH_COOKIE = 'ktx_session';

export function signSession(user: any): string {
  // Legacy JWT signing for routes that still use JSON storage
  // Phase S.1: no hardcoded fallback secret — forgeable admin tokens with a
  // key committed to a PUBLIC repo are unacceptable. Throws if unset.
  const jwt = require('jsonwebtoken');
  const SECRET = process.env.KTX_JWT_SECRET || (() => {
    throw new Error('KTX_JWT_SECRET is not set; legacy signSession is disabled.');
  })();
  return jwt.sign(
    { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      isPastor: user.isPastor || false 
    },
    SECRET,
    { expiresIn: '7d' }
  );
}

export function verifySession(token: string): SessionUser | null {
  try {
    const jwt = require('jsonwebtoken');
    // Phase S.1: same guard as signSession — no committed fallback secret.
    const SECRET = process.env.KTX_JWT_SECRET || (() => {
      throw new Error('KTX_JWT_SECRET is not set; legacy verifySession is disabled.');
    })();
    return jwt.verify(token, SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function requireActiveSession() {
  const session = await getSession();
  if (!session) return null;
  
  // For routes still using JSON storage, check suspension
  const { db } = await import('@/lib/store');
  const user = db.findById(legacyIdFor(session.id));
  if (!user || user.suspended) return null;
  
  return user; // full User record — callers use .notifications, .wallet fields, etc.
}

export function publicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isPastor: user.isPastor || false,
  };
}
