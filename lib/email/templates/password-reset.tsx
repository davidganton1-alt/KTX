import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, InfoBox } from '../components';

interface Props { name: string; resetLink: string }

// text: A password reset was requested for your KingdomTradeX account. Use the secure link below. It expires in 24 hours.
export function PasswordResetEmail({ name, resetLink }: Props) {
  return (
    <BaseTemplate preview="Reset your KingdomTradeX password">
      <Heading level={1}>Password reset</Heading>
      <Text>Hi {name}, we received a request to reset your KingdomTradeX password.</Text>
      <Divider />
      <Button href={resetLink}>Choose a new password</Button>
      <InfoBox>
        <Text muted>This link expires in 24 hours and can only be used once. If the button doesn't work, copy and paste this link into your browser:</Text>
        <p style={{ margin: 0, fontSize: '13px', color: '#a8760a', wordBreak: 'break-all', fontFamily: 'monospace' }}>{resetLink}</p>
      </InfoBox>
      <Text muted>Didn't request this? You can safely ignore this email — your password won't change.</Text>
    </BaseTemplate>
  );
}
