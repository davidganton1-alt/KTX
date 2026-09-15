'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/design-system/PageHeader';
import { DataCard } from '@/components/design-system/DataCard';
import { Button } from '@/components/design-system/Button';
import { Label } from '@/components/design-system/Typography';

// Shared shell for legal documents (Phase H): transparent root so the aurora
// body gradient shows, design-system header, sticky ToC on desktop, collapsible
// on mobile, numbered section cards. No marketing fluff — just legible law.

export type LegalSection = {
  id: string;
  title: string;
  paras?: string[];
  bullets?: string[];
  note?: string; // small muted line under the section
};

export function LegalLayout({
  title,
  description,
  lastUpdated,
  sections,
  intro,
}: {
  title: string;
  description?: string;
  lastUpdated: string;
  sections: LegalSection[];
  intro?: React.ReactNode;
}) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1180px] px-6 py-10 lg:py-14">
        <PageHeader
          crumbs={['Home', 'Legal', title]}
          title={title}
          description={description}
          actions={
            <div className="flex flex-col items-end gap-2">
              <Label>Last updated: {lastUpdated}</Label>
              <Link href="/console" className="no-underline">
                <Button variant="secondary" size="sm">Back to Dashboard</Button>
              </Link>
            </div>
          }
        />

        {intro ? <div className="mt-6">{intro}</div> : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* ── ToC: sticky on desktop, collapsible on mobile ── */}
          <aside>
            <button
              className="mb-2 w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-left text-[13px] font-medium text-[var(--fg)] lg:hidden"
              onClick={() => setTocOpen((v) => !v)}
              aria-expanded={tocOpen}
            >
              {tocOpen ? '−' : '+'} Contents ({sections.length})
            </button>
            <nav className={`${tocOpen ? 'block' : 'hidden'} sticky top-24 rounded-xl border border-[var(--border)] p-4 lg:block`}
              style={{ background: 'linear-gradient(180deg, var(--surface-from), var(--surface-to))' }}>
              <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--gold)]">Contents</p>
              <ul className="max-h-[70vh] space-y-0.5 overflow-y-auto">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setTocOpen(false)}
                      className="block truncate rounded-md px-2 py-1.5 text-[12.5px] leading-snug text-[var(--muted)] no-underline transition-colors hover:bg-[var(--row-hover)] hover:text-[var(--fg)]"
                      title={s.title}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* ── Content ── */}
          <div className="space-y-5">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <DataCard title={s.title}>
                  {s.paras?.map((p, i) => (
                    <p key={i} className="mb-3 text-[14px] leading-[1.7] text-[var(--fg)] last:mb-0" style={i > 0 ? { marginTop: '0.75rem' } : undefined}>{p}</p>
                  ))}
                  {s.bullets && (
                    <ul className="mt-3 space-y-2">
                      {s.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-[14px] leading-[1.65] text-[var(--fg)]">
                          <span className="mt-[9px] h-1 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.note ? <p className="mt-3 text-[12px] leading-[1.6] text-[var(--muted)]">{s.note}</p> : null}
                </DataCard>
              </section>
            ))}
            <p className="pt-4 text-center text-[12px] text-[var(--muted)]">
              Questions? <a href="/help-center" className="text-[var(--gold)] no-underline hover:underline">Contact support</a> — a real person reads these.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
