import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Divider, StatRow, usd } from '../components';

interface Props { name: string; net: number; network: string; when: string }

// text: Your principal withdrawal was approved. {net} is queued for payout to your {network} wallet. Expected {when}.
export function PrincipalWithdrawalApprovedEmail({ name, net, network, when }: Props) {
  return (
    <BaseTemplate preview={`Withdrawal approved — ${usd(net)} on the way`}>
      <Heading level={1}>Withdrawal approved</Heading>
      <Text>Hi {name}, your principal withdrawal has been approved and is queued for payout.</Text>
      <Divider />
      <StatRow label="Net payout" value={usd(net)} tone="profit" />
      <StatRow label="Destination" value={`${network} (USDT)`} />
      <StatRow label="Expected by" value={when} />
      <Text muted>
        Payouts settle after the treasury transfer completes. You'll receive a final confirmation email when the
        funds leave our wallet. Need help? Reply to this email any time.
      </Text>
    </BaseTemplate>
  );
}
