import { supabaseAdmin } from '@/lib/supabase';

// Resolve an email recipient + greeting name for a Supabase user id.
// Falls back to the legacy JSON store so users without a profile row can
// still receive their transactional email.
export async function getRecipient(userId: string): Promise<{ email: string; name: string } | null> {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .maybeSingle();
    if (profile?.email) return { email: profile.email, name: profile.name || 'there' };
  } catch {}
  try {
    const { db } = await import('@/lib/store');
    const { legacyIdFor } = await import('@/lib/auth');
    const ju = db.findById(legacyIdFor(userId));
    if (ju?.email) return { email: ju.email, name: ju.name || 'there' };
  } catch {}
  return null;
}
