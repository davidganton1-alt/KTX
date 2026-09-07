import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";
import { FAQS } from "@/lib/faqs";
import Link from "next/link";

export const metadata = { title: "Plans | KingdomTradeX" };

const lineup = [
  {
    name: "Faithful", rate: "0.5%", min: "$100 – $500", hold: "6-month hold", hl: false,
    bullets: ["Crypto, US stocks & commodities", "Starter AI desk", "Daily profit, withdraw anytime"],
    verse: "Be faithful with the little things. Luke 16:10",
  },
  {
    name: "Steward", rate: "0.75%", min: "$650 – $1,500", hold: "9-month hold", hl: true,
    bullets: ["All markets unlocked", "Advanced AI + priority rebalancing", "Profit-only withdrawals"],
    verse: "Stewards of the manifold grace of God. 1 Peter 4:10",
  },
  {
    name: "Ambassador", rate: "1.0%", min: "$2,000 and up", hold: "12-month hold", hl: false,
    bullets: ["Elite AI desk", "Dedicated risk guardrails", "Largest daily target"],
    verse: "Honour the Lord with your wealth. Proverbs 3:9",
  },
];

const groups = [
  {
    name: "The seed",
    rows: [
      { label: "Deposit range", v: ["$100 – $500", "$650 – $1,500", "$2,000 and up"] },
      { label: "Hold period", v: ["6 months", "9 months", "12 months"] },
      { label: "Early deposit withdrawal", v: ["25% fee", "25% fee", "25% fee"] },
    ],
  },
  {
    name: "The engine",
    rows: [
      { label: "AI desk", v: ["Starter AI", "Advanced AI", "Elite AI desk"] },
      { label: "Markets", v: ["Crypto · Stocks · Commodities", "All markets", "All markets"] },
      { label: "Rebalancing", v: ["Daily", "Priority", "Dedicated"] },
      { label: "Risk guardrails", v: ["Standard", "Advanced", "Dedicated"] },
    ],
  },
  {
    name: "The harvest",
    rows: [
      { label: "Target daily profit", v: ["0.5%", "0.75%", "1.0%"] },
      { label: "Profit withdrawals", v: ["Anytime", "Anytime", "Anytime"] },
      { label: "Trade transparency", v: ["Full ledger", "Full ledger", "Full ledger"] },
    ],
  },
];

const holdChapters = [
  { n: "I", t: "Planted", d: "Day zero. Your seed goes into the soil. The AI desk opens and begins trading with guardrails on." },
  { n: "II", t: "Harvest daily", d: "Every day, profit accrues and is withdrawable. The hold never touches your harvest, only the seed." },
  { n: "III", t: "Released", d: "When the hold ends, your full deposit unlocks. Withdraw everything: no fee, no friction." },
];

