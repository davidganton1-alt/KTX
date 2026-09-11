import { supabaseAdmin } from "@/lib/supabase";
import type { User } from "@/lib/store";

export type WalletRow = {
  id: string;
  user_id: string;
  principal: number;
  profit: number;
  free_credit: number;
  tier: string | null;
  deposit_at: string | null;
  accrued_total: number;
  last_accrual_at: string | null;
  daily_rate: number;
};

/** Fetch (or lazily create) the Supabase wallet for a Supabase user id. */
export async function ensureWallet(supaUserId: string, freeCredit = 50): Promise<WalletRow | null> {
  const { data } = await supabaseAdmin
    .from("wallets")
    .select("*")
    .eq("user_id", supaUserId)
    .maybeSingle();
  if (data) return data as WalletRow;
  const { data: created, error } = await supabaseAdmin
    .from("wallets")
    .insert({ user_id: supaUserId, free_credit: freeCredit, principal: 0, profit: 0, tier: "none" })
    .select()
    .single();
  if (error) {
    console.error("[wallet] ensure failed:", error.message);
    return null;
  }
  return created as WalletRow;
}

export function walletValuesFromJsonUser(u: User) {
  const deposits = u.deposits || [];
  const firstDepositAt = deposits.length ? Math.min(...deposits.map((d) => d.at)) : null;
  return {
    free_credit: u.freeCredit ?? 0,
    principal: u.deposited ?? 0,
    profit: u.profit ?? 0,
    tier: u.tier && u.tier !== "none" ? u.tier : "none",
    deposit_at: firstDepositAt ? new Date(firstDepositAt).toISOString() : null,
    accrued_total: (u.profitHistory || []).reduce((s, h) => s + h.profit, 0),
    last_accrual_at: u.lastProfitDate ? new Date(u.lastProfitDate + "T00:00:00Z").toISOString() : null,
    daily_rate: u.dailyRate ?? 0,
  };
}

/** Mirror the JSON store's wallet numbers into Supabase (create-or-update). */
export async function syncWalletFromJson(supaUserId: string, u: User): Promise<WalletRow | null> {
  const values = walletValuesFromJsonUser(u);
  const { data } = await supabaseAdmin.from("wallets").select("id").eq("user_id", supaUserId).maybeSingle();
  if (data) {
    const { data: upd, error } = await supabaseAdmin.from("wallets").update(values).eq("id", data.id).select().single();
    if (error) {
      console.error("[wallet] sync update failed:", error.message);
      return null;
    }
    return upd as WalletRow;
  }
  const { data: ins, error } = await supabaseAdmin
    .from("wallets")
    .insert({ user_id: supaUserId, ...values })
    .select()
    .single();
  if (error) {
    console.error("[wallet] sync insert failed:", error.message);
    return null;
  }
  return ins as WalletRow;
}

/** Apply a delta to the authoritative Supabase wallet funds. */
export async function applyWalletDelta(
  wallet: WalletRow,
  delta: { profit?: number; accruedTotal?: number; principal?: number },
  touchAccrualAt = false
): Promise<WalletRow | null> {
  const patch: Record<string, unknown> = {};
  if (delta.profit !== undefined) patch.profit = Math.max(0, +(Number(wallet.profit) + delta.profit).toFixed(4));
  if (delta.accruedTotal !== undefined) patch.accrued_total = +(Number(wallet.accrued_total) + delta.accruedTotal).toFixed(4);
  if (delta.principal !== undefined) patch.principal = Math.max(0, +(Number(wallet.principal) + delta.principal).toFixed(2));
  if (touchAccrualAt) patch.last_accrual_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from("wallets").update(patch).eq("id", wallet.id).select().single();
  if (error) {
    console.error("[wallet] delta failed:", error.message);
    return null;
  }
  return data as WalletRow;
}

export const walletBalance = (w: WalletRow) =>
  +(Number(w.principal) + Number(w.free_credit) + Number(w.profit)).toFixed(2);
