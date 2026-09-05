import { IllShield, IllEye, IllIntegrity, IllCoins } from "@/components/Illustrations";
import { Reveal } from "@/components/Reveal";
import { GlowCard } from "@/components/GlowCard";
import { EnginePipeline } from "@/components/EnginePipeline";
import { AiEngineHero } from "@/components/AiEngineHero";

export const metadata = { title: "The AI Engine — KingdomTradeX" };

const stack = [
  { t: "Data spine", pts: ["Live price, volume & order-flow streams", "On-chain and news sentiment feeds", "Crypto, US stocks and commodities in one pipeline"] },
  { t: "Model layer", pts: ["LSTM & GRU sequence forecasting", "Kalman volatility filtering", "Reinforcement-learning execution"] },
  { t: "Risk layer", pts: ["Drawdown guards on every position", "Risk-parity sizing before entry", "Continuous exposure monitoring"] },
  { t: "Transparency layer", pts: ["Every trade logged: entry, exit, P&L", "Hold time and reason visible", "Nothing happens in a black box"] },
];

const promise = [
  { t: "Capital is a trust", d: "Your seed is treated as a sacred trust — protected first, grown second, always with care.", Ill: IllShield },
  { t: "Nothing in a black box", d: "Every decision the AI makes is logged and readable. You see what it sees.", Ill: IllEye },
  { t: "Profit, not pressure", d: "Your harvest is withdrawable daily. No locks on your earnings, ever.", Ill: IllIntegrity },
];

export default function AiEnginePage() {
  return (
    <main>
      {/* ── CINEMATIC HERO ── */}
      <AiEngineHero />

      {/* ── WHAT IT IS ── */}
      <section className="container-page py-28">
        <Reveal variant="blur">
          <div className="text-center">
            <p className="eyebrow">What it is</p>
            <h2 className="section-title mt-3 text-4xl md:text-6xl">A trading desk that <span className="gradient-text">never sleeps</span></h2>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-[var(--muted)]">
              Markets move around the clock, and so does the engine. It watches, forecasts and acts with discipline — without emotion, without fatigue, without cutting corners.
            </p>
          </div>
          <blockquote className="card-grad mx-auto mt-12 max-w-2xl p-10 text-center">
            <p className="text-2xl font-light italic leading-snug text-[var(--fg)]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              "For the LORD giveth wisdom: out of his mouth cometh knowledge and understanding."
            </p>
            <footer className="eyebrow mt-5">Proverbs 2:6</footer>
          </blockquote>
        </Reveal>
      </section>

      {/* ── THE PIPELINE ── */}
      <section className="container-wide pb-6 pt-12 text-center">
        <Reveal variant="up">
          <p className="eyebrow">The pipeline</p>
          <h2 className="section-title mt-3 text-4xl md:text-6xl">From raw data to a <span className="gradient-text">disciplined trade</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--muted)]">Scroll — the engine walks you through every stage.</p>
        </Reveal>
      </section>
      <EnginePipeline />

      {/* ── TECH STACK ── */}
      <section className="container-wide py-28">
        <div className="text-center">
          <Reveal variant="up">
            <p className="eyebrow">Under the hood</p>
            <h2 className="section-title mt-3 text-4xl md:text-6xl">The technology <span className="gradient-text">stack</span></h2>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((s, i) => (
            <Reveal key={s.t} variant="up" index={i}>
              <GlowCard className="h-full p-6">
                <p className="text-lg font-bold">{s.t}</p>
                <ul className="mt-4 space-y-2.5 text-sm text-[var(--muted)]">
                  {s.pts.map((p) => <li key={p} className="flex gap-2.5"><span className="text-[var(--gold)]">›</span>{p}</li>)}
                </ul>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PROMISE ── */}
      <section className="container-wide pb-28 pt-4">
        <div className="text-center">
          <Reveal variant="up">
            <p className="eyebrow">The stewardship</p>
            <h2 className="section-title mt-3 text-4xl md:text-6xl">Technology, held to a <span className="gradient-text">higher standard</span></h2>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {promise.map((p, i) => (
            <Reveal key={p.t} variant="up" index={i}>
              <GlowCard className="h-full p-7 text-center">
                <div className="mx-auto mb-5 h-16 w-16"><p.Ill /></div>
                <h3 className="text-xl font-bold">{p.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{p.d}</p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container-wide pb-28">
        <Reveal variant="blur">
          <div className="card-grad flex flex-col items-center gap-8 p-10 text-center md:flex-row md:text-left">
            <div className="w-32 shrink-0"><IllCoins /></div>
            <div className="flex-1">
              <h2 className="section-title text-3xl md:text-5xl">Watch it work <span className="gradient-text">in real time</span></h2>
              <p className="mt-3 text-sm text-[var(--muted)]">See live signals, open positions and the engine's reasoning — exactly as it happens.</p>
            </div>
            <a href="/ai-trading" className="btn-primary shrink-0">Open the live terminal</a>
          </div>
          <blockquote className="mx-auto mt-12 max-w-xl text-center">
            <p className="text-lg font-light italic text-[var(--muted)]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              "He that is faithful in that which is least is faithful also in much."
            </p>
            <footer className="eyebrow mt-3">Luke 16:10</footer>
          </blockquote>
        </Reveal>
      </section>
    </main>
  );
}
