import * as React from 'react';
import { BaseTemplate } from './base';
import { Heading, Text, Divider, StatRow, InfoBox } from '../components';

interface Props { name: string; ticketId: string; subject: string }

// ops: support ticket auto-acknowledgement
export function SupportTicketReplyEmail({ name, ticketId, subject }: Props) {
  return (
    <BaseTemplate preview="We got your message">
      <Heading level={1}>We've received your message</Heading>
      <Text>Hi {name}, thanks for reaching out. A real person on our support team has your request and will respond within 12–24 hours.</Text>
      <Divider />
      <StatRow label="Ticket" value={ticketId} />
      <StatRow label="Subject" value={subject} />
      <InfoBox>
        <Text muted><strong>Keep this email</strong> — reply to it (or reference your ticket ID) to add information to the same conversation.</Text>
      </InfoBox>
      <Text muted>Urgent account-security matter? Reply with the word SECURITY in the subject and we'll move you to the front of the queue.</Text>
    </BaseTemplate>
  );
}
