import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, StatRow, usd } from '../components';

interface Props { name: string; amount: number; tier: string; date: string }

// text: Deposit confirmed. We received {amount} on {date}. Your {tier} plan is active and daily profit starts accruing.
export function DepositConfirmedEmail({ name, amount, tier, date }: Props) {
  return (
    <BaseTemplate preview={`Deposit confirmed — ${usd(amount)}`}>
      <Heading level={1}>Deposit confirmed</Heading>
      <Text>Hi {name}, your payment has been confirmed on the network and credited to your account. Your plan is now active.</Text>
      <Divider />
      <StatRow label="Amount received" value={usd(amount)} tone="profit" />
      <StatRow label="Plan tier" value={tier} tone="warning" />
      <StatRow label="Confirmed on" value={date} />
      <Text muted>
        Daily profit accrues at UTC midnight based on your tier rate and begins paying out automatically to your
        wallet. Track everything from your dashboard.
      </Text>
      <Button href="https://kingdomtradex.com/console">View my dashboard</Button>
    </BaseTemplate>
  );
}
