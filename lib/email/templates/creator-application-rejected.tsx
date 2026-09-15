import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider } from '../components';

interface Props { name: string; reason?: string }

// text: Hi {name}, after careful review we're unable to approve your creator application at this time. {reason} You're welcome to reapply.
export function CreatorApplicationRejectedEmail({ name, reason }: Props) {
  return (
    <BaseTemplate preview="Update on your creator application">
      <Heading level={1}>About your application</Heading>
      <Text>Hi {name}, thank you for your interest in partnering with KingdomTradeX. After careful review, we're unable to approve your creator application at this time.</Text>
      {reason ? (
        <>
          <Divider />
          <Text muted><strong>Feedback from our team:</strong> {reason}</Text>
        </>
      ) : null}
      <Text>You're welcome to reapply whenever you'd like — many partnerships begin after a second review.</Text>
      <Button href="https://kingdomtradex.com/creator" variant="secondary">Reapply</Button>
    </BaseTemplate>
  );
}
