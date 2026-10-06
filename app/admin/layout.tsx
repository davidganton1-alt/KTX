import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console',
  description: 'KingdomTradeX operations: treasury, approvals, users, and platform health.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
