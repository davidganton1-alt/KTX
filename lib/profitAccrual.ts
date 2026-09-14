import { supabaseAdmin } from '@/lib/supabase';
import { creditWallet } from '@/lib/walletService';
import { accruePastorShare } from '@/lib/pastorAccrual';
import { legacyIdFor } from '@/lib/auth';
import { db } from '@/lib/store';

export interface AccrualResult {
  userId: string;
  principal: number;
  platformCredit: number;
  totalBase: number;
  tier: string;
  rate: number;
  profitEarned: number;
  success: boolean;
  error?: string;
}

// Phase C tier rates (per spec: 0.25 / 0.50 / 0.75 % daily).
// NOTE: differs from the legacy JSON engine (0.5/0.75/1.0) — both run in
// parallel during the transition; this ledger is the Supabase record of truth.
export const TIER_RATES: Record<string, number> = {
  faithful: 0.0025,
  steward: 0.005,
  ambassador: 0.0075,
};

function dayOf(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Accrue daily profit for a single user (idempotent per UTC day).
export async function accrueUserProfit(userId: string): Promise<AccrualResult> {
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, accumulated_profit, last_profit_accrual_at, platform_credit, total_profit_withdrawn')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return { userId, principal: 0, platformCredit: 0, totalBase: 0, tier: '', rate: 0, profitEarned: 0, success: false, error: 'Profile not found' };
    }

    // wallets is 1:N from profiles — fetch explicitly (no FK embed needed)
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('principal, tier')
      .eq('user_id', userId)
      .maybeSingle();

    const now = new Date();
    const today = dayOf(now);
    const last = profile.last_profit_accrual_at ? dayOf(new Date(profile.last_profit_accrual_at)) : null;
    if (last === today) {
      return { userId, principal: 0, platformCredit: 0, totalBase: 0, tier: '', rate: 0, profitEarned: 0, success: true, error: 'Already accrued today' };
    }

    const principal = Number(wallet?.principal || 0);
    const platformCredit = Number(profile.platform_credit || 0);
    const totalBase = principal + platformCredit;
    const tier = String(wallet?.tier || '').replace(/^"|"$/g, '') || '';
    const rate = TIER_RATES[tier] || 0;

    if (totalBase <= 0 || rate === 0) {
      // stamp the day anyway so empty accounts don't retry all day
      await supabaseAdmin
        .from('profiles')
        .update({ last_profit_accrual_at: now.toISOString() })
        .eq('id', userId);
      return { userId, principal, platformCredit, totalBase, tier, rate, profitEarned: 0, success: true };
    }

    const profitEarned = +(totalBase * rate).toFixed(4);

    // Idempotent claim: the update only lands if the day is unclaimed.
    const todayStart = today + 'T00:00:00.000Z';
    const { data: claimed } = await supabaseAdmin
      .from('profiles')
      .update({
        accumulated_profit: Number(profile.accumulated_profit || 0) + profitEarned,
        last_profit_accrual_at: now.toISOString(),
      })
      .eq('id', userId)
      .or(`last_profit_accrual_at.is.null,last_profit_accrual_at.lt.${todayStart}`)
      .select('id');
    if (!claimed || !claimed.length) {
      return { userId, principal, platformCredit, totalBase, tier, rate, profitEarned: 0, success: true, error: 'Already accrued today' };
    }

    // Fund trail: the payout wallet is the source users withdraw from.
    const payoutSuccess = await creditWallet('payout', profitEarned, 'profit_accrual', userId, undefined, `Daily profit ${tier} ${(rate * 100).toFixed(2)}%`);
    if (!payoutSuccess) {
      console.error(`[profitAccrual] Failed to credit payout wallet for user ${userId}`);
    }

    // Audit: a completed 'profit' transaction on the user's ledger
    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      type: 'profit',
      amount: profitEarned,
      status: 'completed',
      notes: 'Phase C daily accrual',
    });

    // Pastors earn their share of Phase-C profit too (mirrors legacy engine).
    try {
      const jsonId = legacyIdFor(userId);
      const ju = db.findById(jsonId);
      if (ju && ju.referredBy) {
        await accruePastorShare(jsonId, profitEarned);
      }
    } catch {}

    return { userId, principal, platformCredit, totalBase, tier, rate, profitEarned, success: true };
  } catch (e: any) {
    return { userId, principal: 0, platformCredit: 0, totalBase: 0, tier: '', rate: 0, profitEarned: 0, success: false, error: e.message };
  }
}

// Accrue profit for ALL funded users (called by cron or admin trigger).
export async function accrueAllUsersProfit(): Promise<{ processed: number; succeeded: number; failed: number; errors: string[] }> {
  try {
    const { data: wallets, error } = await supabaseAdmin
      .from('wallets')
      .select('user_id')
      .gt('principal', 0);

    if (error || !wallets) {
      return { processed: 0, succeeded: 0, failed: 0, errors: [error?.message || 'Failed to fetch users'] };
    }

    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const wRow of wallets) {
      const result = await accrueUserProfit(wRow.user_id);
      if (result.success) succeeded++;
      else {
        failed++;
        if (result.error) errors.push(`${wRow.user_id}: ${result.error}`);
      }
    }

    return { processed: wallets.length, succeeded, failed, errors: errors.slice(0, 10) };
  } catch (e: any) {
    return { processed: 0, succeeded: 0, failed: 0, errors: [e.message] };
  }
}
