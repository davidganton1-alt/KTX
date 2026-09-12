import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { announcementsDb } from "@/lib/announcements";
import { requireActiveSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Merged notifications feed: personal notifications + platform announcements.
// Visiting marks personal notifications as seen (clears the badge).
export async function GET() {
  const u = await requireActiveSession();
  if (!u) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const unread = u.notifications.filter((n) => n.at > u.lastSeenNotifs).length;

  // announcements: Supabase is the record of truth; JSON mirror as fallback
  let announcements = announcementsDb.all();
  try {
    const { data } = await supabaseAdmin
      .from("announcements")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false });
    if (data && data.length) {
      announcements = data.map((r: any) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        createdAt: r.created_at ? new Date(r.created_at).getTime() : 0,
      }));
    }
  } catch (e: any) {
    console.error("[notifications] announcements read failed:", e.message);
  }

  db.markNotifsSeen(u.id);

  return NextResponse.json({
    notifications: u.notifications,
    announcements,
    unread,
  });
}
