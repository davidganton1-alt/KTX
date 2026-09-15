import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider } from '../components';

interface Props { name: string }

// text: You haven't signed the KingdomTradeX trading agreement yet. One quick step keeps your account compliant and active.
export function AgreementReminderEmail({ name }: Props) {
  return (
    <BaseTemplate preview="One quick step left on your account">
      <Heading level={1}>Trading agreement pending</Heading>
      <Text>Hi {name}, you joined KingdomTradeX a week ago but haven't signed your trading agreement yet.</Text>
      <Divider />
      <Text>
        Reviewing and signing it takes about a minute and keeps your account compliant and active. We built the
        agreement to be honest about what this is: AI-assisted trading with risk, guardrails, and no guarantees.
      </Text>
      <Button href="https://kingdomtradex.com/console">Review &amp; sign</Button>
      <Text muted>Questions about any clause? Just reply to this email — a real person reads these.</Text>
    </BaseTemplate>
  );
}
