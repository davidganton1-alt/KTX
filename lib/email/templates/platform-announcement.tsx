import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Button, Divider } from '../components';

interface Props { title: string; body: string; actionUrl?: string; actionLabel?: string }

// broadcast: announcements/maintenance (rendered from admin copy)
export function PlatformAnnouncementEmail({ title, body, actionUrl, actionLabel }: Props) {
  return (
    <BaseTemplate preview={title}>
      <Heading level={1}>{title}</Heading>
      <Divider />
      <Text>{body}</Text>
      {actionUrl ? <Button href={actionUrl}>{actionLabel || 'Learn more'}</Button> : null}
      <Text muted>You're receiving this because it concerns your account on KingdomTradeX. You can manage email preferences any time from your dashboard.</Text>
    </BaseTemplate>
  );
}
