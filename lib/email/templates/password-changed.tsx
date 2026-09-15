import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Divider, StatRow, InfoBox } from '../components';

interface Props { name: string; changedAt: string }

// security: password change confirmation
export function PasswordChangedEmail({ name, changedAt }: Props) {
  return (
    <BaseTemplate preview="Your password was changed">
      <Heading level={1}>Password updated</Heading>
      <Text>Hi {name}, your KingdomTradeX account password was successfully changed.</Text>
      <Divider />
      <StatRow label="Changed at" value={changedAt} />
      <InfoBox>
        <Text muted>If you did not make this change, <strong style={{ color: '#dc2626' }}>contact support@kingdomtradex.com immediately</strong> — we'll lock the account and help you recover it.</Text>
      </InfoBox>
      <Text muted>Tip: enabling two-factor authentication in your dashboard protects your account even if your password is compromised.</Text>
    </BaseTemplate>
  );
}
