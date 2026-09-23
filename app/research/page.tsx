import type { Metadata } from 'next';
import ResearchClient from './ResearchClient';

export const metadata: Metadata = {
  title: 'Research & Technology | KingdomTradeX',
  description: 'Explore the AI architecture, trading methodology, tech stack, and security frameworks behind KingdomTradeX. Transparent by design.',
  openGraph: {
    title: 'Research & Technology | KingdomTradeX',
    description: 'Explore the AI architecture, trading methodology, tech stack, and security frameworks behind KingdomTradeX.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research & Technology | KingdomTradeX',
    description: 'Explore the AI architecture, trading methodology, and security frameworks.',
  },
  alternates: { canonical: '/research' },
};

export default function ResearchPage() {
  return <ResearchClient />;
}
