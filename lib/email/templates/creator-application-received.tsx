import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Divider, StatRow } from '../components';

interface Props { name: string; platform: string; handle: string }

// text: Hi {name}, we received your creator application ({platform} {handle}). Our team reviews applications within 2-3 business days.
export function CreatorApplicationReceivedEmail({ name, platform, handle }: Props) {
  return (
    <BaseTemplate preview="Creator application received">
      <Heading level={1}>Application received</Heading>
      <Text>Hi {name}, thank you for applying to partner with KingdomTradeX as a creator. Our team is reviewing your submission and will respond within 2–3 business days.</Text>
      <Divider />
      <StatRow label="Platform" value={platform} />
      <StatRow label="Handle" value={handle} />
      <StatRow label="Status" value="Under review" tone="warning" />
      <Text muted>You'll receive another email the moment a decision is made. No action is needed from you right now.</Text>
    </BaseTemplate>
  );
}
