import { NextRequest, NextResponse } from "next/server";
import { announcementsDb } from "@/lib/announcements";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Admin: create a platform announcement (shown on every member & pastor panel).
export async function POST(req: NextRequest) {
  const admin = getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, body } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const a = announcementsDb.create(title.trim(), (body || "").trim());
  return NextResponse.json({ ok: true, announcement: a });
}

export async function DELETE(req: NextRequest) {
  const admin = getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
  announcementsDb.remove(id);
  return NextResponse.json({ ok: true });
}
