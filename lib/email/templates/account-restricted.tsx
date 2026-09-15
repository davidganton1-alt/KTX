import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, InfoBox } from '../components';

interface Props { name: string; reason: string }

// ops: account restricted notice — withdrawals paused, profit continues
export function AccountRestrictedEmail({ name, reason }: Props) {
  return (
    <BaseTemplate preview="Your account is under security review">
      <Heading level={1}>Account temporarily restricted</Heading>
      <Text>Hi {name}, as a precaution your KingdomTradeX account has been temporarily restricted while our team completes a security review.</Text>
      <Divider />
      <InfoBox>
        <Text><strong>What this means right now</strong></Text>
        <Text muted>Withdrawals are paused while the review is open.</Text>
        <Text muted><strong>Your daily profit continues to accrue as normal.</strong> Nothing you've earned is lost, and your principal is unchanged.</Text>
      </InfoBox>
      <Text muted><strong>Reason on file:</strong> {reason}</Text>
      <Text>Most reviews close within 1–3 business days. You'll receive an email the moment your account is restored — and you can always reach us below.</Text>
      <Button href="mailto:support@kingdomtradex.com" variant="secondary">Contact support</Button>
    </BaseTemplate>
  );
}
