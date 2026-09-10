import { NextRequest, NextResponse } from "next/server";
import { pastorsDb } from "@/lib/pastorStore";

export const dynamic = "force-dynamic";

// In-memory per-IP rate limiter (see POST below). Survives across requests
// within the same server process; resets on restart.
declare global {
  // eslint-disable-next-line no-var
  var pastorAppRateLimit: Map<string, number[]> | undefined;
}

// Public: anyone can apply to be listed as a pastor. The application lands as
// "pending" and must be approved by an admin before the pastor is active and
// can refer members.
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, ministry, message } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Rate limiting: check for duplicate applications by email
    const existingApplication = pastorsDb.all().find(
      (app: any) => app.email.toLowerCase() === String(email).toLowerCase()
    );

    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists. Please check your application status.' },
        { status: 409 }
      );
    }

    // Rate limiting: simple in-memory rate limit (max 3 applications per hour per IP)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    if (!globalThis.pastorAppRateLimit) {
      globalThis.pastorAppRateLimit = new Map();
    }

    const rateLimitStore = globalThis.pastorAppRateLimit;
    const userAttempts = rateLimitStore.get(ip) || [];

    // Clean up old attempts
    const recentAttempts = userAttempts.filter((time: number) => now - time < ONE_HOUR);

    if (recentAttempts.length >= 3) {
      return NextResponse.json(
        { error: 'Too many application attempts. Please try again in an hour.' },
        { status: 429 }
      );
    }

    // Record this attempt
    recentAttempts.push(now);
    rateLimitStore.set(ip, recentAttempts);

    const p = pastorsDb.createApplication({ name, email, phone, ministry, message });
    return NextResponse.json({ ok: true, id: p.id, status: p.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Application failed." }, { status: 400 });
  }
}
