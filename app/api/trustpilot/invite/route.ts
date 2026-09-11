import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { getSession, legacyIdFor } from "@/lib/auth";
import { INVITATION_RULES } from "@/lib/trustpilot";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { triggerType } = await req.json();
    
    if (!triggerType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = db.findById(legacyIdFor(session.id));
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const rule = INVITATION_RULES[triggerType];
    if (!rule) {
      return NextResponse.json({ error: 'Invalid trigger type' }, { status: 400 });
    }

    const lastInvitation = user.trustpilotInvitations?.find(i => i.triggerType === triggerType);
    if (lastInvitation) {
      const daysSinceInvitation = Math.floor((Date.now() - lastInvitation.sentAt) / (1000 * 60 * 60 * 24));
      if (daysSinceInvitation < rule.cooldownDays) {
        return NextResponse.json({ error: 'Too soon since last invitation' }, { status: 429 });
      }
    }

    const daysSinceSignup = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
    if (rule.minDaysSinceSignup && daysSinceSignup < rule.minDaysSinceSignup) {
      return NextResponse.json({ error: 'User not eligible yet' }, { status: 400 });
    }

    console.log(`Sending Trustpilot invitation to user ${session.id} for trigger ${triggerType}`);

    const invitation = {
      triggerType,
      sentAt: Date.now(),
      status: 'sent',
    };

    db.update(legacyIdFor(session.id), {
      trustpilotInvitations: [...(user.trustpilotInvitations || []), invitation],
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error('Trustpilot invitation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
