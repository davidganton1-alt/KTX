"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/ai-trading") return null;
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <div className="footer-glow" />
      <div className="container-wide grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold">
            Kingdom<span className="gradient-text">TradeX</span>
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            AI trading with wisdom, not hype. Built on stewardship and integrity.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link href="/markets" className="hover:text-[var(--fg)]">Markets</Link>
            <Link href="/ai-engine" className="hover:text-[var(--fg)]">AI Trade Engine</Link>
            <Link href="/ai-trading" className="hover:text-[var(--fg)]">Live Terminal</Link>
            <Link href="/#how" className="hover:text-[var(--fg)]">How it works</Link>
            <Link href="/plans" className="hover:text-[var(--fg)]">Plans</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link href="/team" className="hover:text-[var(--fg)]">Team</Link>
            <Link href="/become-pastor" className="hover:text-[var(--fg)]">Serve as a Pastor</Link>
            <Link href="/support" className="hover:text-[var(--fg)]">Support</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Legal</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link href="/privacy" className="hover:text-[var(--fg)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--fg)]">Terms</Link>
          </div>
        </div>
      </div>
      <div className="footer-glow opacity-50" />
      <div className="py-6 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} KingdomTradeX. Demonstration build, no real
        funds are traded.
      </div>
    </footer>
  );
}
