import { supabaseAdmin } from "@/lib/supabase";
import { supabaseIdFor } from "@/lib/auth";
import { pastorsDb } from "@/lib/pastorStore";
import { db } from "@/lib/store";

// Shared pastor-share accrual mirror (Phase 2 / Prompt 5).
//
// NOTE the deviation from the prompt sketch: the JSON credit already happens
// INSIDE db.accrueDaily / db.accrueAmount (lib/store.ts credits the referring
// pastor). This helper therefore does NOT call pastorsDb.credit again — it
// only mirrors the same share into the Supabase audit trail:
//   pastor_earnings row  ->  pastors.earned_total / profit_history  ->  flock_members.total_contributed
export async function accruePastorShare(
  memberJsonId: string,
  memberProfitGained: number
): Promise<void> {
  if (!(memberProfitGained > 0)) return;
  const member = db.findById(memberJsonId);
  if (!member || !member.referredBy || !member.pastorShareRate) return;

  const share = +(memberProfitGained * (member.pastorShareRate / 100)).toFixed(4);
  if (share <= 0) return;

  const pastor = pastorsDb.findById(member.referredBy);
  if (!pastor) return;

  try {
    // pastor roster row (by email), member profile via existing bridging
    const { data: roster } = await supabaseAdmin
      .from("pastors")
      .select("id, earned_total, profit_history")
      .ilike("email", pastor.email)
      .maybeSingle();
    if (!roster) return;

    const memberSupa = supabaseIdFor(memberJsonId);
    if (!memberSupa) return;
    const { data: flock } = await supabaseAdmin
      .from("flock_members")
      .select("id, user_id, total_contributed")
      .eq("pastor_id", roster.id)
      .eq("user_id", memberSupa)
      .maybeSingle();
    // If the member has no flock row we cannot satisfy pastor_earnings.user_id FK.
    if (!flock) return;

    const { error: earningsError } = await supabaseAdmin
      .from("pastor_earnings")
      .insert({
        pastor_id: roster.id,
        user_id: flock.user_id,
        amount: share,
        source: "member_profit",
        notes: `Member: ${member.name}`,
      });
    if (earningsError) {
      console.error("[pastorAccrual] earnings insert failed:", earningsError.message);
      return;
    }

    const newTotal = +(Number(roster.earned_total || 0) + share).toFixed(4);
    const history: any[] = roster.profit_history || [];
    const today = new Date().toISOString().slice(0, 10);
    const existing = history.find((h) => h.date === today);
    if (existing) existing.profit = +(existing.profit + share).toFixed(4);
    else history.push({ date: today, profit: share, memberId: member.id, memberName: member.name });
    if (history.length > 90) history.splice(0, history.length - 90);

    const { error: updateError } = await supabaseAdmin
      .from("pastors")
      .update({ earned_total: newTotal, profit_history: history, updated_at: new Date().toISOString() })
      .eq("id", roster.id);
    if (updateError) console.error("[pastorAccrual] pastor update failed:", updateError.message);

    // INCREMENT the member's lifetime contribution (the sketch's absolute set
    // would lose all earlier ticks).
    const { error: flockError } = await supabaseAdmin
      .from("flock_members")
      .update({ total_contributed: +(Number(flock.total_contributed || 0) + share).toFixed(4) })
      .eq("id", flock.id);
    if (flockError) console.error("[pastorAccrual] flock update failed:", flockError.message);
  } catch (e: any) {
    console.error("[pastorAccrual] Supabase mirror failed:", e.message);
  }
}
