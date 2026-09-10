"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SOCIAL_URLS } from "@/lib/social";

export function SiteFooter() {
  const pathname = usePathname();
  // Full-screen pages hide the site chrome: the live terminal and the waitlist conversion page.
  if (pathname === "/ai-trading" || pathname === "/waitlist") return null;
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
            <Link href="/research" className="hover:text-[var(--fg)]">Research</Link>
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
      <div className="flex items-center justify-center gap-5 mb-4">
        <a href={SOCIAL_URLS.x} target="_blank" rel="noopener noreferrer" aria-label="X" className="transition hover:text-[var(--gold)]" style={{ color: 'var(--muted)' }}>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href={SOCIAL_URLS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="transition hover:text-[var(--gold)]" style={{ color: 'var(--muted)' }}>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
        <a href={SOCIAL_URLS.trustpilot} target="_blank" rel="noopener noreferrer" aria-label="Trustpilot" className="transition hover:text-[var(--gold)]" style={{ color: 'var(--muted)' }}>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.6 8h8.4l-6.8 4.94L18.8 21 12 16.06 5.2 21l2.6-8.06L1 8h8.4z"/></svg>
        </a>
      </div>
      <div className="py-6 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} KingdomTradeX. KingdomTradeX is a
        registered MSB and LLC. Trading involves real risk and profits are not
        guaranteed.
      </div>
    </footer>
  );
}
