import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { AUTH_COOKIE, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    db.seedAdmin();
    db.seedDemoUser();
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    const user = db.verifyPassword(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }
    if (user.suspended) {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }
    // Block unverified users
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in. Check your inbox or the link shown during registration." },
        { status: 403 }
      );
    }
    const token = signSession(user);
    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPastor: user.isPastor || false,
      },
    });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
