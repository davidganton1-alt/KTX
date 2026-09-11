import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { getSession, legacyIdFor } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { syncRosterFromJson } from "@/lib/pastorMirror";

export const dynamic = "force-dynamic";

// Pastor requests a payout of their available earnings. JSON stays the
// operational ledger during the migration window; the Supabase roster is
// synced after the request so payouts appear in the record of truth.
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const me = db.findById(legacyIdFor(s.id));
  if (!me || !me.isPastor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pastor = pastorsDb.findById(me.id) || pastorsDb.findApprovedByName(me.name);
  if (!pastor) return NextResponse.json({ error: "Pastor profile not found." }, { status: 404 });

  const { amount } = await req.json();
  const res = pastorsDb.requestPayout(pastor.id, Number(amount));
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  // verify pastor status in Supabase profiles (authoritative is_pastor)
  try {
    const { data: prof } = await supabaseAdmin.from("profiles").select("is_pastor").eq("id", s.id).maybeSingle();
    if (prof && !prof.is_pastor) {
      await supabaseAdmin.from("profiles").update({ is_pastor: true }).eq("id", s.id);
    }
  } catch {}

  const fresh = pastorsDb.findById(pastor.id);
  if (fresh) await syncRosterFromJson(fresh);

  return NextResponse.json({ ok: true, payout: res.payout });
}
