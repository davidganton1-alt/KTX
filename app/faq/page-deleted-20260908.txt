import type { Metadata } from 'next';
import FaqClient from './FaqClient';

export const metadata: Metadata = {
  title: 'Help Center & FAQ | KingdomTradeX',
  description: 'Find answers to common questions about KingdomTradeX plans, deposits, withdrawals, and the Pastor program.',
  openGraph: {
    title: 'Help Center & FAQ | KingdomTradeX',
    description: 'Find answers to common questions about KingdomTradeX plans, deposits, and withdrawals.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center & FAQ | KingdomTradeX',
    description: 'Find answers to common questions about KingdomTradeX.',
  },
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return <FaqClient />;
}
