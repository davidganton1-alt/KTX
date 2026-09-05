import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";
import { FAQS } from "@/lib/faqs";

export const metadata = { title: "Plans — KingdomTradeX" };

const tiers = [
  { name: "Faithful", min: "$100 to $500", rate: "0.5% / day", perk: "Crypto, US stocks and commodities. Starter AI, daily profit, profit-only withdrawals.", verse: "Be faithful with the little things, and you will be trusted with much. — Luke 16:10", hold: "6-month hold, 25% early fee", accent: "from-amber-600 to-gold-light", highlight: false },
  { name: "Steward", min: "$650 to $1,500", rate: "0.75% / day", perk: "Advanced AI across all markets, priority rebalancing, 0.75% target daily.", verse: "Stewards of the manifold grace of God. — 1 Peter 4:10", hold: "9-month hold, 25% early fee", accent: "from-slate-400 to-cyan-light", highlight: true },
  { name: "Ambassador", min: "$2,000 and up", rate: "1.0% / day", perk: "Elite AI desk, dedicated risk guardrails across all markets, 1.0% target daily.", verse: "Honour the Lord with your wealth, with the firstfruits of all your crops. — Proverbs 3:9", hold: "12-month hold, 25% early fee", accent: "from-yellow-400 to-gold-light", highlight: false },
];

const choose = [
  { tier: "Faithful", t: "Start small, learn the rhythm", d: "Plant your first $100 and watch daily profit accrue under the Starter AI." },
  { tier: "Steward", t: "Grow steadily, day by day", d: "Advanced AI, priority rebalancing, and a 0.75% daily target." },
  { tier: "Ambassador", t: "Build a legacy position", d: "The Elite AI desk with dedicated guardrails and a 1.0% daily target." },
];

const rows = [
  { label: "Deposit range", v: ["$100 – $500", "$650 – $1,500", "$2,000 and up"] },
  { label: "Target daily profit", v: ["0.5%", "0.75%", "1.0%"] },
  { label: "Markets", v: ["Crypto, US stocks, commodities", "All markets", "All markets"] },
  { label: "AI desk", v: ["Starter AI", "Advanced AI", "Elite AI desk"] },
  { label: "Rebalancing", v: ["Daily", "Priority", "Dedicated"] },
  { label: "Risk guardrails", v: ["Standard", "Advanced", "Dedicated"] },
  { label: "Profit withdrawals", v: ["Anytime", "Anytime", "Anytime"] },
  { label: "Trade transparency", v: ["Full ledger", "Full ledger", "Full ledger"] },
  { label: "Hold period", v: ["6 months", "9 months", "12 months"] },
  { label: "Early deposit withdrawal", v: ["25% fee", "25% fee", "25% fee"] },
];

