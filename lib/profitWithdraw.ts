import { supabaseAdmin } from '@/lib/supabase';
import { creditWallet, debitWallet, getWalletBalance } from '@/lib/walletService';
import { createWithdrawal, isValidUSDTAddress, usdtTicker } from '@/lib/plisio';

// Shared automatic profit-withdrawal core (Phase C.5).
// Used by /api/profit/withdraw and (with address) the legacy /api/wallet/withdraw.
export async function processProfitWithdrawal(
  sessionId: string,
  amount: number,
  network: string,
  address: string
): Promise<{ ok: true; data: any } | { ok: false; status: number; error: string }> {
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return { ok: false, status: 400, error: "Invalid amount" };
  }
  if (!address || typeof address !== "string" || !address.trim()) {
    return { ok: false, status: 400, error: "Address required" };
  }
  const validNetworks = ["trc20", "bep20", "erc20"];
  const net = String(network || "trc20");
  if (!validNetworks.includes(net)) {
    return { ok: false, status: 400, error: "Invalid network (must be trc20, bep20, or erc20)" };
  }
  const coin = "usdt" + net;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("accumulated_profit, total_profit_withdrawn")
    .eq("id", sessionId)
    .single();

  if (profileError || !profile) {
    return { ok: false, status: 404, error: "Profile not found" };
  }

  const availableProfit = +(Number(profile.accumulated_profit || 0) - Number(profile.total_profit_withdrawn || 0)).toFixed(4);
  if (availableProfit < amt) {
    return { ok: false, status: 400, error: `Insufficient profit. Available: $${availableProfit.toFixed(2)}` };
  }

  const payoutBalance = await getWalletBalance("payout");
  if (payoutBalance < amt) {
    return { ok: false, status: 503, error: "Payout wallet temporarily low. Please try again later." };
  }

  // Local address validation (Plisio has no validate-address endpoint and
  // its payouts need no IP whitelist).
  if (!isValidUSDTAddress(address.trim(), net)) {
    return { ok: false, status: 400, error: `Invalid ${net.toUpperCase()} USDT address format` };
  }
  const ticker = usdtTicker(net as 'trc20' | 'bep20' | 'erc20');

  const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
    .from("withdrawals")
    .insert({
      user_id: sessionId,
      wallet_source: "payout",
      withdrawal_type: "profit",
      amount: amt,
      network_fee: 0,
      net_amount: amt,
      currency: ticker,
      network: net,
      destination_address: address.trim(),
      status: "processing",
    })
    .select()
    .single();

  if (withdrawalError || !withdrawal) {
    return { ok: false, status: 500, error: "Failed to create withdrawal record" };
  }

  const debitSuccess = await debitWallet("payout", amt, "withdrawal", sessionId, withdrawal.id, "Profit withdrawal");
  if (!debitSuccess) {
    await supabaseAdmin.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
    return { ok: false, status: 503, error: "Payout wallet funds moved, please retry." };
  }

  try {
    // NOTE: Plisio withdraws in the COIN unit (USDT quantity), not USD;
    // with USDT we pass the USD figure 1:1 (fee deducted by Plisio on top).
    const payout = await createWithdrawal({
      currency: ticker,
      to: address.trim(),
      amount: amt,
    });
    const done = payout?.status === "finished" || payout?.status === "confirming";

    await supabaseAdmin
      .from("withdrawals")
      .update({
        nowpayments_payout_id: String(payout.id || payout.txn_id || ""),
        status: done ? "completed" : "processing",
        completed_at: payout?.status === "finished" ? new Date().toISOString() : null,
      })
      .eq("id", withdrawal.id);

    await supabaseAdmin
      .from("profiles")
      .update({ total_profit_withdrawn: Number(profile.total_profit_withdrawn || 0) + amt })
      .eq("id", sessionId);

    let firstWithdrawal = false;
    try {
      const { legacyIdFor } = await import("@/lib/auth");
      const { db } = await import("@/lib/store");
      const lid = legacyIdFor(sessionId);
      const ju = db.findById(lid);
      firstWithdrawal = !!(ju && !ju.hasSharedFirstWithdrawal);
      if (firstWithdrawal) db.update(lid, { hasSharedFirstWithdrawal: true });
      db.notify(lid, `Withdrawal of $${amt.toFixed(2)} is on its way (${net.toUpperCase()}).`, "withdrawal");
    } catch {}

    // mirror the withdrawal + consumed profit onto the user's per-user ledger
    await supabaseAdmin.from("transactions").insert({
      user_id: sessionId,
      type: "withdrawal",
      amount: amt,
      status: "completed",
      notes: `payout ${payout.id || payout.txn_id || "?"} ${net}`,
    });

    return {
      ok: true,
      data: {
        success: true,
        withdrawal_id: withdrawal.id,
        payout_id: payout.id || payout.txn_id,
        amount: amt,
        network: net,
        address: address.trim(),
        firstWithdrawal,
      },
    };
  } catch (payoutError: any) {
    await creditWallet("payout", amt, "withdrawal", sessionId, withdrawal.id, `ROLLBACK payout failed: ${payoutError.message}`.slice(0, 200));
    await supabaseAdmin.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
    return { ok: false, status: 502, error: "Payout creation failed: " + payoutError.message };
  }
}
