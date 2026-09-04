"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
    >
      Sign out
    </button>
  );
}

export function DashboardShell({
  title,
  role,
  children,
  links,
}: {
  title: string;
  role: string;
  children: React.ReactNode;
  links?: { href: string; label: string }[];
}) {
  return (
    <div className="container-wide px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Signed in as <span className="text-[var(--gold)]">{role}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/markets"
            className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            Markets
          </Link>
          <LogoutButton />
        </div>
      </div>
      {links && (
        <nav className="mt-6 flex gap-2 border-b border-[var(--border)] pb-2 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-[var(--fg)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}
