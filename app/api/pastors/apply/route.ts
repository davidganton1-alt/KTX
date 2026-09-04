import { NextRequest, NextResponse } from "next/server";
import { pastorsDb } from "@/lib/pastorStore";

export const dynamic = "force-dynamic";

// Public: anyone can apply to be listed as a pastor. The application lands as
// "pending" and must be approved by an admin before the pastor is active and
// can refer members.
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, ministry, message } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }
    const p = pastorsDb.createApplication({ name, email, phone, ministry, message });
    return NextResponse.json({ ok: true, id: p.id, status: p.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Application failed." }, { status: 400 });
  }
}
