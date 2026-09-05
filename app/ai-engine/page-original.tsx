import Link from "next/link";
import { IllEngine, IllShield, IllEye, IllIntegrity, IllEvaluate, IllCoins } from "@/components/Illustrations";
import { SectionIcon, SectionHeading } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "The AI Trade Engine — KingdomTradeX",
  description:
    "A deep look at the KingdomTradeX AI Trade Engine: the models, the architecture, the guardrails, and the stewardship that governs every decision.",
};

const pipeline = [
  {
    n: "01",
    icon: "evaluate" as const,
    title: "Signal fusion",
    body: "Price, volume, order-flow and on-chain data stream in every second across crypto, US equities and commodities. News and macro feeds are parsed for sentiment and surprise.",
    verse: { text: "The Lord gives wisdom; from his mouth come knowledge and understanding.", ref: "Proverbs 2:6" },
  },
  {
    n: "02",
    icon: "chart" as const,
    title: "Forecasting",
    body: "LSTM and GRU sequence models read the shape of the market across multiple horizons. A Kalman filter keeps volatility estimates honest so the engine never trusts a stale number.",
    verse: { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  },
  {
    n: "03",
    icon: "shield" as const,
    title: "Sizing & guardrails",
    body: "Risk-parity sizing sets each position against a drawdown guard, so no single move can undo your plan. The engine asks not 'how much can we win' but 'how much can we survive'.",
    verse: { text: "The wise store up choice food and olive oil, but fools gulp theirs down.", ref: "Proverbs 21:20" },
  },
  {
    n: "04",
    icon: "pulse" as const,
    title: "Execution & review",
    body: "Reinforcement learning picks entry and exit timing, refining itself trade by trade without human emotion. Every position is then monitored and closed or cut on discipline, not hope.",
    verse: { text: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
  },
];

const stacks = [
  {
    k: "Data spine",
    items: ["Live price, volume and order-book from global venues", "On-chain flows for crypto assets", "Macro and news sentiment parsing", "Alternative signals, seasonality and regime detection"],
  },
  {
    k: "Model layer",
    items: ["LSTM / GRU for sequence forecasting", "Kalman filter for volatility estimation", "Reinforcement learning for execution timing", "Gradient-boosted trees for regime classification"],
  },
  {
    k: "Risk layer",
    items: ["Drawdown guardrails per plan", "Risk-parity position sizing", "Exposure caps across asset classes", "Automatic cut when limits are breached"],
  },
  {
    k: "Transparency layer",
    items: ["Every trade shows entry, exit, P&L and hold time", "Open positions visible in real time", "Plain-language rationale on each decision", "Full withdrawal and profit history"],
  },
];

const promises = [
  { ill: IllShield, k: "Capital is a trust", v: "The engine protects your principal and grows it with care. Guardrails are not an afterthought; they are the first line of every decision." },
  { ill: IllEye, k: "Nothing in a black box", v: "Every open and closed trade shows its entry, exit, P&L and hold time. You see what the engine sees, and what it did with it." },
  { ill: IllIntegrity, k: "Profit, not pressure", v: "You withdraw profit daily; your deposit keeps working. No locks on your earnings, no hype, no fear-based calls." },
];

export default function AIEnginePage() {
  return (
    <>
      <main className="container-page py-16">
        {/* HERO */}
        <Reveal as="section" variant="right" className="relative overflow-hidden">
          <div className="relative flex flex-col items-center gap-10 py-12 text-center md:flex-row">
            <div className="flex-1 text-center">
              <span className="pill">
                <span className="h-2 w-2 rounded-full bg-cyan-light" />
                The AI Trade Engine
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                An engine built on <span className="gradient-text">wisdom,</span>
                <br className="hidden md:block" /> not <span className="gradient-text">hype.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-[var(--muted)] md:mx-0">
                KingdomTradeX pairs serious engineering with the oldest form of financial
                discipline: stewardship. The AI Trade Engine fuses live market data with
                sequence forecasting, risk-parity sizing and round-the-clock guardrails
                so that growth is pursued with patience and protection.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <Link href="/ai-trading" className="btn-primary">
                  Open the live terminal
                </Link>
                <Link href="/plans" className="btn-ghost">
                  See the plans
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative mx-auto grid w-72 place-items-center md:w-80">
                <div className="engine-halo" />
                <div className="relative h-72 w-72 md:h-80 md:w-80">
                  <div className="absolute inset-0 rounded-full border border-[var(--gold)]/20" />
                  <div className="absolute inset-3 rounded-full border border-[var(--cyan)]/15" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="h-[88%] w-[88%]">
                      <IllEngine />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* WHAT IT IS */}
        <Reveal as="section" variant="up" className="mt-8">
          <div className="card-grad p-8 md:p-10">
            <div className="mb-4">
              <SectionIcon name="engine" size={56} />
            </div>
            <p className="eyebrow">What it is</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              A trading desk that <span className="gradient-text">never sleeps</span>
            </h2>
            <p className="mt-4 max-w-3xl text-[var(--muted)]">
              The AI Trade Engine is a layered system that watches crypto, US stocks and
              commodities around the clock. It fuses thousands of signals a second, forms
              a view of each market, sizes positions with discipline, and executes with
              the patience of a steward rather than the impulse of a gambler. Every
              decision is logged, every trade is visible, and every guardrail is on by
              default.
            </p>
            <blockquote className="mt-6 border-l-2 border-[var(--gold)] pl-4 text-[var(--fg)]">
              &ldquo;The Lord gives wisdom; from his mouth come knowledge and understanding.&rdquo;
              <span className="mt-1 block text-sm text-[var(--gold)]">— Proverbs 2:6</span>
            </blockquote>
          </div>
        </Reveal>

        {/* PIPELINE */}
        <Reveal as="section" variant="up" className="mt-20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="compass" size={56} />
            </div>
            <p className="eyebrow">The pipeline</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              From <span className="gradient-text">raw data</span> to a <span className="gradient-text">disciplined trade</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((p) => (
              <div key={p.n} className="card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="h-12 w-12"><SectionIcon name={p.icon} size={48} animate={false} /></span>
                  <span className="font-mono text-xs text-[var(--muted)]">{p.n}</span>
                </div>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{p.body}</p>
                <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs italic text-[var(--gold)]">
                  &ldquo;{p.verse.text}&rdquo; — {p.verse.ref}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* TECH STACK */}
        <Reveal as="section" variant="up" className="mt-20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="bolt" size={56} />
            </div>
            <p className="eyebrow">Under the hood</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              The <span className="gradient-text">technology</span> stack
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stacks.map((s) => (
              <div key={s.k} className="card p-6">
                <p className="text-sm font-semibold text-[var(--gold)]">{s.k}</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                  {s.items.map((it, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[var(--gold)]">›</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        {/* PROMISE */}
        <Reveal as="section" variant="right" className="mt-20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="cross" size={56} />
            </div>
            <p className="eyebrow">The stewardship</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              Technology, held to a <span className="gradient-text">higher standard</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {promises.map((p, i) => {
              const Ill = p.ill;
              return (
                <div key={i} className="card p-6">
                  <div className="mb-4 h-20 w-20">
                    <Ill />
                  </div>
                  <p className="text-lg font-semibold">{p.k}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{p.v}</p>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* COINS / GROWTH CTA */}
        <Reveal as="section" variant="left" className="mt-20">
          <div className="card-grad flex flex-col items-center gap-6 p-10 text-center md:flex-row md:text-left">
            <div className="w-44 shrink-0">
              <IllCoins />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold">
                Watch it <span className="gradient-text">work in real time</span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[var(--muted)] md:mx-0">
                The terminal shows live candles, the order book, open positions and daily
                profit compounding before your eyes. Step inside and see the engine trade
                with the same discipline described here.
              </p>
              <Link href="/ai-trading" className="btn-primary mt-6 inline-flex">
                Open the live terminal
              </Link>
            </div>
          </div>
        </Reveal>

        {/* CLOSING VERSE */}
        <Reveal as="section" variant="scale" className="mt-16">
          <blockquote className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--card)] p-6 text-center">
            <p className="text-lg leading-relaxed text-[var(--fg)]">
              &ldquo;Be faithful with the little things, and you will be trusted with much.&rdquo;
            </p>
            <p className="mt-2 text-sm text-[var(--gold)]">— Luke 16:10</p>
          </blockquote>
        </Reveal>
      </main>
    </>
  );
}
