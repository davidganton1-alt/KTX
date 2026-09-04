"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";

const publicLinks = [
  { href: "/#how", label: "How it works" },
  { href: "/markets", label: "Markets" },
  { href: "/plans", label: "Plans" },
  { href: "/ai-engine", label: "AI Trade Engine" },
  { href: "/team", label: "Team" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
];

export function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);

  // The AI Trade Engine is a full-screen terminal; hide the site chrome there.
  if (pathname === "/ai-trading") return null;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRole(d?.role ?? null))
      .catch(() => setRole(null));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <nav className="container-wide flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo-128.png"
            alt="KingdomTradeX"
            className="h-9 w-9 rounded-full object-contain"
          />
          <span className="text-lg font-bold tracking-tight">
            Kingdom<span className="gradient-text">TradeX</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {publicLinks.map((l) => {
            const active = pathname === l.href || (l.href !== "/#how" && l.href !== "/#tiers" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative text-sm transition ${
                  active ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-gold-light to-cyan-light" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {role ? (
            <>
              <Link
                href={role === "admin" ? "/admin" : "/console"}
                className="btn-ghost hidden px-4 py-1.5 text-sm sm:inline-flex"
              >
                {role === "admin" ? "Admin" : "Dashboard"}
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm transition hover:border-loss hover:text-loss"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-[var(--muted)] transition hover:text-[var(--fg)] sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary px-4 py-1.5 text-sm"
              >
                Get $50 free
              </Link>
            </>
          )}
          <ThemeToggle />

          <button
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm md:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {menu && (
        <div className="glass border-t border-[var(--border)] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {publicLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenu(false)} className="text-sm text-[var(--muted)]">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
