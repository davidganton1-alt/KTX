import { NextResponse } from "next/server";
import { AUTH_COOKIE, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET() {
  const user = getSession();
  return NextResponse.json({ user });
}
