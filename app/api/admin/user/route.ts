import { NextRequest, NextResponse } from "next/server";
import { db, type Tier } from "@/lib/store";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Admin user management: suspend/reactivate, change plan, adjust profit.
export async function POST(req: NextRequest) {
  const admin = getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, action, tier, amount } = await req.json();
  if (!id || !action) {
    return NextResponse.json({ error: "id and action are required." }, { status: 400 });
  }

  if (id === "admin-0000-0000-0000-000000000000") {
    return NextResponse.json({ error: "Cannot modify the admin account." }, { status: 400 });
  }

  switch (action) {
    case "suspend":
    case "reactivate": {
      const u = db.setSuspended(id, action === "suspend");
      if (!u) return NextResponse.json({ error: "User not found." }, { status: 404 });
      return NextResponse.json({ ok: true, user: { id: u.id, suspended: u.suspended } });
    }
    case "set-tier": {
      const t = String(tier || "none");
      if (!["none", "faithful", "steward", "ambassador"].includes(t)) {
        return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
      }
      const u = db.setTier(id, t as Tier);
      if (!u) return NextResponse.json({ error: "User not found." }, { status: 404 });
      return NextResponse.json({ ok: true, user: { id: u.id, tier: u.tier, dailyRate: u.dailyRate } });
    }
    case "adjust-profit": {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt === 0) {
        return NextResponse.json({ error: "Enter a non-zero amount." }, { status: 400 });
      }
      const u = db.adjustProfit(id, amt);
      if (!u) return NextResponse.json({ error: "User not found." }, { status: 404 });
      return NextResponse.json({ ok: true, user: { id: u.id, profit: u.profit, balance: u.balance } });
    }
    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
}
