import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
      user_metadata: { name },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Registration failed' }, { status: 400 });
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: 'user',
      });

    if (profileError) {
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 });
    }

    // Create wallet with $50 free credit
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .insert({
        user_id: authData.user.id,
        free_credit: 50,
      });

    if (walletError) {
      console.error('Wallet creation failed:', walletError);
      // Don't rollback user for wallet failure, just log it
    }

    // Sign in the user immediately
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      return NextResponse.json({ error: 'Auto-login failed' }, { status: 500 });
    }

    setSessionCookie(signInData.session.access_token);

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email,
        name,
        role: 'user',
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
