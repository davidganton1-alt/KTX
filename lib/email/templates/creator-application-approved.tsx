import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, StatRow } from '../components';

interface Props { name: string; brandName: string; inviteLink: string }

// text: Your creator application is approved. You earn 5% of each referral's first deposit and 0.1% of their profit for life. Invite link: {link}
export function CreatorApplicationApprovedEmail({ name, brandName, inviteLink }: Props) {
  return (
    <BaseTemplate preview="Your creator application is approved">
      <Heading level={1}>You're approved, {name}!</Heading>
      <Text>
        Welcome to the KingdomTradeX creator network on behalf of <strong>{brandName}</strong>. Your creator
        dashboard is live, and your community can join through your personal invite link today.
      </Text>
      <Divider />
      <Heading level={3}>What you earn</Heading>
      <StatRow label="First-deposit bonus" value="5% — one time per member" tone="profit" />
      <StatRow label="Lifetime profit share" value="0.1% of their daily profit" tone="profit" />
      <StatRow label="Payouts" value="After 7-day hold, admin-reviewed" />
      <Text muted>You never see or touch member funds. Commissions come from platform revenue, not your community's principal.</Text>
      <Button href={inviteLink}>Open your invite link</Button>
      <Button href="https://kingdomtradex.com/creator" variant="secondary">Go to creator dashboard</Button>
    </BaseTemplate>
  );
}
