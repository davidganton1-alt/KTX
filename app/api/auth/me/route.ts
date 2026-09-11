import { NextResponse } from 'next/server';
import { getSession, legacyIdFor } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      // Legacy shape (top-level null role) kept for all existing clients
      return NextResponse.json({ role: null, isPastor: false, user: null });
    }

    // pastor/tour flags live in the legacy JSON record during the migration window
    const { db } = await import('@/lib/store');
    const legacy = db.findById(legacyIdFor(session.id));

    // isPastor is authoritative in profiles after Prompt 1 seeding
    let isPastor = session.isPastor || legacy?.isPastor || false;
    if (!isPastor) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('is_pastor')
        .eq('id', session.id)
        .maybeSingle();
      isPastor = !!profile?.is_pastor;
    }

    return NextResponse.json({
      // legacy top-level contract (Navbar, console, pastor, admin clients)
      role: session.role,
      name: session.name,
      isPastor,
      hasSeenTour: legacy?.hasSeenTour ?? false,
      hasSignedAgreement: legacy?.hasSignedAgreement ?? session.hasSignedAgreement ?? false,
      // new nested shape
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
        isPastor,
        hasSignedAgreement: legacy?.hasSignedAgreement ?? session.hasSignedAgreement ?? false,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ role: null, isPastor: false, user: null, error: error.message });
  }
}
