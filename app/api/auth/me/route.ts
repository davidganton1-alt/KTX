import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = getSession();
  if (!user) return NextResponse.json({ role: null });
  return NextResponse.json({ role: user.role, name: user.name });
}