export default function PlansPage() {
  return (
    <main>
      {/* ── HERO ── */}
      <section className="container-wide pt-16 text-center md:pt-24">
        <p className="eyebrow">Plans</p>
        <h1 className="section-title mt-3 text-5xl md:text-7xl">How much will you <span className="gradient-text">plant</span>?</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[var(--muted)]">
          Same AI. Same honesty. Three sizes of seed, each with its own daily target and harvest rhythm.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <span className="pill">0.5% – 1.0% daily targets</span>
          <span className="pill">Profit-only withdrawals</span>
          <span className="pill">Transparent ledger</span>
        </div>
      </section>

      {/* ── LINEUP PILLARS (giant rates) ── */}
      <section className="container-wide py-14">
        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {lineup.map((p, i) => (
            <Reveal key={p.name} variant="up" index={i}>
              <div className={`relative flex h-full flex-col rounded-3xl border p-7 text-center transition ${p.hl ? "border-[var(--gold)] bg-gradient-to-b from-[var(--gold)]/[0.12] to-transparent shadow-gold md:-translate-y-4" : "border-[var(--border)] bg-[var(--card)] hover:-translate-y-1 hover:border-[var(--gold)]/60"}`}>
                {p.hl && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#0a0e27]">Most chosen</span>}
                <div className="flex min-h-[210px] flex-col items-center justify-start">
                  <p className="eyebrow">{p.name}</p>
                  <p className={`mt-5 text-6xl font-extrabold tracking-tight md:text-7xl ${p.hl ? "gradient-text" : ""}`}>{p.rate}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">target / day</p>
                  <p className="mt-3 text-sm text-[var(--muted)]">{p.min}</p>
                  <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
                </div>
                <ul className="flex-1 space-y-2 text-left text-sm text-[var(--muted)]">
                  {p.bullets.map((b) => <li key={b} className="flex gap-2.5"><span className="text-[var(--gold)]">✦</span>{b}</li>)}
                </ul>
                <div className="mt-auto flex flex-col gap-3 pt-5">
                  <p className="text-xs italic leading-relaxed text-[var(--gold)]">{p.verse}</p>
                  <p className="text-xs text-[var(--muted)]">{p.hold} · 25% early fee</p>
                  <Link
                    href="/register"
                    className={`mt-auto block w-full rounded-2xl px-6 py-4 text-center text-base font-bold transition-all duration-300 ${
                      p.hl
                        ? 'bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black shadow-lg shadow-[var(--gold)]/25 hover:shadow-xl hover:shadow-[var(--gold)]/40 hover:scale-[1.02]'
                        : 'border-2 border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--gold)] hover:text-[var(--gold)] hover:scale-[1.02]'
                    }`}
                  >
                    {p.hl ? 'Start with Steward' : `Start with ${p.name}`}
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="container-wide mt-20">
        <div className="text-center">
          <p className="eyebrow">Feature comparison</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">
            Same AI, <span className="gradient-text">three paths</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
            Every plan runs on the same honest engine. Here is exactly what you get at each tier.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <div className="min-w-[768px]">
            {/* Sticky Header */}
            <div className="sticky top-16 z-20 rounded-t-2xl border border-[var(--border)] bg-[var(--bg-soft)]/95 backdrop-blur-md">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0">
                <div className="border-r border-[var(--border)] px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Feature</p>
                </div>
                <div className="border-r border-[var(--border)] px-6 py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Faithful</p>
                </div>
                <div className="border-r border-[var(--border)] bg-[var(--gold)]/[0.08] px-6 py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">Steward</p>
                </div>
                <div className="px-6 py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Ambassador</p>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="rounded-b-2xl border border-t-0 border-[var(--border)] bg-[var(--bg-soft)]">
              {groups.map((group, groupIdx) => (
                <div key={group.name}>
                  {/* Group Header */}
                  <div className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
                    <p className="text-sm font-bold uppercase tracking-wider text-[var(--gold)]">{group.name}</p>
                  </div>

                  {/* Group Rows */}
                  {group.rows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className={`grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 border-b border-[var(--border)] last:border-b-0 ${
                        rowIdx % 2 === 0 ? 'bg-[var(--bg-soft)]' : 'bg-[var(--card)]/30'
                      }`}
                    >
                      {/* Label Cell */}
                      <div className="border-r border-[var(--border)] px-6 py-4">
                        <p className="text-sm font-medium text-[var(--fg)]">{row.label}</p>
                      </div>

                      {/* Faithful Cell */}
                      <div className="border-r border-[var(--border)] px-6 py-4 text-center">
                        <p className="text-sm text-[var(--muted)]">{row.v[0]}</p>
                      </div>

                      {/* Steward Cell (highlighted) */}
                      <div className="border-r border-[var(--border)] bg-[var(--gold)]/[0.05] px-6 py-4 text-center">
                        <p className="text-sm font-semibold text-[var(--fg)]">{row.v[1]}</p>
                      </div>

                      {/* Ambassador Cell */}
                      <div className="px-6 py-4 text-center">
                        <p className="text-sm text-[var(--muted)]">{row.v[2]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Early withdrawal notice */}
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.05] p-6 text-center">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-bold text-[var(--gold)]">Full honesty:</span> withdrawing your deposit before the hold ends carries a 25% fee. Early exits force the AI to unwind positions. Your daily profit is <span className="font-bold text-[var(--fg)]">never</span> affected.
          </p>
        </div>
      </section>

      {/* ── VERSE INTERLUDE (oversized) ── */}
      <section className="py-20">
        <div className="container-page text-center">
          <Reveal variant="blur">
            <p className="text-3xl font-light italic leading-snug text-[var(--fg)] md:text-5xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              "Honour the Lord with your wealth, with the firstfruits of all your crops."
            </p>
            <p className="eyebrow mt-6">Proverbs 3:9</p>
          </Reveal>
        </div>
      </section>

      {/* ── THE HOLD IN THREE CHAPTERS ── */}
      <section className="container-wide py-12">
        <div className="text-center">
          <p className="eyebrow">The hold, explained honestly</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">Planted seed, <span className="gradient-text">patient harvest</span></h2>
        </div>
        <div className="relative mt-12 grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-gold-light via-cyan-light to-profit md:block" />
          {holdChapters.map((c, i) => (
            <Reveal key={c.n} variant="up" index={i}>
              <div className="relative text-center md:text-left">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-lg font-bold text-[var(--gold)] md:mx-0">
                  {c.n}
                </div>
                <h3 className="mt-4 text-xl font-bold">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal variant="up">
          <div className="card mt-10 p-6 text-center text-sm text-[var(--muted)]">
            <span className="text-[var(--gold)]">Full honesty:</span> withdrawing your deposit before the hold ends carries a 25% fee. Early exits force the AI to unwind positions. Your daily profit is <span className="text-[var(--fg)]">never</span> affected.
          </div>
        </Reveal>
      </section>

      {/* ── CHOOSE YOUR PLAN ── */}
      <section className="container-wide mt-20">
        <div className="text-center">
          <p className="eyebrow">Ready to begin?</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">
            Choose your <span className="gradient-text">path</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
            Same AI. Same honesty. Three sizes of seed. Pick the one that fits your journey and start harvesting today.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
          {/* Faithful */}
          <Link
            href="/register"
            className="group relative overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-soft)] p-8 text-center transition-all duration-300 hover:border-[var(--gold)] hover:shadow-xl hover:shadow-[var(--gold)]/10 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Faithful</p>
            <p className="mt-3 text-4xl font-extrabold text-[var(--fg)]">0.5%</p>
            <p className="text-sm text-[var(--muted)]">per day</p>
            <p className="mt-4 text-sm text-[var(--muted)]">Min. $100</p>
            <div className="mt-6 rounded-xl bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--fg)] transition-colors group-hover:bg-[var(--gold)] group-hover:text-black">
              Plant My Seed
            </div>
          </Link>

          {/* Steward (highlighted) */}
          <Link
            href="/register"
            className="group relative overflow-hidden rounded-2xl border-2 border-[var(--gold)] bg-gradient-to-br from-[var(--gold)]/10 to-transparent p-8 text-center shadow-lg shadow-[var(--gold)]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--gold)]/30 hover:-translate-y-2 md:scale-105"
          >
            <span className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)] px-4 py-1 text-xs font-bold text-black">
              Most Chosen
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">Steward</p>
            <p className="mt-3 text-4xl font-extrabold text-[var(--fg)]">0.75%</p>
            <p className="text-sm text-[var(--muted)]">per day</p>
            <p className="mt-4 text-sm text-[var(--muted)]">Min. $650</p>
            <div className="mt-6 rounded-xl bg-[var(--gold)] px-4 py-3 text-sm font-bold text-black transition-transform group-hover:scale-105">
              Plant My Seed
            </div>
          </Link>

          {/* Ambassador */}
          <Link
            href="/register"
            className="group relative overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-soft)] p-8 text-center transition-all duration-300 hover:border-[var(--gold)] hover:shadow-xl hover:shadow-[var(--gold)]/10 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Ambassador</p>
            <p className="mt-3 text-4xl font-extrabold text-[var(--fg)]">1.0%</p>
            <p className="text-sm text-[var(--muted)]">per day</p>
            <p className="mt-4 text-sm text-[var(--muted)]">Min. $2,000</p>
            <div className="mt-6 rounded-xl bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--fg)] transition-colors group-hover:bg-[var(--gold)] group-hover:text-black">
              Plant My Seed
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          All plans include the free $50 welcome credit, daily profit withdrawals, and full transparency.
        </p>
      </section>

      {/* ── FAQ TEASER ── */}
      <Reveal as="section" variant="up" className="container-page py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 flex w-fit justify-center"><SectionIcon name="book" size={48} /></div>
          <p className="eyebrow">Plan questions</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">Before you <span className="gradient-text">plant</span></h2>
        </div>
        <div className="mt-8 space-y-2">
          {FAQS.slice(0, 3).map((f, i) => (
            <details key={i} className="group card p-4 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between text-sm font-semibold">{f.q}<span className="text-[var(--muted)] transition group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-6 text-center"><a href="/faq" className="text-sm text-[var(--gold)] hover:underline">See all questions</a></div>
      </Reveal>

      {/* ── CTA ── */}
      <Reveal as="section" variant="blur" className="container-wide py-12 text-center">
        <div className="card-grad p-8">
          <h2 className="text-3xl font-bold md:text-5xl">Choose your seed. <span className="gradient-text">Begin the harvest.</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">Start with your free $50 credit, then plant when you're ready.</p>
          <a href="/register" className="btn-primary mt-6 inline-flex">Get $50 free</a>
        </div>
      </Reveal>
    </main>
  );
}
