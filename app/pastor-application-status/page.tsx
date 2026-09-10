import type { Metadata } from 'next';
import PastorApplicationStatusClient from './PastorApplicationStatusClient';

export const metadata: Metadata = {
  title: 'Check Application Status | KingdomTradeX',
  description: 'Check the status of your KingdomTradeX Pastor application.',
  openGraph: {
    title: 'Check Application Status | KingdomTradeX',
    description: 'Check the status of your KingdomTradeX Pastor application.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Check Application Status | KingdomTradeX',
    description: 'Check the status of your KingdomTradeX Pastor application.',
  },
  alternates: { canonical: '/pastor-application-status' },
};

export default function PastorApplicationStatusPage() {
  return <PastorApplicationStatusClient />;
}
