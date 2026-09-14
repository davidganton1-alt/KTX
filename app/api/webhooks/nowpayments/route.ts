import { NextRequest, NextResponse } from 'next/server';
import { verifyIPNSignature } from '@/lib/nowpayments';
import { processDepositSplit } from '@/lib/walletService';
import { supabaseAdmin } from '@/lib/supabase';
import { db, type Tier } from '@/lib/store';
import { legacyIdFor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Valid payment statuses that indicate successful payment
const CONFIRMED_STATUSES = ['confirmed', 'sending', 'finished'];

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('x-nowpayments-sig');

    // Verify HMAC signature
    if (!verifyIPNSignature(body, signature || '')) {
      console.error('[nowpayments-webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { payment_id, payment_status, price_amount } = payload;

    console.log(`[nowpayments-webhook] Received: payment_id=${payment_id}, status=${payment_status}`);

    // Find the deposit record
    const { data: deposit, error: findError } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('nowpayments_payment_id', payment_id)
      .maybeSingle();

    if (findError || !deposit) {
      console.error(`[nowpayments-webhook] Deposit not found for payment_id: ${payment_id}`);
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    // If payment reached a confirmed state while we still have 'waiting',
    // CLAIM the deposit atomically (waiting -> processing_split via a
    // conditional update) so duplicate IPNs can never double-split. Any
    // other transition is a plain status update.
    const wantConfirm = CONFIRMED_STATUSES.includes(payment_status) && deposit.status === 'waiting';
    let claimed: { id: string } | null = null;
    if (wantConfirm) {
      const { data } = await supabaseAdmin
        .from('deposits')
        .update({ status: 'processing_split' })
        .eq('id', deposit.id)
        .eq('status', 'waiting')
        .select('id')
        .maybeSingle();
      claimed = data;
      if (!claimed && !['failed', 'expired'].includes(payment_status)) {
        // another IPN already won the claim (or it's processed); just refresh status
        await supabaseAdmin.from('deposits').update({ status: payment_status }).eq('id', deposit.id);
        return NextResponse.json({ ok: true, duplicate: true });
      }
    } else if (payment_status !== deposit.status) {
      // plain lifecycle update (confirming / partially_paid / failed / expired,
      // or a confirmed IPN arriving after the split was already done)
      await supabaseAdmin
        .from('deposits')
        .update({
          status: payment_status,
          confirmed_at: CONFIRMED_STATUSES.includes(payment_status) && !deposit.confirmed_at
            ? new Date().toISOString()
            : deposit.confirmed_at,
        })
        .eq('id', deposit.id);
    }

    if (claimed) {
      const payAmt = Number(price_amount) > 0 ? Number(price_amount) : Number(deposit.amount);
      const amount = payAmt;

      console.log(`[nowpayments-webhook] Processing deposit split for ${deposit.id}`);

      // Referral rate from the deposit's stored referrer profile
      let referralRate = 0;
      if (deposit.is_first_deposit && deposit.referred_by) {
        const { data: refProfile } = await supabaseAdmin
          .from('profiles')
          .select('is_pastor, role')
          .eq('id', deposit.referred_by)
          .maybeSingle();
        referralRate = refProfile?.is_pastor || refProfile?.role === 'admin' ? 5 : 2.5;
      }

      const split = await processDepositSplit(
        deposit.id,
        deposit.user_id,
        amount,
        referralRate,
        deposit.referred_by || undefined
      );

      await supabaseAdmin
        .from('deposits')
        .update({
          status: payment_status,
          confirmed_at: new Date().toISOString(),
          referral_commission: split.referralCommission,
          hot_wallet_amount: split.hotWalletAmount,
          engine_wallet_amount: split.engineWalletAmount,
        })
        .eq('id', deposit.id);

        // Mirror to the legacy JSON operational store
        const legacyUser = db.findById(legacyIdFor(deposit.user_id));
        if (legacyUser) {
          const newDeposited = (legacyUser.deposited || 0) + amount;
          let newTier: Tier;
          if (newDeposited >= 5000) newTier = 'ambassador';
          else if (newDeposited >= 1000) newTier = 'steward';
          else newTier = 'faithful';

          db.update(legacyUser.id, {
            deposited: newDeposited,
            tier: newTier,
            dailyRate: newTier === 'ambassador' ? 0.01 : newTier === 'steward' ? 0.0075 : 0.005,
            deposits: [...(legacyUser.deposits || []), {
              id: deposit.id,
              amount,
              at: Date.now(),
              tier: newTier,
            }],
          });

          // Supabase per-user wallet ledger is the record of truth for funds
          const { data: w } = await supabaseAdmin
            .from('wallets')
            .select('id, principal')
            .eq('user_id', deposit.user_id)
            .maybeSingle();
          if (w) {
            await supabaseAdmin
              .from('wallets')
              .update({ principal: +(Number(w.principal) + amount).toFixed(2), tier: newTier, updated_at: new Date().toISOString() })
              .eq('id', w.id);
          } else {
            await supabaseAdmin
              .from('wallets')
              .insert({ user_id: deposit.user_id, principal: amount, tier: newTier, free_credit: legacyUser.freeCredit || 0 });
          }
          await supabaseAdmin.from('transactions').insert({
            user_id: deposit.user_id,
            type: 'deposit',
            amount,
            status: 'completed',
            notes: `NOWPayments ${payment_id}`,
          });
        }

      console.log(`[nowpayments-webhook] Deposit processed: referral=$${split.referralCommission}, hot=$${split.hotWalletAmount}, engine=$${split.engineWalletAmount}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[nowpayments-webhook] Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
