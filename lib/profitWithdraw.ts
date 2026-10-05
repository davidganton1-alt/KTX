import { supabaseAdmin } from '@/lib/supabase';
import { creditWallet, debitWallet, getWalletBalance } from '@/lib/walletService';
import { isValidUSDTAddress } from '@/lib/plisio';
import { plisioWithdraw, plisioTickerFor } from '@/lib/plisioPayout';

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
  // Phase M.5: USDT payouts are TRC-20 / BEP-20 ONLY. erc20 is rejected at
  // request time (never reaches a gateway) so no chain-ambiguous send is possible.
  const validNetworks = ["trc20", "bep20"];
  const net = String(network || "trc20");
  if (!validNetworks.includes(net)) {
    return { ok: false, status: 400, error: "Invalid network (USDT payouts support trc20 or bep20 only)" };
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
  const ticker = plisioTickerFor(net)!;

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
    // Phase M.5: shared payout helper hard-validates network/address match
    // (TRC-20 must start T, BEP-20 must start 0x) before calling Plisio.
    const payout = await plisioWithdraw({ currency: ticker, toAddress: address.trim(), amount: amt });
    if (!payout.ok) throw new Error(payout.error || 'Payout failed');

    await supabaseAdmin
      .from("withdrawals")
      .update({
        nowpayments_payout_id: String(payout.txId || ""),
        status: "completed",
        completed_at: new Date().toISOString(),
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
      notes: `payout ${payout.txId || "?"} ${net}`,
    });

    // Phase G: profit withdrawal processed email (queued)
    try {
      const { emails } = await import("@/lib/email/service");
      const { getRecipient } = await import("@/lib/email/recipient");
      const recip = await getRecipient(sessionId);
      if (recip) {
        emails.profitWithdrawalProcessed(recip.email, {
          name: recip.name,
          amount: amt,
          network: net.toUpperCase(),
          txHash: payout.txId || undefined,
        });
      }
    } catch {}

    return {
      ok: true,
      data: {
        success: true,
        withdrawal_id: withdrawal.id,
        payout_id: payout.txId,
        amount: amt,
        network: net,
        address: address.trim(),
        firstWithdrawal,
      },
    };
  } catch (payoutError: any) {
    // NOTE: 5th arg is related_DEPOSIT_id (FK to deposits) — passing the
    // withdrawal id here violated wallet_transactions_related_deposit_id_fkey
    // and silently dropped the rollback audit row. Carry the withdrawal id in notes instead.
    await creditWallet("payout", amt, "withdrawal", sessionId, undefined, `ROLLBACK payout failed (withdrawal ${withdrawal.id}): ${payoutError.message}`.slice(0, 200));
    await supabaseAdmin.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
    return { ok: false, status: 502, error: "Payout creation failed: " + payoutError.message };
  }
}
