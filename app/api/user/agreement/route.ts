import { NextRequest, NextResponse } from "next/server";
import { getSession, legacyIdFor } from "@/lib/auth";
import { db } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { agreedAt } = await req.json().catch(() => ({}));
  if (!agreedAt) return NextResponse.json({ error: "agreedAt required" }, { status: 400 });

  // Supabase profiles is authoritative for the gate (lib/auth + /api/auth/me)
  await supabaseAdmin
    .from("profiles")
    .update({
      has_signed_agreement: true,
      agreement_signed_at: new Date(Number(agreedAt)).toISOString(),
    })
    .eq("id", session.id);

  db.update(legacyIdFor(session.id), {
    hasSignedAgreement: true,
    agreementSignedAt: Number(agreedAt),
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ signed: false });
  const user = db.findById(legacyIdFor(session.id));
  let signed = user?.hasSignedAgreement === true;
  if (!signed) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("has_signed_agreement")
      .eq("id", session.id)
      .maybeSingle();
    signed = !!data?.has_signed_agreement;
  }
  return NextResponse.json({
    signed,
    signedAt: user?.agreementSignedAt ?? null,
  });
}
