import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, InfoBox, usd } from '../components';

interface Props { name: string; tier: string; platformCredit: number }

// text: Welcome to KingdomTradeX, {name}! Your {tier} account is live with {credit} platform credit. Deposit to activate your plan.
export function WelcomeEmail({ name, tier, platformCredit }: Props) {
  return (
    <BaseTemplate preview={`Welcome to KingdomTradeX, ${name}`}>
      <Heading level={1}>Welcome to KingdomTradeX, {name}!</Heading>
      <Text>
        Your account has been created successfully. You're starting as a <strong>{tier}</strong> member
        with {usd(platformCredit)} in platform credit that already earns daily profit.
      </Text>
      <Divider />
      <Heading level={3}>Getting started</Heading>
      <Text>
        Make your first deposit to activate your plan. Your platform credit earns alongside your principal
        from day one — daily profit pays out automatically to your crypto wallet.
      </Text>
      <Button href="https://kingdomtradex.com/console">Make Your First Deposit</Button>
      <Text muted>Need help? Reply to this email or visit our support center.</Text>
    </BaseTemplate>
  );
}
