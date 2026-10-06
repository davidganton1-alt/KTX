import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creator Dashboard',
  description: 'Create content, grow your audience, and earn first-deposit commissions.',
  robots: { index: false, follow: false },
};

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
