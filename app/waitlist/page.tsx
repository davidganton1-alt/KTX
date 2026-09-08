import { Metadata } from 'next';
import WaitlistClient from './WaitlistClient';

export const metadata: Metadata = {
  title: 'Join the Waitlist | KingdomTradeX',
  description: 'Secure your early access to KingdomTradeX. Where disciplined algorithmic trading meets biblical stewardship. Join the faithful.',
  openGraph: {
    title: 'Join the KingdomTradeX Waitlist',
    description: 'AI-driven trading paired with biblical stewardship. Secure your spot before public launch.',
  },
};

export default function WaitlistPage() {
  return <WaitlistClient />;
}
