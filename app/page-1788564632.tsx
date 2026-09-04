import { Logo } from "@/components/Logo";
import { Verse } from "@/components/Verse";
import { FAQS } from "@/lib/faqs";
import {
  IllGift,
  IllCoins,
  IllEngine,
  IllGrowth,
  IllShield,
  IllEye,
  IllIntegrity,
  IllEvaluate,
} from "@/components/Illustrations";
import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";

const how = [
  {
    step: "01",
    title: "Claim your $50 gift",
    body: "Every new account starts with a free $50 trading credit. No deposit is needed to begin.",
    accent: "from-gold-light to-royal-violet",
    icon: "✦",
    ill: "gift",
  },
  {
    step: "02",
    title: "Choose a plan",
    body: "Pick Faithful, Steward or Ambassador. Your deposit opens the AI desk and sets your daily profit rate.",
    accent: "from-royal-violet to-cyan-light",
    icon: "◈",
    ill: "coins",
  },
  {
    step: "03",
    title: "The AI trades for you",
    body: "Our models work around the clock across crypto, US stocks and commodities, with discipline and guardrails.",
    accent: "from-cyan-light to-gold-light",
    icon: "⇄",
    ill: "engine",
  },
  {
    step: "04",
    title: "Watch profit grow",
    body: "Profit accrues daily and is shown in plain sight. Withdraw your profit, never your principal, whenever you like.",
    accent: "from-royal-violet to-gold-light",
    icon: "↗",
    ill: "growth",
  },
];

const tiers = [
  {
    name: "Faithful",
    min: "$100 to $500",
    rate: "0.5% / day",
    perk: "Crypto, US stocks and commodities. Starter AI, daily profit, profit-only withdrawals.",
    verse: "Be faithful with the little things, and you will be trusted with much. — Luke 16:10",
    hold: "6-month hold, 25% early fee",
    accent: "from-amber-600 to-gold-light",
    highlight: false,
  },
  {
    name: "Steward",
    min: "$650 to $1,500",
    rate: "0.75% / day",
    perk: "Advanced AI across all markets, priority rebalancing, 0.75% target daily.",
    verse: "Stewards of the manifold grace of God. — 1 Peter 4:10",
    hold: "9-month hold, 25% early fee",
    accent: "from-slate-400 to-cyan-light",
    highlight: true,
  },
  {
    name: "Ambassador",
    min: "$2,000 and up",
    rate: "1.0% / day",
    perk: "Elite AI desk, dedicated risk guardrails across all markets, 1.0% target daily.",
    verse: "Honour the Lord with your wealth, with the firstfruits of all your crops. — Proverbs 3:9",
    hold: "12-month hold, 25% early fee",
    accent: "from-yellow-400 to-gold-light",
    highlight: false,
  },
];

const ILL_MAP: Record<string, () => JSX.Element> = {
  gift: IllGift,
  coins: IllCoins,
  engine: IllEngine,
  growth: IllGrowth,
  shield: IllShield,
  eye: IllEye,
  integrity: IllIntegrity,
  evaluate: IllEvaluate,
};

const values = [
  { k: "Stewardship", ill: "shield", v: "Capital is a trust. The AI protects your principal and grows it with care." },
  { k: "Clarity", ill: "eye", v: "Every day's profit is shown. You withdraw profit, and your deposit keeps working." },
  { k: "Integrity", ill: "integrity", v: "No hype, no locks on your earnings. Daily profit withdrawals, by design." },
];

const techFeatures = [
  { k: "Live signal engine", icon: "⇄", ill: "evaluate", v: "Streams price, volume, order-flow and on-chain data across crypto, US stocks and commodities every second." },
  { k: "Deep forecasting", icon: "◈", ill: "engine", v: "LSTM and GRU sequence models read the shape of the market; a Kalman filter keeps volatility estimates honest." },
  { k: "Self-learning execution", icon: "⚡", ill: "engine", v: "Reinforcement learning picks entry and exit timing, refining itself trade by trade without human emotion." },
  { k: "Risk-parity sizing", icon: "⚖", ill: "shield", v: "Position size is set against a drawdown guard so no single move can undo your plan." },
  { k: "Full transparency", icon: "▦", ill: "eye", v: "Every open and closed trade shows entry, exit, P&L and hold time. Nothing happens in a black box." },
  { k: "Round-the-clock guard", icon: "◍", ill: "integrity", v: "The engine and its monitors run continuously, cutting risk the moment limits are reached." },
];

