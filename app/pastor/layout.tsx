import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pastor Dashboard',
  description: 'Shepherd your flock: referrals, ministry earnings, and payout requests.',
  robots: { index: false, follow: false },
};

export default function PastorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
