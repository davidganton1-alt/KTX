import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, StatRow, usd } from '../components';

interface Props { name: string; amount: number; network: string; txHash?: string }

// text: Profit withdrawal of {amount} processed to your {network} wallet. Tx: {txHash}
export function ProfitWithdrawalProcessedEmail({ name, amount, network, txHash }: Props) {
  return (
    <BaseTemplate preview={`Profit withdrawal sent — ${usd(amount)}`}>
      <Heading level={1}>Your profit is on the way</Heading>
      <Text>Hi {name}, your profit withdrawal has been processed and sent to your wallet.</Text>
      <Divider />
      <StatRow label="Amount" value={usd(amount)} tone="profit" />
      <StatRow label="Network" value={`${network} (USDT)`} />
      {txHash ? <StatRow label="Transaction" value={txHash.length > 22 ? txHash.slice(0, 10) + '…' + txHash.slice(-8) : txHash} /> : null}
      <Text muted>You can track this payout on {network.toUpperCase()} with the transaction hash above.</Text>
      <Button href="https://kingdomtradex.com/console" variant="secondary">View earnings history</Button>
    </BaseTemplate>
  );
}
