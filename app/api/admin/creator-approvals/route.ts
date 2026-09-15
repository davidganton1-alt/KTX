import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: applications, error } = await supabaseAdmin
      .from('creator_applications')
      .select(`
        *,
        profiles:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { application_id, action, admin_notes } = await req.json();

    if (!application_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { data: application } = await supabaseAdmin
      .from('creator_applications')
      .select('*')
      .eq('id', application_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (!application) {
      return NextResponse.json({ error: 'Application not found or already processed' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    await supabaseAdmin
      .from('creator_applications')
      .update({
        status: newStatus,
        admin_notes: admin_notes || null,
        reviewed_by: session.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', application_id);

    if (action === 'approve') {
      const { error: profErr } = await supabaseAdmin
        .from('profiles')
        .update({ is_creator: true, role: 'creator' })
        .eq('id', application.user_id);
      if (profErr) {
        return NextResponse.json({ error: 'Approved but profile update failed: ' + profErr.message }, { status: 500 });
      }
      // notify via the JSON operational store (the console notifications feed)
      try {
        const { db } = await import('@/lib/store');
        const { legacyIdFor } = await import('@/lib/auth');
        const jid = legacyIdFor(application.user_id);
        if (jid) db.notify(jid, 'Your creator application was approved. Your creator dashboard is live.', 'referral');
      } catch {}
      // Phase G: approval email with invite link
      try {
        const { emails } = await import('@/lib/email/service');
        const { SITE_URL } = await import('@/lib/email/config');
        const { getRecipient } = await import('@/lib/email/recipient');
        const recip = await getRecipient(application.user_id);
        if (recip) {
          emails.creatorApplicationApproved(recip.email, {
            name: recip.name,
            brandName: application.brand_name || application.name,
            inviteLink: SITE_URL + '/creator',
          });
        }
      } catch {}
    } else {
      // Phase G: rejection email (with admin feedback as reason)
      try {
        const { emails } = await import('@/lib/email/service');
        const { getRecipient } = await import('@/lib/email/recipient');
        const recip = await getRecipient(application.user_id);
        if (recip) emails.creatorApplicationRejected(recip.email, { name: recip.name, reason: admin_notes || undefined });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Application ${newStatus} successfully`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
