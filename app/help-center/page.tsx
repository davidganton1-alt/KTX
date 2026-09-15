import type { Metadata } from 'next';
import { HelpCenter } from '@/components/HelpCenter';

export const metadata: Metadata = {
  title: 'Help Center | KingdomTradeX',
  description: 'Answers on deposits, withdrawals, profit, referrals, security, and pastor/creator partnerships — plus direct support with 12–24 hour response times.',
  openGraph: {
    title: 'Help Center | KingdomTradeX',
    description: 'Answers and direct support for KingdomTradeX.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | KingdomTradeX',
    description: 'Answers and direct support for KingdomTradeX.',
  },
  alternates: { canonical: '/help-center' },
};

export default function HelpCenterPage() {
  return <HelpCenter />;
}
