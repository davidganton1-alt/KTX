import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEngineMode, setEngineMode } from "@/lib/engineMode";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ engineMode: getEngineMode() });
}

export async function POST(req: NextRequest) {
  const admin = getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const mode = body?.mode;
  if (mode !== "demo" && mode !== "live") {
    return NextResponse.json({ error: "mode must be 'demo' or 'live'" }, { status: 400 });
  }
  const saved = setEngineMode(mode);
  return NextResponse.json({ ok: true, engineMode: saved });
}
