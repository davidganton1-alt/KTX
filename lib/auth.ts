import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

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
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(sessionCookie.value);
    
    if (error || !user) return null;

    // Fetch profile to get role and other fields
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return null;

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

export function setSessionCookie(token: string) {
  cookies().set('sb-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function clearSessionCookie() {
  cookies().delete('sb-session');
}

// ── COMPATIBILITY EXPORTS (for routes not yet migrated to Supabase) ──
// These keep existing JSON-based routes working during the migration

export const AUTH_COOKIE = 'ktx_session';

export function signSession(user: any): string {
  // Legacy JWT signing for routes that still use JSON storage
  const jwt = require('jsonwebtoken');
  const SECRET = process.env.KTX_JWT_SECRET || 'dev-secret-change-me-in-production-ktx';
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
    const SECRET = process.env.KTX_JWT_SECRET || 'dev-secret-change-me-in-production-ktx';
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
  const user = db.findById(session.id);
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
