import { NextRequest, NextResponse } from 'next/server';
import { pastorsDb } from '@/lib/pastorStore';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Reads Supabase pastor_applications first (record of truth), falls back to
// the JSON mirror during the migration window.
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let application: any = null;
    const { data: sbApp } = await supabaseAdmin
      .from('pastor_applications')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (sbApp) {
      application = {
        status: sbApp.status,
        name: sbApp.name,
        ministry: sbApp.ministry,
        appliedAt: sbApp.created_at ? new Date(sbApp.created_at).getTime() : null,
        reviewedAt: sbApp.reviewed_at ? new Date(sbApp.reviewed_at).getTime() : null,
      };
    } else {
      const jsonApp = pastorsDb.all().find(
        (app: any) => app.email.toLowerCase() === email.toLowerCase()
      );
      if (jsonApp) {
        application = {
          status: jsonApp.status,
          name: jsonApp.name,
          ministry: jsonApp.ministry,
          appliedAt: jsonApp.createdAt,
          reviewedAt: jsonApp.reviewedAt || null,
        };
      }
    }

    if (!application) {
      return NextResponse.json({ 
        status: 'not_found',
        message: 'No application found for this email address.'
      }, { status: 404 });
    }

    return NextResponse.json({
      ...application,
      message: application.status === 'approved' 
        ? 'Your application has been approved! Check your email for login credentials.'
        : application.status === 'rejected'
        ? 'Unfortunately, your application was not approved at this time.'
        : 'Your application is under review. We will notify you by email once a decision is made.'
    });
  } catch (error: any) {
    console.error('Application status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
