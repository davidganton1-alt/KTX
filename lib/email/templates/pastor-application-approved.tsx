import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, InfoBox } from '../components';

interface Props { name: string; ministry?: string; email: string; password: string }

// text: Your pastor account is approved. Email {email}, temp password {password}. Change it after first login.
export function PastorApplicationApprovedEmail({ name, ministry, email, password }: Props) {
  return (
    <BaseTemplate preview="Your pastor account is ready">
      <Heading level={1}>Welcome, {name}</Heading>
      <Text>
        Your KingdomTradeX pastor application has been approved{ministry ? ` for ${ministry}` : ''}.
        You can now sign in and start shepherding your flock from your pastor dashboard.
      </Text>
      <Divider />
      <InfoBox>
        <Text><strong>Your sign-in credentials</strong></Text>
        <Text>Email: {email}</Text>
        <Text>Temporary password: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{password}</code></Text>
        <Text muted>Please change this password after your first sign-in.</Text>
      </InfoBox>
      <Button href="https://kingdomtradex.com/pastor">Open your pastor dashboard</Button>
      <Text muted>Reminder: pastor commissions come from platform profit — never from your flock's deposits.</Text>
    </BaseTemplate>
  );
}
