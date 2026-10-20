import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/plisio';
import { processDepositSplit } from '@/lib/walletService';
import { forwardEnginePortion } from '@/lib/engineForward';
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
    // Phase S.1: the invariant that defines 'fully credited' is the
    // engine_wallet_amount completion marker (written exactly once, only
    // after the entire credit sequence lands; engine share is always > 0 for
    // valid deposits). NULL + a funded gateway status means the row was
    // NEVER credited — regardless of which lifecycle status it currently
    // shows (the old dead-letters sit at 'confirmed'). expired/failed rows
    // are only resurrectable by an explicit admin replay (txn_id lookup).
    const notCredited = deposit.engine_wallet_amount == null;
    const isTerminal = !notCredited || ['expired', 'failed'].includes(String(deposit.status));
    const claimable = ['waiting', 'partially_paid', 'confirming'];
    const stuck = notCredited && !['expired', 'failed'].includes(String(deposit.status));
    const wantConfirm = isFunded && (claimable.includes(String(deposit.status)) || stuck);
    let claimed: { id: string } | null = null;

    if (wantConfirm) {
      // atomic claim: expected state -> processing_split exactly once
      let claimQ = supabaseAdmin
        .from('deposits')
        .update({ status: 'processing_split' })
        .eq('id', deposit.id);
      if (!claimable.includes(String(deposit.status))) {
        claimQ = claimQ.eq('status', deposit.status).is('engine_wallet_amount', null);
      } else {
        claimQ = claimQ.in('status', claimable);
      }
      const { data } = await claimQ.select('id').maybeSingle();
      claimed = data;
      if (!claimed) {
        // Lost the race or state advanced under us. Only a NON-terminal row
        // may move forward; terminal rows are left untouched.
        if (!isTerminal) {
          const { error: dupErr } = await supabaseAdmin
            .from('deposits').update({ status: mapped }).eq('id', deposit.id).eq('status', deposit.status).is('engine_wallet_amount', null);
          if (dupErr) console.error('[plisio-webhook] status update failed:', dupErr.message);
        }
        return NextResponse.json({ ok: true, duplicate: true });
      }
    } else if (!isTerminal && mapped !== deposit.status && deposit.status !== 'processing_split') {
      // Monotonic forward-only status update (guard re-checks current state).
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

      // Phase S.1: replay-safe credit ordering. Each step checks for its own
      // prior effect before writing, so a crash at ANY point can be recovered
      // by a later funded webhook re-claim (engine_wallet_amount stays NULL
      // until everything landed) with no double-credit anywhere.
      const { data: existingUserTx } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('user_id', deposit.user_id)
        .eq('type', 'deposit')
        .eq('notes', `Plisio ${txn_id}`)
        .maybeSingle();

      let newTotal = Number(deposit.amount || 0);
      let newTier = 'faithful';
      if (!existingUserTx) {
        // Fund the member's per-user wallet (record of truth for principal).
        // Compare-and-set with one retry so concurrent deposits for the same
        // user cannot lose an increment.
        const { data: w } = await supabaseAdmin
          .from('wallets')
          .select('id, principal')
          .eq('user_id', deposit.user_id)
          .maybeSingle();
        const base = Number(w?.principal || 0);
        newTotal = base + amount;
        newTier = newTotal >= 5000 ? 'ambassador' : newTotal >= 1000 ? 'steward' : 'faithful';
        if (w) {
          const { data: upd } = await supabaseAdmin
            .from('wallets')
            .update({ principal: +newTotal.toFixed(2), tier: newTier, updated_at: new Date().toISOString() })
            .eq('id', w.id)
            .eq('principal', base)
            .select('id');
          if (!upd || !upd.length) {
            const { data: again } = await supabaseAdmin.from('wallets').select('id, principal').eq('user_id', deposit.user_id).maybeSingle();
            const t2 = Number(again?.principal || 0) + amount;
            const n2 = t2 >= 5000 ? 'ambassador' : t2 >= 1000 ? 'steward' : 'faithful';
            const { error: e2 } = await supabaseAdmin
              .from('wallets')
              .update({ principal: +t2.toFixed(2), tier: n2, updated_at: new Date().toISOString() })
              .eq('id', again!.id);
            if (e2) throw new Error('wallet credit failed: ' + e2.message);
            newTotal = t2; newTier = n2;
          }
        } else {
          const { error: insErr } = await supabaseAdmin
            .from('wallets')
            .insert({ user_id: deposit.user_id, principal: +newTotal.toFixed(2), tier: newTier });
          if (insErr) throw new Error('wallet create failed: ' + insErr.message);
        }

        const { error: txErr } = await supabaseAdmin.from('transactions').insert({
          user_id: deposit.user_id,
          type: 'deposit',
          amount,
          status: 'completed',
          notes: `Plisio ${txn_id}`,
        });
        if (txErr) throw new Error('deposit transaction failed: ' + txErr.message);

        // JSON operational mirror
        const legacyUser = db.findById(legacyIdFor(deposit.user_id));
        if (legacyUser) {
          const tier: Tier = newTotal >= 5000 ? 'ambassador' : newTotal >= 1000 ? 'steward' : 'faithful';
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
      } else {
        // user credit already landed in a crashed run; recover totals for logs
        const { data: w } = await supabaseAdmin.from('wallets').select('principal, tier').eq('user_id', deposit.user_id).maybeSingle();
        newTotal = Number(w?.principal || 0);
        newTier = String(w?.tier || 'faithful');
      }

      // Platform split (hot 30% / engine 70% / referral wallet) — replay-safe
      const { data: existingSplitTx } = await supabaseAdmin
        .from('wallet_transactions')
        .select('id')
        .eq('related_deposit_id', deposit.id)
        .eq('transaction_type', 'deposit_split')
        .maybeSingle();
      let split = { referralCommission: 0, hotWalletAmount: 0, engineWalletAmount: 0 };
      if (!existingSplitTx) {
        split = await processDepositSplit(
          deposit.id,
          deposit.user_id,
          amount,
          referralRate,
          deposit.referred_by || undefined
        );
      } else {
        split = {
          referralCommission: Number(deposit.referral_commission || 0),
          hotWalletAmount: Number(deposit.hot_wallet_amount || 0),
          engineWalletAmount: Number(deposit.engine_wallet_amount || 0),
        };
      }

      // Phase D: per-earning record with 7-day hold (own replay guard)
      if (split.referralCommission > 0 && deposit.referred_by) {
        const { data: existingRe } = await supabaseAdmin
          .from('referral_earnings').select('id').eq('source_deposit_id', deposit.id).maybeSingle();
        if (!existingRe) {
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
          if (reErr) throw new Error('referral_earnings insert failed: ' + reErr.message);
        }
      }

      // COMPLETION MARKER — only now is the deposit considered fully credited.
      const { error: markErr } = await supabaseAdmin
        .from('deposits')
        .update({
          status: mapped,
          confirmed_at: deposit.confirmed_at || new Date().toISOString(),
          referral_commission: split.referralCommission,
          hot_wallet_amount: split.hotWalletAmount,
          engine_wallet_amount: split.engineWalletAmount,
        })
        .eq('id', deposit.id);
      if (markErr) throw new Error('deposit completion mark failed: ' + markErr.message);

      console.log(`[plisio-webhook] Deposit processed: referral=$${split.referralCommission}, hot=$${split.hotWalletAmount}, engine=$${split.engineWalletAmount}`);

      // Phase M.5: Instant Engine auto-forward (non-blocking for user crediting)
      try {
        const fwd = await forwardEnginePortion({
          depositId: deposit.id,
          currency: String(deposit.currency || ''),
          engineAmount: Number(split.engineWalletAmount),
        });
        console.log('[engineForward]', deposit.currency, split.engineWalletAmount, fwd.ok ? 'OK' : 'FAIL', fwd.error || fwd.txId || '');
        if (!fwd.ok && !fwd.skipped) {
          // Forward failed — the engine_transfers row (status='failed') is the
          // admin alert; Treasury shows it with a Retry button.
          console.error(`[engineForward] RETRY NEEDED for deposit ${deposit.id}: ${fwd.error}`);
        }
      } catch (e) {
        console.error('[engineForward] unexpected error', e);
      }

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
