import { Logo } from "@/components/Logo";
import { Verse } from "@/components/Verse";
import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";
import { HeroLines } from "@/components/HeroLines";
import { StickySteps } from "@/components/StickySteps";
import { FloatingCards } from "@/components/FloatingCards";
import { BentoGrid } from "@/components/BentoGrid";
import { GlowCard } from "@/components/GlowCard";
import { StatsBand } from "@/components/StatsBand";
import { Typewriter } from "@/components/Typewriter";
import { Sparkline } from "@/components/Sparkline";
import { IllGift, IllShield, IllEye, IllIntegrity, IllEngine } from "@/components/Illustrations";
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

const values = [
  { k: "Stewardship", ill: "shield", v: "Capital is a trust. The AI protects your principal and grows it with care." },
  { k: "Clarity", ill: "eye", v: "Every day's profit is shown. You withdraw profit, and your deposit keeps working." },
  { k: "Integrity", ill: "integrity", v: "No hype, no locks on your earnings. Daily profit withdrawals, by design." },
];

const techFeatures = [
  { k: "Live signal engine", ill: "engine", v: "Streams price, volume, order-flow and on-chain data across crypto, US stocks and commodities every second." },
  { k: "Deep forecasting", ill: "engine", v: "LSTM and GRU sequence models read the shape of the market; a Kalman filter keeps volatility estimates honest." },
  { k: "Self-learning execution", ill: "engine", v: "Reinforcement learning picks entry and exit timing, refining itself trade by trade without human emotion." },
  { k: "Risk-parity sizing", ill: "shield", v: "Position size is set against a drawdown guard so no single move can undo your plan." },
  { k: "Full transparency", ill: "eye", v: "Every open and closed trade shows entry, exit, P&L and hold time. Nothing happens in a black box." },
  { k: "Round-the-clock guard", ill: "integrity", v: "The engine and its monitors run continuously, cutting risk the moment limits are reached." },
];

const ILL_MAP: Record<string, () => JSX.Element> = { shield: IllShield, eye: IllEye, integrity: IllIntegrity, engine: IllEngine };

const pipeline = [
  "Signal fusion across price, volume, on-chain and news flow.",
  "Forecasting with LSTM / GRU sequence models and a Kalman volatility filter.",
  "Risk-parity sizing with drawdown guards before any entry.",
  "Execution timed by reinforcement learning, then monitored to close or cut.",
];

const markets = [
  { s: "BTC / USD", p: "$67,241", c: "+2.4%", up: true, pts: [30, 34, 32, 38, 36, 42, 40, 46] },
  { s: "ETH / USD", p: "$3,412", c: "+1.8%", up: true, pts: [20, 24, 22, 26, 25, 29, 28, 33] },
  { s: "S&P 500", p: "5,630", c: "+0.8%", up: true, pts: [40, 41, 39, 43, 42, 44, 43, 46] },
  { s: "Gold (XAU)", p: "$2,389", c: "-0.3%", up: false, pts: [46, 44, 45, 42, 43, 40, 41, 39] },
];

const oldWay = ["Gambling on hype at 2 a.m.", "Fees quietly eating your gains", "Fear making every decision", "Black-box platforms, no answers"];
const newWay = ["AI discipline with guardrails on", "Profit-only withdrawals, any day", "A transparent ledger you can read", "Peace of mind — stewardship, not speculation"];

const voices = [
  { q: "I withdrew my first profit on day two. It felt like manna — small, daily, and faithful.", n: "Grace M.", c: "Lagos" },
  { q: "The transparency changed how our whole fellowship thinks about stewardship.", n: "Pastor Daniel", c: "Nairobi" },
  { q: "No hype. Just daily growth and peace of mind while I run my business.", n: "Sarah K.", c: "Manila" },
];

