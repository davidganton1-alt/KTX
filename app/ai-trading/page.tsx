import type { Metadata } from 'next';
import AiTradingClient from './AiTradingClient';

export const metadata: Metadata = {
  title: 'Live AI Trading Terminal | KingdomTradeX',
  description: 'Watch the KingdomTradeX AI engine execute trades in real time. A public demonstration of disciplined algorithmic trading.',
  openGraph: {
    title: 'Live AI Trading Terminal | KingdomTradeX',
    description: 'Watch the KingdomTradeX AI engine execute trades in real time.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live AI Trading Terminal | KingdomTradeX',
    description: 'Watch the KingdomTradeX AI engine execute trades in real time.',
  },
  alternates: { canonical: '/ai-trading' },
};

export default function AiTradingPage() {
  return <AiTradingClient />;
}