export default function PlansPage() {
  return (
    <main>
      {/* ── HERO ── */}
      <section className="container-wide pt-14 text-center md:pt-20">
        <div className="mx-auto mb-3 flex w-fit justify-center"><SectionIcon name="seed" size={48} /></div>
        <p className="eyebrow">Plans</p>
        <h1 className="section-title mt-2 text-4xl md:text-6xl">Three ways to <span className="gradient-text">grow</span>.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Every plan keeps profit-only withdrawals and full transparency. What changes is the size of the seed, the strength of the AI desk, and the daily target.
        </p>
      </section>

      {/* ── TIER CARDS ── */}
      <section className="container-wide py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} variant="up" index={i}>
              <div className={`relative flex h-full flex-col rounded-2xl border p-6 transition ${t.highlight ? "border-[var(--gold)] bg-gradient-to-b from-[var(--gold)]/10 to-transparent shadow-gold" : "border-[var(--border)] bg-[var(--card)] hover:-translate-y-1 hover:border-[var(--gold)]"}`}>
                {t.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#0a0e27]">Most chosen</span>}
                <div className={`mb-4 h-1 w-full rounded-full bg-gradient-to-r ${t.accent}`} />
                <h2 className="text-xl font-bold">{t.name}</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">From {t.min}</p>
                <p className="mt-3 text-3xl font-extrabold text-[var(--gold)]">{t.rate}</p>
                <p className="text-xs text-[var(--muted)]">target daily profit</p>
                <p className="mt-3 flex-1 text-sm text-[var(--muted)]">{t.perk}</p>
                <p className="mt-3 border-t border-[var(--border)] pt-2 text-xs italic text-[var(--gold)]">{t.verse}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">{t.hold}</p>
                <a href="/register" className={`mt-4 ${t.highlight ? "btn-gold" : "btn-ghost"} w-full`}>Start with {t.name}</a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW TO CHOOSE ── */}
      <section className="container-wide py-8">
        <Reveal variant="up">
          <div className="card-grad grid gap-6 p-6 md:grid-cols-3 md:p-8">
            {choose.map((c) => (
              <div key={c.tier}>
                <p className="eyebrow">{c.tier}</p>
                <p className="mt-1 font-semibold">{c.t}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{c.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── COMPARISON (Apple style, sticky header, desktop) ── */}
      <section className="container-wide hidden py-12 md:block" id="compare">
        <div className="text-center">
          <p className="eyebrow">Compare</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">Every plan, <span className="gradient-text">side by side</span></h2>
        </div>

        <div className="mt-10">
          {/* sticky glass bar */}
          <div className="glass sticky top-0 z-30 border-b border-[var(--border)]">
            <div className="grid grid-cols-[1.1fr_repeat(3,1fr)] gap-3 px-4 py-3">
              <div />
              {tiers.map((t) => (
                <div key={t.name} className="text-center">
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-[var(--gold)]">{t.rate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* guiding verse row */}
          <div className="grid grid-cols-[1.1fr_repeat(3,1fr)] gap-3 border-b border-[var(--border)] px-4 py-5">
            <p className="text-sm text-[var(--muted)]">Guiding verse</p>
            {tiers.map((t) => <p key={t.name} className="text-xs italic leading-relaxed text-[var(--gold)]">{t.verse}</p>)}
          </div>

          {/* data rows */}
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[1.1fr_repeat(3,1fr)] gap-3 border-b border-[var(--border)] px-4 py-4">
              <p className="text-sm text-[var(--muted)]">{r.label}</p>
              {r.v.map((val, i) => (
                <p key={i} className={`text-sm ${i === 1 ? "rounded-lg bg-[var(--gold)]/[0.05] px-2 py-1 font-semibold text-[var(--gold)]" : ""}`}>{val}</p>
              ))}
            </div>
          ))}

          {/* bottom CTA row */}
          <div className="grid grid-cols-[1.1fr_repeat(3,1fr)] gap-3 px-4 py-6">
            <div />
            {tiers.map((t) => (
              <div key={t.name} className="text-center">
                <a href="/register" className={`${t.highlight ? "btn-gold" : "btn-ghost"} w-full`}>Start {t.name}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOLD, EXPLAINED HONESTLY ── */}
      <section className="container-wide py-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal variant="left">
            <p className="eyebrow">The hold, explained honestly</p>
            <h2 className="section-title mt-2 text-3xl md:text-5xl">Planted seed, <span className="gradient-text">patient harvest</span></h2>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex gap-3"><span className="text-profit">✦</span> Your profit is withdrawable every day — the hold never touches it.</li>
              <li className="flex gap-3"><span className="text-profit">✦</span> Before the hold ends, withdrawing your deposit carries a 25% fee.</li>
              <li className="flex gap-3"><span className="text-profit">✦</span> After the hold ends, withdraw your full deposit — no fee, no friction.</li>
            </ul>
          </Reveal>
          <Reveal variant="right">
            <div className="card p-6 md:p-8">
              <div className="relative">
                <div className="absolute left-3 right-3 top-3 h-0.5 bg-gradient-to-r from-gold-light via-cyan-light to-profit" />
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center text-center">
                    <span className="h-6 w-6 rounded-full bg-gold-light shadow-gold" />
                    <p className="mt-2 text-xs font-semibold">Day 0</p>
                    <p className="max-w-[90px] text-[10px] text-[var(--muted)]">Seed planted</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="h-6 w-6 rounded-full bg-cyan-light" />
                    <p className="mt-2 text-xs font-semibold">Every day</p>
                    <p className="max-w-[90px] text-[10px] text-[var(--muted)]">Profit withdrawable</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="h-6 w-6 rounded-full bg-profit" />
                    <p className="mt-2 text-xs font-semibold">Hold ends</p>
                    <p className="max-w-[90px] text-[10px] text-[var(--muted)]">Full deposit, no fee</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center text-xs text-[var(--muted)]">The hold keeps the AI's strategy stable — and your harvest predictable.</p>
            </div>
          </Reveal>
        </div>
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
          <h2 className="text-3xl font-bold md:text-5xl">Choose your plan. <span className="gradient-text">Begin the harvest.</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">Start with your free $50 credit, then plant your seed when you're ready.</p>
          <a href="/register" className="btn-primary mt-6 inline-flex">Get $50 free</a>
        </div>
      </Reveal>
    </main>
  );
}