const WORDS = ["Stewardship", "Integrity", "Clarity", "Discipline", "Transparency", "Faith", "Wisdom", "Peace"];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="container-wide relative flex flex-col items-center pt-12 text-center md:pt-16">
          <span className="pill"><span className="h-2 w-2 animate-pulse rounded-full bg-profit" /> Faith-aligned AI trading · Live 24/7</span>
          <div className="mt-6"><Logo size={280} /></div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href="/register" className="btn-primary">Get $50 free</a>
            <a href="#how" className="btn-ghost">How it works</a>
          </div>
        </div>
        <FloatingCards />
        <HeroLines lines={[<>Fund it.</>, <>The <span className="gradient-text">AI</span> trades.</>, <>You withdraw the <span className="gradient-text">profit.</span></>]} />
      </section>

      <div className="ticker-fade overflow-hidden border-y border-[var(--border)] bg-white/[0.02] py-4">
        <div className="ticker">
          {[...WORDS, ...WORDS].map((w, i) => (
            <span key={i} className="flex items-center gap-8 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              {w} <span className="text-[var(--gold)]">✦</span>
            </span>
          ))}
        </div>
      </div>

      <Reveal as="section" variant="left" className="container-wide py-8">
        <div className="card-grad flex items-center gap-6 p-6">
          <div className="w-28 shrink-0"><IllGift /></div>
          <div>
            <p className="eyebrow">New member gift</p>
            <h2 className="mt-1 text-2xl font-bold">Start with a free <span className="gradient-text">$50 credit</span></h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Every sign-up receives $50 to begin. The AI trades it like any other balance. Fund a plan and your whole balance starts compounding.</p>
          </div>
          <a href="/register" className="btn-gold shrink-0">Claim my $50</a>
        </div>
      </Reveal>

      <div id="how" className="h-[250vh]"><StickySteps steps={steps} /></div>

      <Reveal as="section" variant="up" className="container-wide py-8">
        <StatsBand />
      </Reveal>

      <section className="py-16">
        <div className="container-page">
          <Reveal variant="blur">
            <Verse variant="today" className="text-center" />
          </Reveal>
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 flex w-fit justify-center"><SectionIcon name="bolt" size={48} /></div>
          <p className="eyebrow">Built for the modern age</p>
          <h2 className="section-title mt-2 text-4xl md:text-6xl">A trading desk with <span className="gradient-text">a soul</span></h2>
        </div>
        <div className="mt-10"><BentoGrid /></div>
      </section>

      <section className="container-wide py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 flex w-fit justify-center"><SectionIcon name="bolt" size={48} /></div>
          <p className="eyebrow">The engine under the hood</p>
          <h2 className="section-title mt-2 text-4xl md:text-6xl">Built like a <span className="gradient-text">trading desk</span></h2>
        </div>
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          <Typewriter />
          <ol className="grid gap-3 text-sm text-[var(--muted)]">
            {pipeline.map((p, i) => (
              <Reveal key={i} variant="right" index={i} as="li" className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 p-4">
                <span className="text-[var(--gold)]">{i + 1}.</span> {p}
              </Reveal>
            ))}
          </ol>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {techFeatures.map((t, i) => {
            const Ill = ILL_MAP[t.ill];
            return (
              <Reveal key={t.k} variant="up" index={i}>
                <GlowCard className="h-full p-5">
                  <div className="mb-2 h-14 w-14">{Ill && <Ill />}</div>
                  <p className="font-semibold">{t.k}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{t.v}</p>
                </GlowCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="text-center">
          <p className="eyebrow">What we stand on</p>
          <h2 className="section-title mt-2 text-4xl md:text-6xl">Our <span className="gradient-text">promise</span></h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {values.map((v, i) => {
            const Ill = ILL_MAP[v.ill];
            return (
              <Reveal key={v.k} variant="up" index={i}>
                <GlowCard className="h-full p-5 text-center">
                  <div className="mx-auto mb-2 h-14 w-14">{Ill && <Ill />}</div>
                  <p className="eyebrow">{v.k}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{v.v}</p>
                </GlowCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Live markets</p>
            <h2 className="section-title mt-2 text-3xl md:text-5xl">What the AI is <span className="gradient-text">watching</span></h2>
          </div>
          <a href="/markets" className="btn-ghost">Open full markets</a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {markets.map((m, i) => (
            <Reveal key={m.s} variant="up" index={i}>
              <GlowCard className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{m.s}</p>
                  <span className={`text-xs font-bold ${m.up ? "text-profit" : "text-loss"}`}>{m.c}</span>
                </div>
                <p className="mt-1 text-2xl font-extrabold">{m.p}</p>
                <div className="mt-2"><Sparkline points={m.pts} up={m.up} /></div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="text-center">
          <p className="eyebrow">The difference</p>
          <h2 className="section-title mt-2 text-4xl md:text-6xl">Speculation vs <span className="gradient-text">stewardship</span></h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Reveal variant="left">
            <div className="card h-full border-loss/30 p-6 opacity-80">
              <p className="text-sm font-semibold uppercase tracking-widest text-loss">The old way</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {oldWay.map((o, i) => <li key={i} className="flex gap-2"><span className="text-loss">✕</span>{o}</li>)}
              </ul>
            </div>
          </Reveal>
          <Reveal variant="right">
            <div className="card-grad h-full p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--gold)]">The Kingdom way</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--fg)]">
                {newWay.map((o, i) => <li key={i} className="flex gap-2"><span className="text-profit">✦</span>{o}</li>)}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="text-center">
          <p className="eyebrow">Voices from the flock</p>
          <h2 className="section-title mt-2 text-4xl md:text-6xl">Walked in <span className="gradient-text">faith</span></h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {voices.map((v, i) => (
            <Reveal key={v.n} variant="up" index={i}>
              <GlowCard className="team-verse-card h-full p-5">
                <p className="text-sm leading-relaxed text-[var(--fg)]">"{v.q}"</p>
                <p className="mt-3 text-xs font-semibold text-[var(--gold)]">{v.n} <span className="text-[var(--muted)]">· {v.c}</span></p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal as="section" variant="up" id="tiers" className="container-wide py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 flex w-fit justify-center"><SectionIcon name="seed" size={48} /></div>
          <p className="eyebrow">Plans</p>
          <h2 className="section-title mt-2 text-4xl md:text-6xl">Three ways to <span className="gradient-text">grow</span></h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative flex flex-col rounded-2xl border p-6 transition ${t.highlight ? "border-[var(--gold)] bg-gradient-to-b from-[var(--gold)]/10 to-transparent shadow-gold" : "border-[var(--border)] bg-[var(--card)] hover:-translate-y-1 hover:border-[var(--gold)]"}`}>
              {t.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#0a0e27]">Most chosen</span>}
              <div className={`mb-4 h-1 w-full rounded-full bg-gradient-to-r ${t.accent}`} />
              <h3 className="text-xl font-bold">{t.name}</h3>
              <p className="mt-1 text-xs text-[var(--muted)]">From {t.min}</p>
              <p className="mt-3 text-3xl font-extrabold text-[var(--gold)]">{t.rate}</p>
              <p className="text-xs text-[var(--muted)]">target daily profit</p>
              <p className="mt-3 flex-1 text-xs text-[var(--muted)]">{t.perk}</p>
              <p className="mt-3 border-t border-[var(--border)] pt-2 text-xs italic text-[var(--gold)]">{t.verse}</p>
              <a href="/register" className={`mt-4 ${t.highlight ? "btn-gold" : "btn-ghost"} w-full`}>Start with {t.name}</a>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" variant="up" className="container-page py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 flex w-fit justify-center"><SectionIcon name="book" size={48} /></div>
          <p className="eyebrow">Answers</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">Common <span className="gradient-text">questions</span></h2>
        </div>
        <div className="mt-8 space-y-2">
          {FAQS.slice(0, 5).map((f, i) => (
            <details key={i} className="group card p-4 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between text-sm font-semibold">{f.q}<span className="text-[var(--muted)] transition group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" variant="blur" className="container-wide py-12 text-center">
        <div className="card-grad p-8">
          <h2 className="text-3xl font-bold md:text-5xl">Plant with <span className="gradient-text">intention.</span><br/>Harvest with <span className="gradient-text">peace.</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">Claim your $50 credit and let the AI trade with wisdom. Withdraw your profit each day.</p>
          <a href="/register" className="btn-primary mt-6 inline-flex">Get $50 free</a>
        </div>
      </Reveal>
    </main>
  );
}
