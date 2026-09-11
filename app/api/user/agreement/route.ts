import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { agreedAt } = await req.json().catch(() => ({}));
  if (!agreedAt) return NextResponse.json({ error: "agreedAt required" }, { status: 400 });

  db.update(session.id, {
    hasSignedAgreement: true,
    agreementSignedAt: Number(agreedAt),
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ signed: false });
  const user = db.findById(session.id);
  return NextResponse.json({
    signed: user?.hasSignedAgreement === true,
    signedAt: user?.agreementSignedAt ?? null,
  });
}
