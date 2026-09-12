import { NextRequest, NextResponse } from "next/server";
import { announcementsDb } from "@/lib/announcements";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Admin: platform announcements (shown on every member & pastor panel).
// Supabase is the record of truth; the JSON store is mirrored during the
// migration window so legacy readers keep working. Same uuid in both.

// Admin: create a platform announcement (shown on every member & pastor panel).
export async function POST(req: NextRequest) {
  const admin = await getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, body } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const a = announcementsDb.create(title.trim(), (body || "").trim());
  try {
    const { error } = await supabaseAdmin.from("announcements").insert({
      id: a.id,
      title: a.title,
      body: a.body || "",
      created_by: admin.id,
      created_at: new Date(a.createdAt).toISOString(),
    });
    if (error) console.error("[announcements] sb insert failed:", error.message);
  } catch (e: any) {
    console.error("[announcements] sb insert failed:", e.message);
  }
  return NextResponse.json({ ok: true, announcement: a });
}

export async function DELETE(req: NextRequest) {
  const admin = await getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
  announcementsDb.remove(id);
  try {
    const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);
    if (error) console.error("[announcements] sb delete failed:", error.message);
  } catch (e: any) {
    console.error("[announcements] sb delete failed:", e.message);
  }
  return NextResponse.json({ ok: true });
}
