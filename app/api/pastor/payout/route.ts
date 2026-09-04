import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Pastor requests a payout of their available earnings.
export async function POST(req: NextRequest) {
  const s = getSession();
  if (!s) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const me = db.findById(s.id);
  if (!me || !me.isPastor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pastor = pastorsDb.findById(me.id) || pastorsDb.findApprovedByName(me.name);
  if (!pastor) return NextResponse.json({ error: "Pastor profile not found." }, { status: 404 });

  const { amount } = await req.json();
  const res = pastorsDb.requestPayout(pastor.id, Number(amount));
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true, payout: res.payout });
}
