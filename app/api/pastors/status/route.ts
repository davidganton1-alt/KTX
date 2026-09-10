import { NextRequest, NextResponse } from 'next/server';
import { pastorsDb } from '@/lib/pastorStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find application by email (case-insensitive)
    const application = pastorsDb.all().find(
      (app: any) => app.email.toLowerCase() === email.toLowerCase()
    );

    if (!application) {
      return NextResponse.json({ 
        status: 'not_found',
        message: 'No application found for this email address.'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: application.status, // pending | approved | rejected
      name: application.name,
      ministry: application.ministry,
      appliedAt: application.createdAt,
      reviewedAt: application.reviewedAt || null,
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
