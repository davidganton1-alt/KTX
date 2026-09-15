import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, StatRow, usd } from '../components';

interface Props { name: string; amount: number; approved: boolean; reason?: string; network?: string }

// text: Your referral withdrawal of {amount} was {approved|declined}. {detail}
export function ReferralWithdrawalDecisionEmail({ name, amount, approved, reason, network }: Props) {
  return (
    <BaseTemplate preview={approved ? 'Referral withdrawal approved' : 'Referral withdrawal update'}>
      <Heading level={1}>{approved ? 'Payout approved' : 'Payout request declined'}</Heading>
      {approved ? (
        <Text>Hi {name}, your referral withdrawal has been approved and sent to your {network || 'TRC20'} (USDT) wallet.</Text>
      ) : (
        <Text>Hi {name}, we could not approve your referral withdrawal at this time. The amount has been returned to your available referral balance.</Text>
      )}
      <Divider />
      <StatRow label="Amount" value={usd(amount)} tone={approved ? 'profit' : 'default'} />
      {approved ? <StatRow label="Destination" value={`${(network || 'trc20').toUpperCase()} (USDT)`} /> : <StatRow label="Returned to balance" value={usd(amount)} tone="profit" />}
      {reason ? <Text muted><strong>Reason:</strong> {reason}</Text> : null}
      <Button href="https://kingdomtradex.com/console" variant="secondary">View referral earnings</Button>
    </BaseTemplate>
  );
}
