import { Logo } from "@/components/Logo";
import { Verse } from "@/components/Verse";
import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";
import { HeroLines } from "@/components/HeroLines";
import { StickySteps } from "@/components/StickySteps";
import { FloatingCards } from "@/components/FloatingCards";
import { BentoGrid } from "@/components/BentoGrid";
import { FAQS } from "@/lib/faqs";

const steps = [
  { num: "01", title: "Claim your $50 gift", body: "Every new account starts with a free $50 trading credit. No deposit is needed to begin.", glyph: "✦", color: "#F5C97B" },
  { num: "02", title: "Choose a plan", body: "Pick Faithful, Steward or Ambassador. Your deposit opens the AI desk and sets your daily profit rate.", glyph: "◈", color: "#A855F7" },
  { num: "03", title: "The AI trades for you", body: "Our models work around the clock across crypto, US stocks and commodities, with discipline and guardrails.", glyph: "⇄", color: "#22D3EE" },
  { num: "04", title: "Watch profit grow", body: "Profit accrues daily and is shown in plain sight. Withdraw your profit, never your principal, whenever you like.", glyph: "↗", color: "#34D399" },
];

const tiers = [
  { name: "Faithful", min: "$100 to $500", rate: "0.5% / day", perk: "Crypto, US stocks and commodities. Starter AI, daily profit, profit-only withdrawals.", verse: "Be faithful with the little things, and you will be trusted with much. — Luke 16:10", hold: "6-month hold, 25% early fee", accent: "from-amber-600 to-gold-light", highlight: false },
  { name: "Steward", min: "$650 to $1,500", rate: "0.75% / day", perk: "Advanced AI across all markets, priority rebalancing, 0.75% target daily.", verse: "Stewards of the manifold grace of God. — 1 Peter 4:10", hold: "9-month hold, 25% early fee", accent: "from-slate-400 to-cyan-light", highlight: true },
  { name: "Ambassador", min: "$2,000 and up", rate: "1.0% / day", perk: "Elite AI desk, dedicated risk guardrails across all markets, 1.0% target daily.", verse: "Honour the Lord with your wealth, with the firstfruits of all your crops. — Proverbs 3:9", hold: "12-month hold, 25% early fee", accent: "from-yellow-400 to-gold-light", highlight: false },
];

export default function Home() {
  return (
    <main>
      {/* CINEMATIC HERO */}
      <section className="relative overflow-hidden">
        <div className="container-wide relative flex flex-col items-center pt-16 text-center md:pt-20">
          <span className="pill"><span className="h-2 w-2 animate-pulse rounded-full bg-profit" /> Faith-aligned AI trading · Live 24/7</span>
          <div className="mt-8"><Logo size={320} /></div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href="/register" className="btn-primary">Get $50 free</a>
            <a href="#how" className="btn-ghost">How it works</a>
          </div>
        </div>
        <FloatingCards />
        <HeroLines
          lines={[
            <>Fund it.</>,
            <>The <span className="gradient-text">AI</span> trades.</>,
            <>You withdraw the <span className="gradient-text">profit.</span></>,
          ]}
        />
      </section>

      {/* STICKY SCROLLYTELLING */}
      <div id="how"><StickySteps steps={steps} /></div>

      {/* VERSE INTERLUDE */}
      <Reveal as="section" variant="blur" className="container-page py-24">
        <Verse variant="today" className="text-center" />
      </Reveal>

      {/* BENTO GRID */}
      <section className="container-wide py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="bolt" size={56} /></div>
          <p className="eyebrow">Built for the modern age</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">A trading desk with <span className="gradient-text">a soul</span></h2>
        </div>
        <div className="mt-12"><BentoGrid /></div>
      </section>

      {/* TIERS */}
      <Reveal as="section" variant="up" id="tiers" className="container-wide py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="seed" size={56} /></div>
          <p className="eyebrow">Plans</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">Three ways to <span className="gradient-text">grow</span></h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative flex flex-col rounded-2xl border p-7 transition ${t.highlight ? "border-[var(--gold)] bg-gradient-to-b from-[var(--gold)]/10 to-transparent shadow-gold" : "border-[var(--border)] bg-[var(--card)] hover:-translate-y-1 hover:border-[var(--gold)]"}`}>
              {t.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#0a0e27]">Most chosen</span>}
              <div className={`mb-5 h-1.5 w-full rounded-full bg-gradient-to-r ${t.accent}`} />
              <h3 className="text-xl font-bold">{t.name}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">From {t.min}</p>
              <p className="mt-4 text-3xl font-extrabold text-[var(--gold)]">{t.rate}</p>
              <p className="text-xs text-[var(--muted)]">target daily profit</p>
              <p className="mt-4 flex-1 text-sm text-[var(--muted)]">{t.perk}</p>
              <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs italic text-[var(--gold)]">{t.verse}</p>
              <p className="mt-3 text-xs text-[var(--muted)]">Deposit withdrawable any time. Before the {t.hold}, a 25% fee applies. After it, withdraw in full, no fee.</p>
              <a href="/register" className={`mt-6 ${t.highlight ? "btn-gold" : "btn-ghost"} w-full`}>Start with {t.name}</a>
            </div>
          ))}
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal as="section" variant="up" className="container-page py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="book" size={56} /></div>
          <p className="eyebrow">Answers</p>
          <h2 className="section-title mt-2 text-3xl md:text-4xl">Common <span className="gradient-text">questions</span></h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.slice(0, 5).map((f, i) => (
            <details key={i} className="group card p-5 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between font-semibold">{f.q}<span className="text-[var(--muted)] transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-sm text-[var(--muted)]">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-6 text-center"><a href="/faq" className="text-sm text-[var(--gold)] hover:underline">See all questions</a></div>
      </Reveal>

      {/* CTA */}
      <Reveal as="section" variant="blur" className="container-wide py-20 text-center">
        <div className="card-grad p-10">
          <h2 className="text-3xl font-bold md:text-4xl">Plant with <span className="gradient-text">intention.</span> Harvest with <span className="gradient-text">peace.</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">Claim your $50 credit and let the AI trade with wisdom. Withdraw your profit each day.</p>
          <a href="/register" className="btn-primary mt-8 inline-flex">Get $50 free</a>
        </div>
      </Reveal>
    </main>
  );
}
