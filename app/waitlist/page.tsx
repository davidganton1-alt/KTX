import { Metadata } from 'next';
import WaitlistClient from './WaitlistClient';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: 'Something Big Is Coming | KingdomTradeX',
  description: 'Faith driven AI trading with Kingdom level precision. Secure your spot on the KingdomTradeX waitlist before doors open.',
  openGraph: {
    title: 'Something Big Is Coming | KingdomTradeX',
    description: 'Faith driven AI trading with Kingdom level precision. Secure your spot before doors open.',
  },
};

export default function WaitlistPage() {
  return <WaitlistClient />;
}
