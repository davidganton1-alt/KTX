import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider } from '../components';

interface Props { name: string; reason?: string }

// text: Hi {name}, after careful review your pastor application did not meet our current partnership criteria. You're welcome to reapply.
export function PastorApplicationRejectedEmail({ name, reason }: Props) {
  return (
    <BaseTemplate preview="Update on your pastor application">
      <Heading level={1}>About your application</Heading>
      <Text>Hi {name}, thank you for your willingness to serve and for the time you took to apply. After careful review, your application did not meet our current partnership criteria, and we are unable to approve it at this time.</Text>
      {reason ? (
        <>
          <Divider />
          <Text muted><strong>Feedback from our team:</strong> {reason}</Text>
        </>
      ) : null}
      <Text>We'd be glad to reconsider a future application as your congregation and ministry grow.</Text>
      <Button href="https://kingdomtradex.com/become-pastor" variant="secondary">Reapply</Button>
    </BaseTemplate>
  );
}
