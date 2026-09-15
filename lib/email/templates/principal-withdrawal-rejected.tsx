import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, StatRow, usd } from '../components';

interface Props { name: string; amount: number; reason?: string }

// text: Your principal withdrawal of {amount} was declined. The full amount has been returned to your account. {reason}
export function PrincipalWithdrawalRejectedEmail({ name, amount, reason }: Props) {
  return (
    <BaseTemplate preview="Update on your withdrawal request">
      <Heading level={1}>Withdrawal request declined</Heading>
      <Text>Hi {name}, we were unable to process your principal withdrawal at this time. <strong>Your full principal has been returned to your account and continues to earn daily profit.</strong></Text>
      <Divider />
      <StatRow label="Requested" value={usd(amount)} />
      <StatRow label="Returned to account" value={usd(amount)} tone="profit" />
      {reason ? <Text muted><strong>Reason:</strong> {reason}</Text> : null}
      <Text muted>
        You're welcome to request again after your holding period ends — after the hold, 100% of your principal
        returns with no fee.
      </Text>
      <Button href="https://kingdomtradex.com/console" variant="secondary">View my account</Button>
    </BaseTemplate>
  );
}
