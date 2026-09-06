import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ role: null, isPastor: false });
  
  // Fetch full user to check isPastor status
  const user = db.findById(session.id);
  
  return NextResponse.json({ 
    role: session.role, 
    name: session.name,
    isPastor: user?.isPastor ?? false,
    hasSeenTour: user?.hasSeenTour ?? false  // <-- ADD THIS
  });
}
