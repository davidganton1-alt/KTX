import Link from "next/link";
import { IllCoins, IllShield, IllGrowth } from "@/components/Illustrations";
import { Verse } from "@/components/Verse";
import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Plans — KingdomTradeX",
  description:
    "Choose Faithful, Steward or Ambassador. Higher plans unlock stronger AI and a higher target daily rate, with profit-only withdrawals and biblically grounded deposit rules.",
};

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
    color: "var(--gold)",
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
    color: "var(--cyan)",
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
    color: "var(--gold)",
  },
];

const compare = [
  { f: "Daily profit target", faithful: "0.5%", steward: "0.75%", ambassador: "1.0%" },
  { f: "Minimum to open", faithful: "$100", steward: "$650", ambassador: "$2,000" },
  { f: "Markets covered", faithful: "All", steward: "All", ambassador: "All" },
  { f: "AI desk", faithful: "Starter", steward: "Advanced", ambassador: "Elite" },
  { f: "Priority rebalancing", faithful: "—", steward: "Yes", ambassador: "Yes" },
  { f: "Dedicated risk guards", faithful: "—", steward: "—", ambassador: "Yes" },
  { f: "Hold period", faithful: "6 months", steward: "9 months", ambassador: "12 months" },
];

export default function PlansPage() {
  return (
    <>
      <main className="container-page py-16">
        {/* HERO */}
        <Reveal as="section" variant="left" className="relative overflow-hidden">
          <div className="relative flex flex-col items-center gap-10 py-10 text-center md:flex-row">
            <div className="flex-1 text-center">
              <span className="pill">
                <span className="h-2 w-2 rounded-full bg-gold-light" />
                Plans
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
                Three ways to <span className="gradient-text">grow, wisely.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-[var(--muted)]">
                Each plan is a posture of stewardship. You fund an amount, the AI desk
                trades it around the clock, profit accrues daily, and you withdraw the
                profit whenever you like. Stronger plans unlock stronger AI and a higher
                target daily rate.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/register" className="btn-primary">Get $50 free</Link>
                <Link href="/ai-engine" className="btn-ghost">How the engine works</Link>
              </div>
            </div>
            <div className="flex-1">
              <div className="mx-auto w-64 md:w-80">
                <IllCoins />
              </div>
            </div>
          </div>
        </Reveal>

        {/* TIERS */}
        <Reveal as="section" variant="up" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
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
                <p className="mt-4 text-3xl font-extrabold" style={{ color: t.color }}>{t.rate}</p>
                <p className="text-xs text-[var(--muted)]">target daily profit</p>
                <p className="mt-4 flex-1 text-sm text-[var(--muted)]">{t.perk}</p>
                <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs italic text-[var(--gold)]">
                  {t.verse}
                </p>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Deposit withdrawable any time. Before the {t.hold}, a 25% fee applies. After it, withdraw in full, no fee.
                </p>
                <Link href="/register" className={`mt-6 ${t.highlight ? "btn-gold" : "btn-ghost"} w-full`}>
                  Start with {t.name}
                </Link>
              </div>
            ))}
          </div>
        </Reveal>

        {/* COMPARISON */}
        <Reveal as="section" variant="up" className="mt-20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="scale" size={56} />
            </div>
            <p className="eyebrow">Side by side</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              What <span className="gradient-text">sets them apart</span>
            </h2>
          </div>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)]">
                  <th className="py-3">Feature</th>
                  <th>Faithful</th>
                  <th>Steward</th>
                  <th>Ambassador</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((r) => (
                  <tr key={r.f} className="border-t border-[var(--border)]">
                    <td className="py-3 font-medium">{r.f}</td>
                    <td>{r.faithful}</td>
                    <td className="text-[var(--gold)]">{r.steward}</td>
                    <td>{r.ambassador}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* DEPOSIT / WITHDRAWAL RULE */}
        <Reveal as="section" variant="right" className="mt-20">
          <div className="card-grad flex flex-col items-center gap-6 p-10 text-center md:flex-row md:text-left">
            <div className="w-40 shrink-0">
              <SectionIcon name="hand" size={140} />
            </div>
            <div className="flex-1">
              <p className="eyebrow">Your deposit, your rules</p>
              <h2 className="mt-2 text-3xl font-bold">Deposit &amp; withdrawal, plainly</h2>
              <p className="mx-auto mt-3 max-w-2xl text-[var(--muted)] md:mx-0">
                You may withdraw your deposit at any time. If you withdraw before your
                plan&rsquo;s hold period (6, 9 or 12 months), a 25% fee applies, because
                the AI builds positions on a horizon. After the hold, you withdraw the
                full deposit with no fee. Profit, meanwhile, is yours to take out daily,
                never the principal.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/faq" className="btn-ghost">Read the FAQ</Link>
                <Link href="/register" className="btn-primary">Open an account</Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* GIFT */}
        <Reveal as="section" variant="scale" className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="card p-8 text-center">
            <div className="mx-auto mb-4 h-20 w-20">
              <IllGrowth />
            </div>
            <h3 className="text-xl font-bold">Profit accrues daily</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Watch your balance grow in the dashboard, compounding with calm, steady
              motion. Withdraw the profit every day.
            </p>
          </div>
          <div className="card p-8 text-center">
            <Verse variant="random" />
          </div>
        </Reveal>
      </main>
    </>
  );
}
