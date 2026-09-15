import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider, StatRow, InfoBox } from '../components';

interface Props { name: string; ipAddress: string; device: string; location: string; loginTime: string }

// security: new login alert with device details + secure-account CTA
export function NewLoginAlertEmail({ name, ipAddress, device, location, loginTime }: Props) {
  return (
    <BaseTemplate preview="New sign-in to your account">
      <Heading level={1}>New sign-in detected</Heading>
      <Text>Hi {name}, we noticed a login to your KingdomTradeX account from a new device.</Text>
      <Divider />
      <StatRow label="Time" value={loginTime} />
      <StatRow label="Device" value={device} />
      <StatRow label="IP address" value={ipAddress} />
      <StatRow label="Approx. location" value={location} />
      <InfoBox>
        <Text muted><strong>If this was you, no action is needed</strong> — you can safely ignore this email.</Text>
      </InfoBox>
      <Text>If you don't recognize this sign-in, change your password immediately and enable two-factor authentication. We recommend both regardless.</Text>
      <Button href="https://kingdomtradex.com/console">Secure my account</Button>
    </BaseTemplate>
  );
}
