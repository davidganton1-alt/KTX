import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Divider, StatRow, usd } from '../components';

interface Props { name: string; amount: number; reviewBy: string }

// text: Referral withdrawal of {amount} requested. Admin review within 12-24h. Decision expected by {reviewBy}.
export function ReferralWithdrawalRequestedEmail({ name, amount, reviewBy }: Props) {
  return (
    <BaseTemplate preview="Referral withdrawal requested">
      <Heading level={1}>Payout request received</Heading>
      <Text>Hi {name}, your referral withdrawal request is in the review queue.</Text>
      <Divider />
      <StatRow label="Amount" value={usd(amount)} tone="warning" />
      <StatRow label="Decision expected by" value={reviewBy} />
      <Text muted>
        Referral withdrawals are reviewed within 12–24 hours after the 7-day hold clears. You'll receive an
        email as soon as the review is complete.
      </Text>
    </BaseTemplate>
  );
}
