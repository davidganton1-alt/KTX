import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { announcementsDb } from "@/lib/announcements";
import { getSession, supabaseIdFor } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = db.findAll().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    tier: u.tier,
    deposited: u.deposited,
    profit: u.profit,
    balance: u.balance,
    createdAt: u.createdAt,
    referredBy: u.referredBy,
    pastorName: u.pastorName,
    pastorShareRate: u.pastorShareRate,
    suspended: u.suspended || false,
  }));

  // Overlay funds from the Supabase wallets ledger where mapped (authoritative)
  try {
    const { data: sbWallets } = await supabaseAdmin.from("wallets").select("user_id, principal, profit, free_credit, tier");
    if (sbWallets) {
      const bySupa = new Map(sbWallets.map((w: any) => [w.user_id, w]));
      for (const row of users) {
        const sid = supabaseIdFor(row.id);
        const w = sid ? bySupa.get(sid) : undefined;
        if (w) {
          row.deposited = Number(w.principal);
          row.profit = Number(w.profit);
          row.balance = Number(w.principal) + Number(w.free_credit) + Number(w.profit);
          if (w.tier && w.tier !== "none") row.tier = w.tier;
        }
      }
    }
  } catch (e: any) {
    console.error("[admin/data] wallet overlay failed:", e.message);
  }

  const withdrawals = db
    .findAll()
    .flatMap((u) =>
      u.withdrawals.map((w) => ({
        id: w.id,
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        amount: w.amount,
        requestedAt: w.requestedAt,
        status: w.status,
      }))
    )
    .sort((a, b) => b.requestedAt - a.requestedAt);

  const pastors = pastorsDb.approved().map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    ministry: p.ministry,
    shareRate: p.shareRate,
    earnedTotal: p.earnedTotal,
    available: pastorsDb.available(p),
    referrals: p.referrals,
    payouts: p.payouts || [],
    profitHistory: p.profitHistory || [],
  }));
  const pastorApplications = pastorsDb
    .all()
    .filter((p) => p.status === "pending")
    .map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      ministry: p.ministry,
      message: p.message,
      shareRate: p.shareRate,
      createdAt: p.createdAt,
    }));

  // Overlay pastor roster + applications from Supabase (record of truth)
  try {
    const [{ data: sbRoster }, { data: sbApps }] = await Promise.all([
      supabaseAdmin.from("pastors").select("user_id, name, email, ministry, share_rate, earned_total, referrals, events, payouts, profit_history, created_at"),
      supabaseAdmin.from("pastor_applications").select("id, name, email, ministry, message, share_rate, created_at, status").eq("status", "pending"),
    ]);
    if (sbRoster && sbRoster.length) {
      pastors.length = 0;
      for (const r of sbRoster as any[]) {
        const earned = Number(r.earned_total || 0);
        const pays = (r.payouts || []) as any[];
        const committed = pays
          .filter((x) => x.status === "approved" || x.status === "pending")
          .reduce((s, x) => s + Number(x.amount), 0);
        // actions (set-rate/payout) still run against the JSON store: expose
        // its id when we can resolve it, else fall back for display-only rows
        const jsonMatch = pastorsDb.all().find((x) => x.email.toLowerCase() === String(r.email || "").toLowerCase());
        pastors.push({
          id: jsonMatch?.id || r.user_id || r.email,
          name: r.name,
          email: r.email,
          ministry: r.ministry,
          shareRate: Number(r.share_rate),
          earnedTotal: earned,
          available: +(earned - committed).toFixed(4),
          referrals: r.referrals,
          payouts: pays,
          profitHistory: r.profit_history || [],
        });
      }
    }
    if (sbApps) {
      pastorApplications.length = 0;
      for (const arow of sbApps as any[]) {
        const jsonMatch = pastorsDb.all().find((x) => x.email.toLowerCase() === String(arow.email || "").toLowerCase());
        pastorApplications.push({
          id: jsonMatch?.id || arow.id, // actions run on the JSON store; Supabase id only if unmapped
          name: arow.name,
          email: arow.email,
          ministry: arow.ministry,
          message: arow.message,
          shareRate: Number(arow.share_rate),
          createdAt: arow.created_at ? new Date(arow.created_at).getTime() : Date.now(),
        });
      }
    }
  } catch (e: any) {
    console.error("[admin/data] pastor overlay failed:", e.message);
  }

  return NextResponse.json({
    users,
    withdrawals,
    pastors,
    pastorApplications,
    emailLog: pastorsDb.recentEmails(10),
    announcements: await loadAnnouncements(),
    flockMembers: await loadFlockMembers(),
    pastorEarnings: await loadPastorEarnings(),
  });
}

// Prompt 5: flock + earnings audit trail from Supabase (fallback: JSON stores)
async function loadFlockMembers() {
  try {
    const { data } = await supabaseAdmin
      .from("flock_members")
      .select("pastor_id, user_id, joined_at, total_contributed, pastor:pastors(name, email), member:profiles(name, email)")
      .order("joined_at", { ascending: false })
      .limit(200);
    if (data && data.length) {
      return data.map((r: any) => ({
        pastorName: r.pastor?.name ?? null,
        pastorEmail: r.pastor?.email ?? null,
        memberName: r.member?.name ?? null,
        memberEmail: r.member?.email ?? null,
        joinedAt: r.joined_at ? new Date(r.joined_at).getTime() : 0,
        totalContributed: Number(r.total_contributed || 0),
      }));
    }
  } catch (e: any) {
    console.error("[admin/data] flock read failed:", e.message);
  }
  // JSON fallback: referredBy links on users + pastor roster names
  return db
    .findAll()
    .filter((u) => u.referredBy)
    .map((u) => {
      const pastor = pastorsDb.findById(u.referredBy!);
      return {
        pastorName: pastor?.name ?? u.pastorName ?? null,
        pastorEmail: pastor?.email ?? null,
        memberName: u.name,
        memberEmail: u.email,
        joinedAt: u.createdAt,
        totalContributed: 0,
      };
    });
}

async function loadPastorEarnings() {
  try {
    const { data } = await supabaseAdmin
      .from("pastor_earnings")
      .select("pastor:pastors(name), member:profiles(name), amount, source, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data && data.length) {
      return data.map((r: any) => ({
        pastorName: r.pastor?.name ?? null,
        memberName: r.member?.name ?? null,
        amount: Number(r.amount),
        source: r.source,
        notes: r.notes,
        at: r.created_at ? new Date(r.created_at).getTime() : 0,
      }));
    }
  } catch (e: any) {
    console.error("[admin/data] earnings read failed:", e.message);
  }
  return [];
}

// announcements: Supabase is the record of truth; JSON mirror as fallback
async function loadAnnouncements() {
  try {
    const { data } = await supabaseAdmin
      .from("announcements")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false });
    if (data && data.length) {
      return data.map((r: any) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        createdAt: r.created_at ? new Date(r.created_at).getTime() : 0,
      }));
    }
  } catch (e: any) {
    console.error("[admin/data] announcements overlay failed:", e.message);
  }
  return announcementsDb.all();
}
