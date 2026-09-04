import { NextRequest, NextResponse } from "next/server";
import { pastorsDb } from "@/lib/pastorStore";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Admin only: approve/reject pastor applications, edit share rates, and
// approve/reject pastor payout requests.
export async function POST(req: NextRequest) {
  const admin = getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id, status, shareRate, name, email, action, payoutId } = await req.json();

    // Share-rate editor
    if (action === "set-rate") {
      if (!id || typeof shareRate !== "number") {
        return NextResponse.json({ error: "id and shareRate are required." }, { status: 400 });
      }
      const p = pastorsDb.setShareRate(id, shareRate);
      if (!p) return NextResponse.json({ error: "Pastor not found." }, { status: 404 });
      return NextResponse.json({ ok: true, pastor: { id: p.id, shareRate: p.shareRate } });
    }

    // Payout review
    if (action === "payout") {
      if (!id || !payoutId || !status || !["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "id, payoutId and status are required." }, { status: 400 });
      }
      const p = pastorsDb.setPayoutStatus(id, payoutId, status);
      if (!p) return NextResponse.json({ error: "Pastor or payout not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required." }, { status: 400 });
    }
    const p = pastorsDb.setStatus(id, status, shareRate, name, email);
    if (!p) return NextResponse.json({ error: "Pastor not found." }, { status: 404 });
    return NextResponse.json({ ok: true, pastor: p });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed." }, { status: 400 });
  }
}
