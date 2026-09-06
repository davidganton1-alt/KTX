import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
  }

  // Find user by verification token
  const users = db.findAll();
  const user = users.find((u) => u.verifyToken === token);

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
  }

  // Mark as verified and clear the token
  db.setEmailVerified(user.id, true);
  // Optionally clear the token: db.update({ id: user.id, verifyToken: null })

  return NextResponse.json({ success: true, message: "Email verified successfully" });
}
