import { NextRequest, NextResponse } from 'next/server';
import { getSession, legacyIdFor, supabaseIdFor } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createInvoice } from '@/lib/plisio';
import { db } from '@/lib/store';
import { pastorsDb } from '@/lib/pastorStore';

export const dynamic = 'force-dynamic';

// Minimum deposit amounts per tier
const TIER_LIMITS: Record<string, { min: number; max: number }> = {
  faithful: { min: 100, max: 999 },
  steward: { min: 1000, max: 4999 },
  ambassador: { min: 5000, max: 15000 },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { amount } = await req.json();

    // Validate amount
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Check tier limits
    if (amt > 15000) {
      return NextResponse.json({ error: 'Maximum deposit is $15,000' }, { status: 400 });
    }

    // Determine tier from amount
    let depositTier: string;
    if (amt >= 5000) {
      depositTier = 'ambassador';
    } else if (amt >= 1000) {
      depositTier = 'steward';
    } else if (amt >= 100) {
      depositTier = 'faithful';
    } else {
      return NextResponse.json({ error: 'Minimum deposit is $100' }, { status: 400 });
    }

    // Get user's referral info (JSON is the operational mirror)
    const jsonId = legacyIdFor(session.id);
    const user = db.findById(jsonId);
    const isFirstDeposit = !user?.deposits || user.deposits.length === 0;

    // Resolve the referrer's Supabase profile uuid:
    //  - pastor referral: users.referredBy is a PASTOR RECORD id (pastors.json),
    //    so resolve via the pastor's email -> profile
    //  - member referral: memberReferredBy is a login-user JSON id -> direct map
    let referredBySupa: string | null = null;
    let referralRate = 0;
    if (isFirstDeposit) {
      if (user?.memberReferredBy) {
        referredBySupa = supabaseIdFor(user.memberReferredBy);
        referralRate = 2.5; // regular user
      } else if (user?.referredBy) {
        const pastor = pastorsDb.findById(user.referredBy);
        if (pastor) {
          const { data: prof } = await supabaseAdmin
            .from('profiles')
            .select('id, is_pastor')
            .ilike('email', pastor.email)
            .maybeSingle();
          if (prof) {
            referredBySupa = prof.id;
            referralRate = prof.is_pastor ? 5 : 2.5;
          }
        }
      }
      // self-referral guard
      if (referredBySupa === session.id) {
        referredBySupa = null;
        referralRate = 0;
      }
    }

    // Create Plisio invoice (USD priced, USDT paid; Plisio picks the network
    // from the paid currency ticker, e.g. USDTTRX for TRC20).
    const orderNumber = `KTX-${session.id.slice(0, 8)}-${Date.now()}`;
    const payment = await createInvoice({
      source_currency: 'USD',
      source_amount: amt,
      order_number: orderNumber,
      order_name: `KingdomTradeX ${depositTier} deposit`,
      currency: 'USDT_TRX', // TRC-20 (Plisio plain 'USDT' = ERC-20!)
      callback_url: process.env.PLISIO_CALLBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/webhooks/plisio?json=true`,
    });

    // Store deposit record
    const { data: deposit, error: depositError } = await supabaseAdmin
      .from('deposits')
      .insert({
        user_id: session.id,
        nowpayments_payment_id: payment.txn_id, // txn_id reused as gateway id column
        amount: amt,
        pay_amount: payment.amount ? Number(payment.amount) : null,
        currency: payment.currency || 'USDT',
        status: 'waiting',
        deposit_address: payment.wallet_hash || payment.invoice_url,
        tier_at_deposit: depositTier,
        referred_by: referredBySupa,
        is_first_deposit: isFirstDeposit,
      })
      .select()
      .single();

    if (depositError) {
      console.error('[deposit] Failed to create deposit record:', depositError.message);
      return NextResponse.json({ error: 'Failed to create deposit record' }, { status: 500 });
    }

    return NextResponse.json({
      deposit_id: deposit.id,
      payment_id: payment.txn_id,
      deposit_address: payment.wallet_hash || '',
      invoice_url: payment.invoice_url || '',
      qr_code: payment.qr_code || null,
      pay_amount: payment.amount ? Number(payment.amount) : null,
      amount: amt,
      currency: payment.currency || 'USDT',
      tier: depositTier,
      referral_rate: referralRate,
      is_first_deposit: isFirstDeposit,
      status: 'waiting',
    });
  } catch (e: any) {
    console.error('[deposit] Error:', e.message);
    // Upstream API failure (bad key, quota) is a bad-gateway condition,
    // not our own crash.
    const msg = e.message || 'Deposit creation failed';
    const upstream = /Plisio|Unauthorized|invalid credentials|HTTP /.test(msg);
    return NextResponse.json({ error: msg }, { status: upstream ? 502 : 500 });
  }
}
