import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Phase S.1 RETIRED: legacy JSON-era principal-withdrawal path. It mutated
// only users.json and pushed into the old JSON withdrawals queue that the
// current admin approvals never pay out ('approved' paid nothing — a
// user-money black hole, and its reservations desynced against the
// withdraw-principal flow). The single authoritative principal path is
// /api/wallet/withdraw-principal -> /api/admin/principal-approvals.
// Original implementation preserved at this file's *.backup-phaseS1.
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been retired. Use the principal withdrawal flow." },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Retired endpoint" }, { status: 410 });
}
