import type { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Contact Support | KingdomTradeX',
  description: 'Need help? Reach out to the KingdomTradeX support team. We are here to assist you on your stewardship journey.',
  openGraph: {
    title: 'Contact Support | KingdomTradeX',
    description: 'Need help? Reach out to the KingdomTradeX support team.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Support | KingdomTradeX',
    description: 'Need help? Reach out to the KingdomTradeX support team.',
  },
  alternates: { canonical: '/support' },
};

export default function SupportPage() {
  return <SupportClient />;
}
