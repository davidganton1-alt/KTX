import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";
import { FAQS } from "@/lib/faqs";

export const metadata = { title: "Plans — KingdomTradeX" };

const lineup = [
  {
    name: "Faithful", rate: "0.5%", min: "$100 – $500", hold: "6-month hold", hl: false,
    bullets: ["Crypto, US stocks & commodities", "Starter AI desk", "Daily profit, withdraw anytime"],
    verse: "Be faithful with the little things. — Luke 16:10",
  },
  {
    name: "Steward", rate: "0.75%", min: "$650 – $1,500", hold: "9-month hold", hl: true,
    bullets: ["All markets unlocked", "Advanced AI + priority rebalancing", "Profit-only withdrawals"],
    verse: "Stewards of the manifold grace of God. — 1 Peter 4:10",
  },
  {
    name: "Ambassador", rate: "1.0%", min: "$2,000 and up", hold: "12-month hold", hl: false,
    bullets: ["Elite AI desk", "Dedicated risk guardrails", "Largest daily target"],
    verse: "Honour the Lord with your wealth. — Proverbs 3:9",
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
  { n: "I", t: "Planted", d: "Day zero. Your seed goes into the soil — the AI desk opens and begins trading with guardrails on." },
  { n: "II", t: "Harvest daily", d: "Every day, profit accrues and is withdrawable. The hold never touches your harvest — only the seed." },
  { n: "III", t: "Released", d: "When the hold ends, your full deposit unlocks. Withdraw everything — no fee, no friction." },
];

export default function PlansPage() {
  return (
    <main>
      {/* ── HERO ── */}
      <section className="container-wide pt-16 text-center md:pt-24">
        <p className="eyebrow">Plans</p>
        <h1 className="section-title mt-3 text-5xl md:text-7xl">How much will you <span className="gradient-text">plant</span>?</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[var(--muted)]">
          Same AI. Same honesty. Three sizes of seed — each with its own daily target and harvest rhythm.
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
                <p className="eyebrow">{p.name}</p>
                <p className={`mt-5 text-6xl font-extrabold tracking-tight md:text-7xl ${p.hl ? "gradient-text" : ""}`}>{p.rate}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">target / day</p>
                <p className="mt-3 text-sm text-[var(--muted)]">{p.min}</p>
                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
                <ul className="flex-1 space-y-2.5 text-left text-sm text-[var(--muted)]">
                  {p.bullets.map((b) => <li key={b} className="flex gap-2.5"><span className="text-[var(--gold)]">✦</span>{b}</li>)}
                </ul>
                <p className="mt-5 text-xs italic leading-relaxed text-[var(--gold)]">{p.verse}</p>
                <p className="mt-1.5 text-xs text-[var(--muted)]">{p.hold} · 25% early fee</p>
                <a href="/register" className={`${p.hl ? "btn-gold" : "btn-ghost"} mt-6 w-full`}>Start with {p.name}</a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── COMPARISON (grouped, sticky header, desktop) ── */}
      <section className="container-wide hidden py-12 md:block" id="compare">
        <div className="text-center">
          <p className="eyebrow">Compare</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">Every plan, <span className="gradient-text">side by side</span></h2>
        </div>

        <div className="mt-10">
          {/* sticky glass bar */}
          <div className="glass sticky top-0 z-30 border-b border-[var(--border)]">
            <div className="grid grid-cols-[1.1fr_repeat(3,1fr)] items-center gap-3 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">The plans</p>
              {lineup.map((p) => (
                <div key={p.name} className="text-center">
                  <p className="text-sm font-bold">{p.name} <span className="text-[var(--gold)]">· {p.rate}</span></p>
                  <a href="/register" className={`${p.hl ? "btn-gold" : "btn-ghost"} mt-1.5 inline-flex !px-4 !py-1 text-xs`}>Start</a>
                </div>
              ))}
            </div>
          </div>

          {groups.map((g, gi) => (
            <div key={g.name}>
              <Reveal variant="up">
                <div className="grid grid-cols-[1.1fr_repeat(3,1fr)] px-4 pb-1 pt-9">
                  <p className="eyebrow">{gi + 1 === 1 ? "I" : gi + 1 === 2 ? "II" : "III"} · {g.name}</p>
                </div>
              </Reveal>
              {g.rows.map((r, ri) => (
                <Reveal key={r.label} variant="up" index={ri}>
                  <div className="grid grid-cols-[1.1fr_repeat(3,1fr)] gap-3 border-b border-[var(--border)] px-4 py-4">
                    <p className="text-sm text-[var(--muted)]">{r.label}</p>
                    {r.v.map((val, i) => (
                      <p key={i} className={`text-sm ${i === 1 ? "rounded-lg bg-[var(--gold)]/[0.05] px-2 py-1 font-semibold text-[var(--gold)]" : ""}`}>{val}</p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          ))}
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
            <span className="text-[var(--gold)]">Full honesty:</span> withdrawing your deposit before the hold ends carries a 25% fee — early exits force the AI to unwind positions. Your daily profit is <span className="text-[var(--fg)]">never</span> affected.
          </div>
        </Reveal>
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
