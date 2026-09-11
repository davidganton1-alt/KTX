import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatDb } from '@/lib/chatStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = req.nextUrl.searchParams.get('conversationId');
    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    const messages = chatDb.getMessages(conversationId);
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
