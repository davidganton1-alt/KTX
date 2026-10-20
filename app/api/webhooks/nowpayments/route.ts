import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Phase S.1 RETIRED: legacy NOWPayments IPN webhook. The platform deposits
// exclusively through Plisio now (USDT TRC-20/BEP-20). This route shared the
// deposits.nowpayments_payment_id claim key with Plisio txn_ids, used stale
// tier rates (0.01/0.0075/0.005) that contradicted the accrual engine, and
// could write CHECK-violating statuses. If anyone still posts signed payloads
// with the old IPN secret, they now get a hard 410 instead of touching money.
// Original implementation preserved at this file's *.backup-phaseS1.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'This gateway has been retired. Deposits are processed via Plisio.' },
    { status: 410 }
  );
}

