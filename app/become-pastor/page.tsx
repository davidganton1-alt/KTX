import type { Metadata } from 'next';
import BecomePastorClient from './BecomePastorClient';

export const metadata: Metadata = {
  title: 'Become a Pastor | KingdomTradeX',
  description: 'Partner with KingdomTradeX. Lead your flock to financial stewardship and earn a share of the trading profits your community generates.',
  openGraph: {
    title: 'Become a Pastor | KingdomTradeX',
    description: 'Partner with KingdomTradeX. Lead your flock to financial stewardship.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a Pastor | KingdomTradeX',
    description: 'Partner with KingdomTradeX. Lead your flock to financial stewardship.',
  },
  alternates: { canonical: '/become-pastor' },
};

export default function BecomePastorPage() {
  return <BecomePastorClient />;
}
