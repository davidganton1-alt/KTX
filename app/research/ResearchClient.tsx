'use client';

import { AiEngineHero } from "@/components/AiEngineHero";
import { EnginePipeline } from "@/components/EnginePipeline";
import { Reveal } from "@/components/Reveal";
import { TrustBox } from "@/components/TrustBox";

// ── SWAP THIS WITH THE REAL PUBLIC RESEARCH REPO IN THE FINAL PASS ──
const RESEARCH_REPO_URL = 'https://github.com/KingdomTradeX/Research';

export default function ResearchClient() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <AiEngineHero />

      <section className="relative z-10">
        <EnginePipeline />
      </section>

      <div className="container-wide">
        <TrustBox template="carousel" className="my-12" />
      </div>

      <section className="container-wide py-24">
        <Reveal variant="up">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 rounded-full border text-xs font-bold uppercase tracking-widest" style={{ borderColor: 'var(--border)', color: 'var(--gold)', backgroundColor: 'var(--card)' }}>
              Open Methodology
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Audit Our Research</h2>
            <p className="text-lg text-[var(--muted)]">
              Trust requires transparency. We publish our non-sensitive research and market analysis openly so you can evaluate our methodology before committing capital.
            </p>
            <a
              href={RESEARCH_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-xl px-8 py-4 text-base font-bold transition hover:brightness-110"
              style={{ backgroundColor: 'var(--gold)', color: 'black' }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View Research Paper on GitHub
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
