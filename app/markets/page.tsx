import type { Metadata } from 'next';
import { MarketsBoard } from '@/components/MarketsBoard';

export const metadata: Metadata = {
  title: 'Markets | KingdomTradeX',
  description: 'What the KingdomTradeX AI Engine trades — crypto, US stocks, commodities, and forex — with a calm snapshot of the current book. Not a live ticker: a overview of the disciplined whole.',
  openGraph: {
    title: 'Markets | KingdomTradeX',
    description: 'What the AI Engine trades, in a calm snapshot.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markets | KingdomTradeX',
    description: 'What the AI Engine trades, in a calm snapshot.',
  },
  alternates: { canonical: '/markets' },
};

export default function MarketsPage() {
  return <MarketsBoard />;
}
