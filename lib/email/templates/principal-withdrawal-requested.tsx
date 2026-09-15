import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Divider, StatRow, usd } from '../components';

interface Props { name: string; amount: number; net: number; feePct: number; reviewBy: string }

// text: Principal withdrawal of {amount} requested. Estimated net {net} ({feePct}% fee applies). Review within 12-24h by {reviewBy}.
export function PrincipalWithdrawalRequestedEmail({ name, amount, net, feePct, reviewBy }: Props) {
  return (
    <BaseTemplate preview="Principal withdrawal requested">
      <Heading level={1}>Withdrawal request received</Heading>
      <Text>Hi {name}, your principal withdrawal request is in the review queue. No action is needed from you.</Text>
      <Divider />
      <StatRow label="Requested" value={usd(amount)} />
      <StatRow label="Estimated net" value={usd(net)} tone={feePct > 0 ? 'warning' : 'profit'} />
      <StatRow label="Early exit fee" value={feePct > 0 ? `${feePct}% (inside holding period)` : 'None — holding period complete'} tone={feePct > 0 ? 'warning' : 'profit'} />
      <StatRow label="Decision expected by" value={reviewBy} />
      <Text muted>
        Principal withdrawals are reviewed within 12–24 hours. Your accrued profit is never affected by a
        principal request. You'll receive an email as soon as the review is complete.
      </Text>
    </BaseTemplate>
  );
}
