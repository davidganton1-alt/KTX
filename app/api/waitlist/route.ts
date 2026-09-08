import { NextRequest, NextResponse } from 'next/server';
import { addToWaitlist, getWaitlist } from '@/lib/waitlist';

export const dynamic = 'force-dynamic';

export async function GET() {
  const list = await getWaitlist();
  const count = 1242 + list.length;
  return NextResponse.json({ count });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }
  const result = await addToWaitlist(email);
  if (!result.success) {
    return NextResponse.json(result, { status: 409 });
  }
  return NextResponse.json(result);
}
