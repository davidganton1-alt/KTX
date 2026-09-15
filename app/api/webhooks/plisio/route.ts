import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/plisio';
import { processDepositSplit } from '@/lib/walletService';
import { supabaseAdmin } from '@/lib/supabase';
import { db, type Tier } from '@/lib/store';
import { legacyIdFor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Plisio invoice lifecycle -> our deposits.status domain (the column has a
// CHECK constraint; raw Plisio words like 'completed'/'paid' would violate it).
const STATUS_MAP: Record<string, string> = {
  new: 'waiting',
  partially_paid: 'partially_paid',
  confirming: 'confirming',
  unconfirmed: 'confirming',
  checking: 'confirming',
  paid: 'confirmed',
  exchange_required: 'confirming',
  exchanged: 'confirmed',
  converted: 'confirmed',
  accepted: 'confirmed',
  completed: 'finished',
  expired: 'expired',
  failed: 'failed',
};
// 'paid'..'completed' all mean funds landed for our purposes
const FUNDED = ['paid', 'accepted', 'exchanged', 'converted', 'completed'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify HMAC-SHA1 signature (v1 or v2 construction)
    if (!verifyWebhookSignature(body)) {
      console.error('[plisio-webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { txn_id, status, source_amount } = body as any;
    const mapped = STATUS_MAP[String(status)] || 'confirming';
    console.log(`[plisio-webhook] Received: txn_id=${txn_id}, status=${status} -> ${mapped}`);

    const { data: deposit, error: findError } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('nowpayments_payment_id', String(txn_id))
      .maybeSingle();

    if (findError || !deposit) {
      console.error(`[plisio-webhook] Deposit not found for txn_id: ${txn_id}`);
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const isFunded = FUNDED.includes(String(status));
    const wantConfirm = isFunded && deposit.status === 'waiting';
    let claimed: { id: string } | null = null;

    if (wantConfirm) {
      // atomic claim: waiting -> processing_split exactly once
      const { data } = await supabaseAdmin
        .from('deposits')
        .update({ status: 'processing_split' })
        .eq('id', deposit.id)
        .eq('status', 'waiting')
        .select('id')
        .maybeSingle();
      claimed = data;
      if (!claimed) {
        await supabaseAdmin.from('deposits').update({ status: mapped }).eq('id', deposit.id);
        return NextResponse.json({ ok: true, duplicate: true });
      }
    } else if (mapped !== deposit.status && deposit.status !== 'processing_split') {
      await supabaseAdmin
        .from('deposits')
        .update({
          status: mapped,
          confirmed_at: isFunded && !deposit.confirmed_at ? new Date().toISOString() : deposit.confirmed_at,
        })
        .eq('id', deposit.id);
    }

    if (claimed) {
      // USD value for the split: source_amount (what we priced) else deposit.amount.
      // NEVER the crypto `amount` (that is post-commission USDT quantity).
      const srcAmt = Number(source_amount);
      const amount = Number.isFinite(srcAmt) && srcAmt > 0 ? srcAmt : Number(deposit.amount);

      let referralRate = 0;
      if (deposit.is_first_deposit && deposit.referred_by) {
        const { data: refProfile } = await supabaseAdmin
          .from('profiles')
          .select('is_pastor, is_creator, role')
          .eq('id', deposit.referred_by)
          .maybeSingle();
        referralRate = refProfile?.is_pastor || refProfile?.is_creator || refProfile?.role === 'admin' ? 5 : 2.5;
      }

      const split = await processDepositSplit(
        deposit.id,
        deposit.user_id,
        amount,
        referralRate,
        deposit.referred_by || undefined
      );

      // Phase D: per-earning record with 7-day hold
      if (split.referralCommission > 0 && deposit.referred_by) {
        const hold = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
        const { error: reErr } = await supabaseAdmin.from('referral_earnings').insert({
          referrer_id: deposit.referred_by,
          source_user_id: deposit.user_id,
          earning_type: 'principal',
          amount: split.referralCommission,
          available_at: hold,
          source_deposit_id: deposit.id,
          notes: `${referralRate}% of first deposit (USD ${amount})`,
        });
        if (reErr) console.error('[plisio-webhook] referral_earnings insert failed:', reErr.message);
      }

      await supabaseAdmin
        .from('deposits')
        .update({
          status: mapped,
          confirmed_at: new Date().toISOString(),
          referral_commission: split.referralCommission,
          hot_wallet_amount: split.hotWalletAmount,
          engine_wallet_amount: split.engineWalletAmount,
        })
        .eq('id', deposit.id);

      // Fund the member's per-user wallet (record of truth for principal)
      const { data: w } = await supabaseAdmin
        .from('wallets')
        .select('id, principal')
        .eq('user_id', deposit.user_id)
        .maybeSingle();
      const newTotal = Number(w?.principal || 0) + amount;
      let newTier = 'faithful';
      if (newTotal >= 5000) newTier = 'ambassador';
      else if (newTotal >= 1000) newTier = 'steward';
      if (w) {
        await supabaseAdmin
          .from('wallets')
          .update({ principal: +newTotal.toFixed(2), tier: newTier, updated_at: new Date().toISOString() })
          .eq('id', w.id);
      } else {
        await supabaseAdmin
          .from('wallets')
          .insert({ user_id: deposit.user_id, principal: +newTotal.toFixed(2), tier: newTier });
      }
      await supabaseAdmin.from('transactions').insert({
        user_id: deposit.user_id,
        type: 'deposit',
        amount,
        status: 'completed',
        notes: `Plisio ${txn_id}`,
      });

      // JSON operational mirror
      const legacyUser = db.findById(legacyIdFor(deposit.user_id));
      if (legacyUser) {
        let tier: Tier;
        if (newTotal >= 5000) tier = 'ambassador';
        else if (newTotal >= 1000) tier = 'steward';
        else tier = 'faithful';
        db.update(legacyUser.id, {
          deposited: +newTotal.toFixed(2),
          tier,
          dailyRate: tier === 'ambassador' ? 0.0075 : tier === 'steward' ? 0.005 : 0.0025,
          deposits: [...(legacyUser.deposits || []), {
            id: deposit.id,
            amount,
            at: Date.now(),
            tier,
          }],
        });
      }

      console.log(`[plisio-webhook] Deposit processed: referral=$${split.referralCommission}, hot=$${split.hotWalletAmount}, engine=$${split.engineWalletAmount}`);

      // Phase G: deposit confirmed email (only when the split actually landed)
      try {
        const { emails } = await import('@/lib/email/service');
        const { getRecipient } = await import('@/lib/email/recipient');
        const recip = await getRecipient(deposit.user_id);
        if (recip) {
          emails.depositConfirmed(recip.email, {
            name: recip.name,
            amount,
            tier: newTier.charAt(0).toUpperCase() + newTier.slice(1),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          });
        }
      } catch (err: any) { console.error('[plisio-webhook] deposit email failed:', err.message); }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[plisio-webhook] Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
