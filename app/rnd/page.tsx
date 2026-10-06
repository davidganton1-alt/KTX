import type { Metadata } from 'next';
import Link from 'next/link';
import { RND_PAPERS, RND_GITHUB } from '@/lib/rnd';
import { Reveal } from '@/components/rnd/Reveal';
import { RoadmapTimeline } from '@/components/rnd/RoadmapTimeline';

export const metadata: Metadata = {
  title: 'Research & Development',
  description: 'KingdomTradeX research papers, the open trading-engine code shell, and the quarterly development roadmap.',
};

const STATUS_PILL: Record<string, string> = {
  published: 'Published',
  'under-review': 'Under Review',
  preprint: 'Preprint',
};

export default function RnDPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-16">
      {/* HERO */}
      <Reveal>
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--gold)]">R&D</p>
        <h1 className="mt-3 text-[40px] font-bold leading-tight text-[var(--fg)] md:text-[52px]">
          Research & Development
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
          We build in the open. Below you will find our research program, the public shell of our
          trading engine, and a quarter-by-quarter roadmap of where the platform is headed.
        </p>
        <div className="mt-8 flex flex-wrap gap-6 font-mono text-[13px]">
          <span className="text-[var(--muted)]"><span className="font-semibold text-[var(--fg)]">{RND_PAPERS.length}</span> research papers</span>
          <span className="text-[var(--muted)]"><span className="font-semibold text-[var(--fg)]">{RND_GITHUB.version}</span> engine shell</span>
          <span className="text-[var(--muted)]"><span className="font-semibold text-[var(--fg)]">4</span> quarters mapped</span>
        </div>
      </Reveal>

      {/* PAPERS */}
      <section className="mt-20">
        <Reveal>
          <h2 className="text-[26px] font-semibold text-[var(--fg)]">Research Papers</h2>
          <p className="mt-2 text-[14px] text-[var(--muted)]">Peer-reviewed and preprint work from the KingdomTradeX research program.</p>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {RND_PAPERS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <article className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
                <span className="self-start rounded-full border border-[var(--gold)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--gold)]">
                  {STATUS_PILL[p.status]}
                </span>
                <h3 className="mt-4 text-[16px] font-semibold leading-snug text-[var(--fg)]">{p.title}</h3>
                <p className="mt-2 text-[12px] text-[var(--muted)]">{p.authors.join(', ')} · {p.venue} · {p.year}</p>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">{p.abstract}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded bg-[var(--bg-soft)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]">#{t}</span>
                  ))}
                </div>
                <div className="mt-4 flex gap-4 border-t border-[var(--border)] pt-3">
                  {p.links.map((l) => (
                    <a key={l.label} href={l.url} className="font-mono text-[12px] text-[var(--gold)] hover:underline">
                      {l.label} →
                    </a>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* GITHUB / ENGINE SHELL */}
      <section className="mt-20">
        <Reveal>
          <h2 className="text-[26px] font-semibold text-[var(--fg)]">Trading Engine — Public Shell</h2>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">{RND_GITHUB.description}</p>
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[14px] font-semibold text-[var(--fg)]">{RND_GITHUB.repoName}</span>
                <span className="font-mono text-[11px] text-[var(--muted)]">{RND_GITHUB.version}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 font-mono text-[11px] text-[var(--muted)]">
                <span>{RND_GITHUB.language}</span>
                <span>{RND_GITHUB.license}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-3">
                {RND_GITHUB.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[13px] text-[var(--muted)]">
                    <span className="text-[var(--gold)]">▸</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={RND_GITHUB.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-lg border border-[var(--gold)] px-4 py-2 font-mono text-[13px] text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-black"
              >
                View on GitHub →
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="h-full overflow-hidden rounded-xl border border-[var(--border)] bg-[#0b1020]">
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
                <span className="ml-2 font-mono text-[11px] text-[var(--muted)]">engine/risk.py</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-[#9fb6e4]">
                {RND_GITHUB.codeSnippet}
              </pre>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="mt-24">
        <Reveal>
          <h2 className="text-center text-[26px] font-semibold text-[var(--fg)]">Development Roadmap</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-[14px] text-[var(--muted)]">
            A transparent, quarter-by-quarter plan. Completed work is checked; the active quarter pulses.
          </p>
        </Reveal>
        <div className="mt-10">
          <RoadmapTimeline />
        </div>
      </section>

      {/* CLOSING TRUST NOTE */}
      <Reveal>
        <div className="mt-20 rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="mx-auto max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">
            Everything on this page is versioned. When papers are accepted or roadmap items ship,
            this page updates in the same commit as the work itself.
          </p>
          <Link href="/plans" className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--gold)] px-6 py-2.5 font-mono text-[13px] font-semibold text-black transition-opacity hover:opacity-90">
            Explore the Plans
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
