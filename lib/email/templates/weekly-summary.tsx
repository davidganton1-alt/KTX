import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, StatRow, usd } from '../components';

interface Props { name: string; weekProfit: number; lifetimeProfit: number; available: number; dailyRatePct: string; principal: number }

// text: Weekly summary: earned {weekProfit} this week, {lifetimeProfit} lifetime. Principal {principal}, available {available}.
export function WeeklySummaryEmail({ name, weekProfit, lifetimeProfit, available, dailyRatePct, principal }: Props) {
  return (
    <BaseTemplate preview={`Your week in review — +${usd(weekProfit)}`}>
      <Heading level={1}>Your week in review</Heading>
      <Text>Hi {name}, here's how your plan performed over the last 7 days.</Text>
      <Divider />
      <StatRow label="Earned this week" value={`+${usd(weekProfit)}`} tone="profit" />
      <StatRow label="Lifetime profit" value={usd(lifetimeProfit)} tone="profit" />
      <StatRow label="Available to withdraw" value={usd(available)} tone="warning" />
      <StatRow label="Principal" value={usd(principal)} />
      <StatRow label="Daily target" value={`${dailyRatePct} / day`} />
      <Text muted>
        Withdrawals are automatic and fee-free — but nothing is ever forced out of your principal. Stay steady.
      </Text>
      <Button href="https://kingdomtradex.com/console">Open my dashboard</Button>
    </BaseTemplate>
  );
}
