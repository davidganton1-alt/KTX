import { supabaseAdmin } from '@/lib/supabase';

export type WalletType = 'deposit' | 'hot' | 'engine' | 'payout' | 'referral';

export interface WalletRow {
  id: string;
  wallet_type: WalletType;
  balance: number;
  currency: string;
  total_received: number;
  total_sent: number;
  last_transaction_at: string | null;
}

// Platform treasury buckets (Phase A). NOTE: table is public.platform_wallets
// — public.wallets is already taken by the per-USER funds ledger (Prompt 2).
// Balance math uses PostgREST atomic .increment() so concurrent webhook calls
// can't lose updates (the prompt sketch's read-then-write was race-prone).

// Get wallet balance by type
export async function getWalletBalance(walletType: WalletType): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('platform_wallets')
    .select('balance')
    .eq('wallet_type', walletType)
    .single();

  if (error) {
    console.error(`[walletService] Failed to get ${walletType} balance:`, error.message);
    return 0;
  }

  return Number(data.balance || 0);
}

// Get all wallet balances
export async function getAllWallets(): Promise<WalletRow[]> {
  const { data, error } = await supabaseAdmin
    .from('platform_wallets')
    .select('*')
    .order('wallet_type');

  if (error) {
    console.error('[walletService] Failed to get wallets:', error.message);
    return [];
  }

  return (data || []) as WalletRow[];
}

// Credit a wallet (increase balance)
export async function creditWallet(
  walletType: WalletType,
  amount: number,
  transactionType: string,
  relatedUserId?: string,
  relatedDepositId?: string,
  notes?: string
): Promise<boolean> {
  try {
    if (!(amount > 0)) return false;
    // Atomic SQL-side delta (platform_wallet_delta RPC; the installed
    // supabase-js has no increment/decrement builder).
    const { error: deltaError } = await supabaseAdmin.rpc('platform_wallet_delta', {
      p_wallet_type: walletType,
      p_balance_delta: amount,
      p_received_delta: amount,
      p_sent_delta: 0,
      p_require_sufficient: false,
    });
    if (deltaError) {
      console.error(`[walletService] Failed to credit ${walletType}:`, deltaError.message);
      return false;
    }

    const { error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        from_wallet: 'external',
        to_wallet: walletType,
        amount,
        currency: 'usdt',
        transaction_type: transactionType,
        related_user_id: relatedUserId || null,
        related_deposit_id: relatedDepositId || null,
        notes: notes || null,
      });

    if (txError) {
      console.error('[walletService] Failed to record transaction:', txError.message);
    }

    return true;
  } catch (e: any) {
    console.error(`[walletService] creditWallet error:`, e.message);
    return false;
  }
}

// Debit a wallet (decrease balance; guarded atomically against overdraft)
export async function debitWallet(
  walletType: WalletType,
  amount: number,
  transactionType: string,
  relatedUserId?: string,
  relatedWithdrawalId?: string,
  notes?: string
): Promise<boolean> {
  try {
    if (!(amount > 0)) return false;
    // Atomic guard: the RPC rejects the debit unless balance - amount >= 0.
    const { error: deltaError } = await supabaseAdmin.rpc('platform_wallet_delta', {
      p_wallet_type: walletType,
      p_balance_delta: -amount,
      p_received_delta: 0,
      p_sent_delta: amount,
      p_require_sufficient: true,
    });
    if (deltaError) {
      console.error(`[walletService] Failed to debit ${walletType}:`, deltaError.message);
      return false;
    }

    const { error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        from_wallet: walletType,
        to_wallet: 'external',
        amount,
        currency: 'usdt',
        transaction_type: transactionType,
        related_user_id: relatedUserId || null,
        related_withdrawal_id: relatedWithdrawalId || null,
        notes: notes || null,
      });

    if (txError) {
      console.error('[walletService] Failed to record transaction:', txError.message);
    }

    return true;
  } catch (e: any) {
    console.error(`[walletService] debitWallet error:`, e.message);
    return false;
  }
}

// Transfer between internal wallets (single audit row, atomic both sides)
export async function transferBetweenWallets(
  fromWallet: WalletType,
  toWallet: WalletType,
  amount: number,
  transactionType: string,
  notes?: string
): Promise<boolean> {
  try {
    if (!(amount > 0)) return false;
    const [from, to] = await Promise.all([
      supabaseAdmin.from('platform_wallets').select('id, balance').eq('wallet_type', fromWallet).single(),
      supabaseAdmin.from('platform_wallets').select('id').eq('wallet_type', toWallet).single(),
    ]);
    if (from.error || to.error) return false;

    const dec = await supabaseAdmin.rpc('platform_wallet_delta', {
      p_wallet_type: fromWallet,
      p_balance_delta: -amount,
      p_received_delta: 0,
      p_sent_delta: amount,
      p_require_sufficient: true,
    });
    if (dec.error) {
      console.error('[walletService] transfer debit failed:', dec.error.message);
      return false;
    }
    const inc = await supabaseAdmin.rpc('platform_wallet_delta', {
      p_wallet_type: toWallet,
      p_balance_delta: amount,
      p_received_delta: amount,
      p_sent_delta: 0,
      p_require_sufficient: false,
    });
    if (inc.error) {
      // roll the debit back
      await supabaseAdmin.rpc('platform_wallet_delta', {
        p_wallet_type: fromWallet,
        p_balance_delta: amount,
        p_received_delta: 0,
        p_sent_delta: -amount,
        p_require_sufficient: false,
      });
      console.error('[walletService] transfer credit failed, rolled back debit');
      return false;
    }

    await supabaseAdmin.from('wallet_transactions').insert({
      from_wallet: fromWallet,
      to_wallet: toWallet,
      amount,
      currency: 'usdt',
      transaction_type: transactionType,
      notes: notes || null,
    });
    return true;
  } catch (e: any) {
    console.error(`[walletService] transferBetweenWallets error:`, e.message);
    return false;
  }
}

// Process deposit split (the core 30/70 logic)
export async function processDepositSplit(
  depositId: string,
  userId: string,
  amount: number,
  referralRate: number,
  referredById?: string
): Promise<{
  referralCommission: number;
  hotWalletAmount: number;
  engineWalletAmount: number;
}> {
  // Calculate referral commission (only on first deposit — caller passes 0 otherwise)
  const referralCommission = +(amount * (referralRate / 100)).toFixed(2);
  const remainingAfterReferral = +(amount - referralCommission).toFixed(2);

  // Calculate 30/70 split
  const hotWalletAmount = +(remainingAfterReferral * 0.3).toFixed(2);
  const engineWalletAmount = +(remainingAfterReferral - hotWalletAmount).toFixed(2); // exact remainder, no penny drift

  // Credit referral wallet (if there's a referrer)
  if (referralCommission > 0 && referredById) {
    await creditWallet('referral', referralCommission, 'referral_credit', referredById, depositId, `Principal referral ${referralRate}% from deposit ${depositId}`);
  }

  // Credit hot wallet (30%)
  await creditWallet('hot', hotWalletAmount, 'deposit_split', userId, depositId, `30% of deposit ${depositId}`);

  // Credit engine wallet (70%) — tracked only, actual transfer is manual
  await creditWallet('engine', engineWalletAmount, 'deposit_split', userId, depositId, `70% of deposit ${depositId} (XMR)`);

  return {
    referralCommission,
    hotWalletAmount,
    engineWalletAmount,
  };
}
