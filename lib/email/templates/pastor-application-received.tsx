import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Divider, StatRow } from '../components';

interface Props { name: string; ministryName: string }

// text: {name}, we received your pastor application for {ministryName}. Our team reviews ministry credentials within 48 hours.
export function PastorApplicationReceivedEmail({ name, ministryName }: Props) {
  return (
    <BaseTemplate preview="Pastor application received">
      <Heading level={1}>Application received</Heading>
      <Text>Hi {name}, thank you for applying to serve with KingdomTradeX as a pastor. We've received your credentials and will review them shortly.</Text>
      <Divider />
      <StatRow label="Ministry" value={ministryName || '—'} />
      <StatRow label="Status" value="Under review" tone="warning" />
      <StatRow label="Review window" value="Within 48 hours" />
      <Text muted>You'll receive an email the moment the decision is made. No action is needed from you right now.</Text>
    </BaseTemplate>
  );
}