export default function Home() {
  return (
    <>
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="container-wide relative mx-auto flex max-w-5xl flex-col items-center gap-12 py-20 md:flex-row md:py-28">
            <div className="flex-1 text-center">
              <span className="pill">
                <span className="h-2 w-2 rounded-full bg-profit" />
                Faith-aligned AI trading
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                Fund it. The <span className="gradient-text">AI trades.</span>
                <br className="hidden md:block" /> You withdraw the{" "}
                <span className="gradient-text">profit.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-[var(--muted)]">
                KingdomTradeX puts AI to work on your savings around the clock. Start
                with a free $50 credit, grow daily profit automatically, and take
                your earnings out every day with wisdom, not pressure.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <a href="/register" className="btn-primary">
                  Get $50 free
                </a>
                <a href="#how" className="btn-ghost">
                  How it works
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-2"><span className="text-[var(--gold)]">●</span> Crypto · Stocks · Commodities</span>
                <span className="flex items-center gap-2"><span className="text-[var(--gold)]">●</span> Daily profit, withdraw anytime</span>
                <span className="flex items-center gap-2"><span className="text-[var(--gold)]">●</span> Full trade transparency</span>
              </div>
            </div>

            <div className="flex-1 logo-glow">
              <Logo size={380} />
            </div>
          </div>
        </section>

        {/* GIFT BANNER */}
        <Reveal as="section" variant="left" className="container-wide">
          <div className="card-grad flex flex-col items-center gap-6 p-8 text-center md:flex-row md:p-10 md:text-left">
            <div className="order-2 w-40 shrink-0 md:order-1">
              <IllGift />
            </div>
            <div className="order-1 md:order-2">
              <p className="eyebrow">New member gift</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Start with a free <span className="gradient-text">$50 credit</span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[var(--muted)] md:mx-0">
                Every sign-up receives $50 to begin. The AI trades it like any other
                balance, yet you can only withdraw the profit on this credit once
                you add your own funds to a plan. Fund a plan and your whole balance
                starts compounding.
              </p>
              <a href="/register" className="btn-gold mt-6 inline-flex">Claim my $50</a>
            </div>
          </div>
        </Reveal>

        {/* VERSE */}
        <Reveal as="section" variant="scale" className="container-wide">
          <Verse variant="random" className="text-center" />
        </Reveal>

        {/* HOW IT WORKS */}
        <Reveal as="section" variant="up" id="how" className="container-wide py-24">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="compass" size={56} />
            </div>
            <p className="eyebrow">The path</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              How <span className="gradient-text">KingdomTradeX</span> works
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {how.map((h) => {
              const Ill = ILL_MAP[h.ill];
              return (
                <div key={h.step} className="card p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="h-16 w-16">{Ill && <Ill />}</span>
                    <span className="font-mono text-xs text-[var(--muted)]">{h.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{h.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{h.body}</p>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* TIERS */}
        <Reveal as="section" variant="up" id="tiers" className="container-wide py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="seed" size={56} />
            </div>
            <p className="eyebrow">Plans</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              Three ways to <span className="gradient-text">grow</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
              Choose a plan by how much you fund. Higher plans get stronger AI and a
              higher target daily rate. All keep profit-only withdrawals.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition ${
                  t.highlight
                    ? "border-[var(--gold)] bg-gradient-to-b from-[var(--gold)]/10 to-transparent shadow-gold"
                    : "border-[var(--border)] bg-[var(--card)] hover:-translate-y-1 hover:border-[var(--gold)]"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#0a0e27]">
                    Most chosen
                  </span>
                )}
                <div className={`mb-5 h-1.5 w-full rounded-full bg-gradient-to-r ${t.accent}`} />
                <h3 className="text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">From {t.min}</p>
                <p className="mt-4 text-3xl font-extrabold text-[var(--gold)]">{t.rate}</p>
                <p className="text-xs text-[var(--muted)]">target daily profit</p>
                <p className="mt-4 flex-1 text-sm text-[var(--muted)]">{t.perk}</p>
                <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs italic text-[var(--gold)]">
                  {t.verse}
                </p>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Deposit withdrawable any time. Before the {t.hold}, a 25% fee applies. After it, withdraw in full, no fee.
                </p>
                <a href="/register" className={`mt-6 ${t.highlight ? "btn-gold" : "btn-ghost"} w-full`}>
                  Start with {t.name}
                </a>
              </div>
            ))}
          </div>
        </Reveal>

        {/* VALUES */}
        <Reveal as="section" variant="right" id="values" className="container-wide py-24">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="shield" size={56} />
            </div>
            <p className="eyebrow">What we stand on</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              Our <span className="gradient-text">promise</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((v) => {
              const Ill = ILL_MAP[v.ill];
              return (
                <blockquote key={v.k} className="card p-6">
                  <div className="mb-3 h-16 w-16">{Ill && <Ill />}</div>
                  <p className="eyebrow">{v.k}</p>
                  <p className="mt-3 text-[var(--muted)]">{v.v}</p>
                </blockquote>
              );
            })}
          </div>
        </Reveal>

        {/* ENGINE TECH */}
        <Reveal as="section" variant="up" className="container-wide py-24">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="bolt" size={56} />
            </div>
            <p className="eyebrow">The engine under the hood</p>
            <h2 className="section-title mt-3 text-3xl md:text-4xl">
              Built like a <span className="gradient-text">trading desk</span> for the modern age
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
              KingdomTradeX pairs time-tested stewardship with serious engineering. Every position is chosen, sized and watched by models that never sleep, and you can see each decision in full.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {techFeatures.map((t) => {
              const Ill = ILL_MAP[t.ill];
              return (
                <div key={t.k} className="card p-6">
                  <div className="mb-3 h-16 w-16">{Ill && <Ill />}</div>
                  <p className="font-semibold">{t.k}</p>
                  <p className="mt-3 text-sm text-[var(--muted)]">{t.v}</p>
                </div>
              );
            })}
          </div>

          <div className="card mt-6 p-6 md:p-8">
            <p className="font-semibold">How the AI evaluates a trade</p>
            <ol className="mt-4 grid gap-4 text-sm text-[var(--muted)] md:grid-cols-4">
              <li className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 p-4"><span className="text-[var(--gold)]">1.</span> Signal fusion across price, volume, on-chain and news flow.</li>
              <li className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 p-4"><span className="text-[var(--gold)]">2.</span> Forecasting with LSTM / GRU sequence models and a Kalman volatility filter.</li>
              <li className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 p-4"><span className="text-[var(--gold)]">3.</span> Risk-parity sizing with drawdown guards before any entry.</li>
              <li className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 p-4"><span className="text-[var(--gold)]">4.</span> Execution timed by reinforcement learning, then monitored to close or cut.</li>
            </ol>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal as="section" variant="up" className="container-page py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="book" size={56} />
            </div>
            <p className="eyebrow">Answers</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              Common <span className="gradient-text">questions</span>
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.slice(0, 5).map((f, i) => (
              <details key={i} className="group card p-5 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between font-semibold">
                  {f.q}
                  <span className="text-[var(--muted)] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-[var(--muted)]">{f.a? f.a : f.q}</p>
              </details>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="/faq" className="text-sm text-[var(--gold)] hover:underline">
              See all questions
            </a>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal as="section" variant="blur" className="container-wide py-20 text-center">
          <div className="card-grad p-10">
            <h2 className="text-3xl font-bold">
              Plant with <span className="gradient-text">intention.</span> Harvest
              with <span className="gradient-text">peace.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">
              Claim your $50 credit and let the AI trade with wisdom. Withdraw your
              profit each day.
            </p>
            <a href="/register" className="btn-primary mt-8 inline-flex">Get $50 free</a>
            <p className="mt-8 text-xs text-[var(--muted)]">
              Want to see prices move?{" "}
              <a href="/markets" className="text-[var(--gold)] hover:underline">
                Visit the live Markets page
              </a>
            </p>
          </div>
        </Reveal>
      </main>
    </>
  );
}
