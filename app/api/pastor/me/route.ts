import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { getSession, legacyIdFor } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Pastor's own panel data. The roster read comes from Supabase (record of
// truth) when available and falls back to the JSON store; the JSON is synced
// up first so a freshly approved pastor's Supabase row is never stale.
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const me = db.findById(legacyIdFor(s.id));
  if (!me || !me.isPastor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const pastor = pastorsDb.findById(me.id) || pastorsDb.findApprovedByName(me.name);
  if (pastor) {
    try {
      const { syncRosterFromJson } = await import("@/lib/pastorMirror");
      await syncRosterFromJson(pastor);
    } catch {}
  }
  const referred = db
    .findAll()
    .filter((u) => u.referredBy === me.id || u.pastorName === me.name)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      tier: u.tier,
      deposited: u.deposited,
      profit: u.profit,
      pastorShareRate: u.pastorShareRate,
    }));

  let sb: any = null;
  try {
    const { data } = await supabaseAdmin
      .from("pastors")
      .select("id, share_rate, earned_total, events, payouts, profit_history")
      .ilike("email", me.email)
      .maybeSingle();
    sb = data;
  } catch {}

  // STEP 8 (Prompt 5): earnings audit trail + flock from Supabase when present
  let earnings: any[] = [];
  let flock: { id: string; name: string; email: string; totalContributed: number }[] = [];
  try {
    if (sb?.id) {
      const [{ data: earn }, { data: fl }] = await Promise.all([
        supabaseAdmin
          .from("pastor_earnings")
          .select("amount, source, notes, created_at")
          .eq("pastor_id", sb.id)
          .order("created_at", { ascending: false })
          .limit(100),
        supabaseAdmin
          .from("flock_members")
          .select("user_id, total_contributed, profiles(name, email)")
          .eq("pastor_id", sb.id),
      ]);
      earnings = (earn ?? []).map((r: any) => ({
        amount: Number(r.amount),
        source: r.source,
        notes: r.notes,
        at: r.created_at ? new Date(r.created_at).getTime() : 0,
      }));
      flock = (fl ?? []).map((r: any) => ({
        id: r.user_id,
        name: r.profiles?.name ?? "Member",
        email: r.profiles?.email ?? "",
        totalContributed: Number(r.total_contributed || 0),
      }));
    }
  } catch (e: any) {
    console.error("[pastor/me] earnings/flock read failed:", e.message);
  }

  const earned = sb ? Number(sb.earned_total) : (pastor?.earnedTotal ?? 0);
  const shareRate = sb ? Number(sb.share_rate) : (pastor?.shareRate ?? 5);
  const payouts = (sb?.payouts ?? pastor?.payouts ?? []) as any[];
  const events = (sb?.events ?? pastor?.events ?? []) as any[];
  const profitHistory = (sb?.profit_history ?? pastor?.profitHistory ?? []) as any[];
  const available = pastor
    ? pastorsDb.available(pastor)
    : +(earned - payouts
        .filter((x) => x.status === "approved" || x.status === "pending")
        .reduce((sum, x) => sum + x.amount, 0)).toFixed(4);
  // Shareable link: prefills the pastor's name on the register page.
  const inviteLink = `/register?pastor=${encodeURIComponent(pastor?.name ?? me.name)}`;

  // Leaderboard among approved pastors (from Supabase roster, JSON fallback).
  let leaders: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("pastors")
      .select("name, ministry, referrals, earned_total")
      .order("referrals", { ascending: false })
      .order("earned_total", { ascending: false })
      .limit(20);
    leaders = (data ?? []).map((p: any, i: number) => ({
      rank: i + 1,
      name: p.name,
      ministry: p.ministry,
      referrals: p.referrals,
      earnedTotal: Number(p.earned_total),
      isYou: p.name === (pastor?.name ?? me.name),
    }));
  } catch {}
  if (leaders.length === 0) {
    leaders = pastorsDb
      .approved()
      .slice()
      .sort((a, b) => b.referrals - a.referrals || b.earnedTotal - a.earnedTotal)
      .map((p, i) => ({
        rank: i + 1,
        name: p.name,
        ministry: p.ministry,
        referrals: p.referrals,
        earnedTotal: p.earnedTotal,
        isYou: p.id === pastor?.id,
      }));
  }

  // Prefer the Supabase flock (record of truth) when populated; merge in
  // tier/deposit detail from JSON where the member is known.
  const finalReferrals = flock.length
    ? flock.map((f) => {
        const j = referred.find((r) => legacyIdFor(f.id) === r.id || r.id === f.id);
        return {
          id: f.id,
          name: f.name,
          email: f.email,
          tier: j?.tier ?? "none",
          deposited: j?.deposited ?? 0,
          profit: j?.profit ?? 0,
          pastorShareRate: j?.pastorShareRate ?? shareRate,
          totalContributed: f.totalContributed,
        };
      })
    : referred;

  return NextResponse.json({
    name: me.name,
    email: me.email,
    earnedTotal: earned,
    available,
    shareRate,
    referrals: finalReferrals,
    referralsCount: finalReferrals.length,
    inviteLink,
    earnings,
    events: events.slice(0, 30),
    payouts,
    profitHistory,
    leaders,
  });
}
