import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Phase S.1 RETIRED: legacy JSON-era admin withdrawal processor. It mutated
// JSON mirror money for rows the current Supabase approval queues never see
// ('approved' never paid; 'rejected' refunded into the wallet/state sync).
// Admin money approvals live in /api/admin/principal-approvals and
// /api/admin/referral-approvals. Original implementation preserved at this
// file's *.backup-phaseS1.
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been retired. Use the admin approvals endpoints." },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Retired endpoint" }, { status: 410 });
}
