'use client';

import { AiEngineHero } from "@/components/AiEngineHero";
import { EnginePipeline } from "@/components/EnginePipeline";
import { Reveal } from "@/components/Reveal";

// ── SWAP THIS WITH THE REAL PUBLIC RESEARCH REPO IN THE FINAL PASS ──
const RESEARCH_REPO_URL = 'https://github.com/KingdomTradeX/Research';

const techStack = [
  { name: "Next.js 14", desc: "App Router framework for server-side rendering and fast page loads." },
  { name: "TypeScript", desc: "Strict mode language preventing runtime errors in financial calculations." },
  { name: "Docker", desc: "Containerized deployment ensuring identical environments from dev to VPS." },
  { name: "Supabase", desc: "SOC 2 certified PostgreSQL database with row-level security for user data." },
  { name: "lightweight-charts", desc: "Institutional-grade TradingView library for real-time candlestick rendering." },
  { name: "Tailwind CSS", desc: "Utility-first styling with CSS variables ensuring perfect day/night theming." },
];

const securityFrameworks = [
  { title: "Non-Custodial Architecture", desc: "We do not hold your long-term funds. Deposits route through NOWPayments, with the majority moving to cold storage." },
  { title: "Row-Level Security", desc: "Database queries are cryptographically scoped. A user can only ever read or write their own wallet and trade history." },
  { title: "MSB Compliance", desc: "KingdomTradeX operates as a registered Money Services Business, adhering to strict federal reporting and AML frameworks." },
  { title: "Zero Third-Party Tracking", desc: "We do not sell data. We do not use invasive ad trackers. Your financial footprint remains private." },
];

export default function ResearchClient() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <AiEngineHero />

      <section className="relative z-10">
        <EnginePipeline />
      </section>

      <section className="container-wide py-24">
        <Reveal variant="up">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 rounded-full border text-xs font-bold uppercase tracking-widest" style={{ borderColor: 'var(--border)', color: 'var(--gold)', backgroundColor: 'var(--card)' }}>
              Open Methodology
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Audit Our Research</h2>
            <p className="text-lg text-[var(--muted)]">
              Trust requires transparency. We publish our non-sensitive architectural research, risk frameworks, and market analysis openly so you can evaluate our methodology before committing capital.
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

      <section className="container-wide py-24 border-t" style={{ borderColor: 'var(--border)' }}>
        <Reveal variant="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Technology Stack</h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              Built on modern, battle-tested infrastructure designed for speed, security, and absolute reliability.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {techStack.map((tech) => (
              <div key={tech.name} className="rounded-2xl border p-6 transition hover:border-[var(--gold)]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--fg)' }}>{tech.name}</h3>
                <p className="text-sm text-[var(--muted)]">{tech.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-wide py-24 border-t" style={{ borderColor: 'var(--border)' }}>
        <Reveal variant="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Security & Risk Frameworks</h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              Protecting capital and data is not an afterthought. It is the foundation of every architectural decision.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {securityFrameworks.map((item) => (
              <div key={item.title} className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--gold)' }}>{item.title}</h3>
                <p className="text-base leading-relaxed text-[var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
