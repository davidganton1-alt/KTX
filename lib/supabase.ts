import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/client-side code (uses anon key, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side code (uses service role key, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Ephemeral client for USER credential verification only (login, register
// auto-login). NEVER call signInWithPassword on `supabaseAdmin`: GoTrue
// stores the verified user's session in-memory on that singleton, and every
// later service-role DB call from ANY request then rides that user's JWT,
// so RLS starts rejecting writes that used to bypass it ("new row violates
// row-level security policy"). Throwaway clients cannot poison the singleton.
export function createUserAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Type helpers
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: 'user' | 'admin';
          is_pastor: boolean;
          email_verified: boolean;
          two_factor_enabled: boolean;
          referred_by: string | null;
          pastor_name: string | null;
          pastor_share_rate: number;
          has_seen_tour: boolean;
          has_signed_agreement: boolean;
          agreement_signed_at: string | null;
          has_shared_first_withdrawal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      // Other tables will be added as we migrate them
    };
  };
};
