import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatDb } from '@/lib/chatStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = chatDb.getConversations();
    const visitors = chatDb.getVisitors();

    return NextResponse.json({ conversations, visitors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
