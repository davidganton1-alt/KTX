import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  db.update(session.id, { hasSeenTour: true });
  return NextResponse.json({ success: true });
}
