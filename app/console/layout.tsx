import type { Metadata } from 'next';

// Phase O.1: page metadata via route layout (the page itself is a client
// component, which cannot export metadata directly).
export const metadata: Metadata = {
  title: 'Member Console',
  description: 'Access your trading dashboard, deposits, withdrawals, and AI Engine.',
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
