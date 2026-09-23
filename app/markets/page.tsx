import type { Metadata } from 'next';
import MarketsClient from './MarketsClient';

export const metadata: Metadata = {
  title: 'Live Markets | KingdomTradeX',
  description: 'Real-time prices and AI analysis across crypto, US stocks, and commodities. Watch the markets through the lens of disciplined stewardship.',
  openGraph: {
    title: 'Live Markets | KingdomTradeX',
    description: 'Real-time prices and AI analysis across crypto, US stocks, and commodities.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Markets | KingdomTradeX',
    description: 'Real-time prices and AI analysis.',
  },
  alternates: {
    canonical: '/markets',
  },
};

export default function MarketsPage() {
  return <MarketsClient />;
}
