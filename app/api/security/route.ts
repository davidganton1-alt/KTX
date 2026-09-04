import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function totpSecret() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let s = "";
  for (let i = 0; i < 16; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export async function POST(req: NextRequest) {
  const user = getSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { action } = await req.json();

  if (action === "verify-email") {
    const u = db.setEmailVerified(user.id, true);
    return NextResponse.json({ ok: true, emailVerified: u.emailVerified });
  }

  if (action === "enable-2fa") {
    const u = db.setTwoFactor(user.id, true, totpSecret());
    return NextResponse.json({ ok: true, twoFactorEnabled: u.twoFactorEnabled, secret: u.twoFactorSecret });
  }

  if (action === "disable-2fa") {
    const u = db.setTwoFactor(user.id, false);
    return NextResponse.json({ ok: true, twoFactorEnabled: u.twoFactorEnabled });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
