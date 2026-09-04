import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { announcementsDb } from "@/lib/announcements";
import { requireActiveSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Merged notifications feed: personal notifications + platform announcements.
// Visiting marks personal notifications as seen (clears the badge).
export async function GET() {
  const u = requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const unread = u.notifications.filter((n) => n.at > u.lastSeenNotifs).length;
  const announcements = announcementsDb.all();

  db.markNotifsSeen(u.id);

  return NextResponse.json({
    notifications: u.notifications,
    announcements,
    unread,
  });
}
