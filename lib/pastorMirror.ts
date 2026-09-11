import { supabaseAdmin } from "@/lib/supabase";
import type { Pastor } from "@/lib/pastorStore";

// ── Supabase mirror helpers (Phase 2 / Prompt 3) ──
// JSON stays the operational store during the migration window; these keep
// pastor_applications and pastors in step so Supabase is the record of truth.
// All functions are fire-and-forget safe: errors are logged, never thrown.

export async function mirrorApplication(p: Pastor, statusOverride?: Pastor["status"]): Promise<string | null> {
  try {
    const { data: dup } = await supabaseAdmin
      .from("pastor_applications")
      .select("id")
      .ilike("email", p.email)
      .maybeSingle();
    const row = {
      name: p.name,
      email: p.email,
      phone: (p as any).phone || null,
      ministry: p.ministry || null,
      message: p.message || null,
      status: statusOverride ?? p.status,
      share_rate: p.shareRate ?? 5,
      reviewed_at: p.reviewedAt ? new Date(p.reviewedAt).toISOString() : null,
      created_at: new Date(p.createdAt).toISOString(),
    };
    if (dup) {
      const { error } = await supabaseAdmin.from("pastor_applications").update(row).eq("id", dup.id);
      if (error) console.error("[pastor-mirror] app update failed:", error.message);
      return dup.id as string;
    }
    const { data, error } = await supabaseAdmin.from("pastor_applications").insert(row).select("id").single();
    if (error) {
      console.error("[pastor-mirror] app insert failed:", error.message);
      return null;
    }
    return data.id as string;
  } catch (e: any) {
    console.error("[pastor-mirror] app failed:", e.message);
    return null;
  }
}

export async function mirrorRoster(p: Pastor, userId: string | null): Promise<string | null> {
  try {
    const { data: existing } = await supabaseAdmin
      .from("pastors")
      .select("id, user_id")
      .ilike("email", p.email)
      .maybeSingle();
    const base = {
      name: p.name,
      email: p.email,
      ministry: p.ministry || null,
      share_rate: p.shareRate ?? 5,
      earned_total: p.earnedTotal ?? 0,
      referrals: p.referrals ?? 0,
      events: p.events ?? [],
      payouts: p.payouts ?? [],
      profit_history: p.profitHistory ?? [],
      updated_at: new Date().toISOString(),
    };
    if (existing) {
      const { error } = await supabaseAdmin
        .from("pastors")
        .update({ ...base, user_id: userId ?? existing.user_id })
        .eq("id", existing.id);
      if (error) console.error("[pastor-mirror] roster update failed:", error.message);
      return existing.id as string;
    }
    const { data, error } = await supabaseAdmin
      .from("pastors")
      .insert({ ...base, user_id: userId, created_at: new Date(p.createdAt).toISOString() })
      .select("id")
      .single();
    if (error) {
      console.error("[pastor-mirror] roster insert failed:", error.message);
      return null;
    }
    return data.id as string;
  } catch (e: any) {
    console.error("[pastor-mirror] roster failed:", e.message);
    return null;
  }
}

/** Sync the roster's mutable parts (earnings, events, payouts, rate) from a JSON pastor. */
export async function syncRosterFromJson(p: Pastor): Promise<string | null> {
  try {
    const { data: existing } = await supabaseAdmin
      .from("pastors")
      .select("id")
      .ilike("email", p.email)
      .maybeSingle();
    if (!existing) return await mirrorRoster(p, null);
    const { error } = await supabaseAdmin
      .from("pastors")
      .update({
        share_rate: p.shareRate ?? 5,
        earned_total: p.earnedTotal ?? 0,
        referrals: p.referrals ?? 0,
        events: p.events ?? [],
        payouts: p.payouts ?? [],
        profit_history: p.profitHistory ?? [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) console.error("[pastor-mirror] roster sync failed:", error.message);
    return existing.id as string;
  } catch (e: any) {
    console.error("[pastor-mirror] sync failed:", e.message);
    return null;
  }
}
