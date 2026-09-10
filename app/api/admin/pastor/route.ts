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
    const { id, status, shareRate, name, email, action, payoutId, ids } = await req.json();

    // Bulk approve/reject pastor applications
    if (action === "bulk-review") {
      if (!Array.isArray(ids) || ids.length === 0 || !["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "ids (non-empty array) and status (approved|rejected) are required." }, { status: 400 });
      }
      const credentials: { name: string; email: string; password: string }[] = [];
      let processed = 0;
      for (const appId of ids) {
        // setStatus already handles everything: flips status, sets reviewedAt,
        // and on approval mints the login account (ensurePastorAccount) with a
        // one-time generated password returned in `credentials`.
        const p = pastorsDb.setStatus(appId, status);
        if (!p) continue; // application vanished mid-loop; skip rather than fail the batch
        processed += 1;
        if (status === "approved" && p.credentials) {
          credentials.push({ name: p.name, email: p.credentials.email, password: p.credentials.password });
        }
      }
      return NextResponse.json({ ok: true, processed, credentials });
    }

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
