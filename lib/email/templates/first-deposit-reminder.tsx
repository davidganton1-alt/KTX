import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, StatRow, usd } from '../components';

interface Props { name: string; platformCredit: number }

// retention: first-deposit reminder for accounts with credit but no deposit
export function FirstDepositReminderEmail({ name, platformCredit }: Props) {
  return (
    <BaseTemplate preview={`Your ${usd(platformCredit)} credit is waiting`}>
      <Heading level={1}>Your credit is waiting, {name}</Heading>
      <Text>You signed up a while ago and your platform credit is sitting ready — but your plan isn't active yet because there's no deposit on the account.</Text>
      <Divider />
      <StatRow label="Platform credit" value={usd(platformCredit)} tone="warning" />
      <Text muted>
        The credit earns daily profit from day one — but like a matching gift, it works alongside a real deposit,
        not on its own. Fund any amount from $100 (Faithful tier) to activate your plan and start accruing.
      </Text>
      <Button href="https://kingdomtradex.com/console">Activate my plan</Button>
      <Text muted>Not the right time? No pressure — the offer stands, and you can deposit whenever you're ready. Questions: reply to this email.</Text>
    </BaseTemplate>
  );
}
