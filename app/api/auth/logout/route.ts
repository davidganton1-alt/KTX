import { NextResponse } from "next/server";
import { AUTH_COOKIE, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Phase S.1: logout must clear the ACTUAL live cookies. 'sb-session' is the
  // real auth cookie and 'ktx_refresh' its refresh token; the old code only
  // deleted the dead legacy 'ktx_session', so signing out left the account
  // fully authenticated for 7 more days.
  const opts = { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" };
  res.cookies.set("sb-session", "", opts);
  res.cookies.set("ktx_refresh", "", opts);
  res.cookies.set(AUTH_COOKIE, "", opts);
  return res;
}

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user });
}
