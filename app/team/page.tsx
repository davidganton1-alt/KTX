import Link from "next/link";
import { stars, pastors } from "@/lib/team";
import { Reveal } from "@/components/Reveal";
import { SectionIcon } from "@/components/SectionIcon";
import { Verse } from "@/components/Verse";

export const metadata = { title: "About Us — KingdomTradeX" };

// ── EDIT THESE WITH YOUR REAL LICENSE DETAILS ──
const LICENSES = [
  { name: "MSB License", number: "YOUR_MSB_NUMBER", issuer: "FinCEN", desc: "Registered Money Services Business authorization." },
  { name: "Certificate of Good Standing", number: "YOUR_CERT_NUMBER", issuer: "State Registry", desc: "Active, compliant business in good standing." },
];

const TIMELINE = [
  { n: "I", t: "The verse", d: "It began with Matthew 6:21 — 'where your treasure is, there your heart will be also.' A question: what if treasure could be grown with wisdom, not worry?" },
  { n: "II", t: "The build", d: "Engineers and stewards built an engine that trades with discipline — models, guardrails, and a ledger open to every member." },
  { n: "III", t: "The flock", d: "Pastors joined to pray over the work and shepherd the community. The constellation is still growing — star by star." },
];

export default function AboutPage() {
  return (
    <main>
      {/* ── HERO ── */}
      <section className="container-wide pt-16 text-center md:pt-24">
        <p className="eyebrow">About KingdomTradeX</p>
        <h1 className="section-title mt-3 text-4xl md:text-6xl">Built on <span className="gradient-text">faith</span>, run with <span className="gradient-text">integrity</span></h1>
        <p className="mx-auto mt-4 max-w-3xl text-[var(--muted)]">
          KingdomTradeX is a licensed, faith-driven investment platform. We combine disciplined AI trading with
          biblical stewardship — and we hold ourselves to a standard higher than the market&rsquo;s. Transparency
          isn&rsquo;t a feature here; it&rsquo;s our foundation.
        </p>
      </section>

      {/* ── OFFICIAL WEBSITE DECLARATION ── */}
      <section className="container-wide mt-16">
        <Reveal variant="up">
          <div className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--gold)]/[0.05] p-8 text-center md:p-10">
            <span className="text-3xl">🛡️</span>
            <h2 className="section-title mt-3 text-2xl md:text-4xl">This is the <span className="gradient-text">ONLY official website</span></h2>
            <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-[var(--muted)]">
              KingdomTradeX operates exclusively through this domain. <b className="text-[var(--fg)]">No other person, website, group, or
              channel is authorized to act on our behalf or collect funds in our name.</b> Always verify you are on this
              official site before logging in or depositing. Anyone claiming to represent us elsewhere should be treated
              with caution and reported through our support page.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── LICENSES & COMPLIANCE ── */}
      <section className="container-wide mt-16">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="shield" size={56} /></div>
          <p className="eyebrow">Licensed &amp; compliant</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">Our <span className="gradient-text">credentials</span></h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--muted)]">
            We are a registered, compliant business. Every member can verify our standing.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {LICENSES.map((l, i) => (
            <Reveal key={l.name} variant="up" index={i}>
              <div className="card flex h-full items-start gap-5 border-l-2 border-[var(--gold)] p-7">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-2xl text-[var(--gold)]">✓</div>
                <div>
                  <h3 className="text-lg font-bold">{l.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">{l.issuer} · #{l.number}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{l.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── RISK DISCLAIMER ── */}
      <section className="container-wide mt-16">
        <Reveal variant="up">
          <div className="rounded-2xl border border-loss/30 bg-loss/[0.04] p-8 md:p-10">
            <h2 className="flex items-center gap-3 text-xl font-bold text-[var(--fg)]">
              <span className="text-2xl">⚠️</span> Risk Disclaimer
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--muted)]">
              All trading involves <b className="text-loss">substantial risk of loss</b>, and past performance is
              <b className="text-loss"> not indicative of future results</b>. The AI engine is designed to manage risk
              carefully, but markets are unpredictable and no strategy can guarantee profit. You should only invest funds
              you can afford to risk. <b className="text-[var(--fg)]">You trade at your own risk.</b> KingdomTradeX
              provides a technology and stewardship framework; it does not guarantee returns.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── OUR STORY ── */}
      <section className="container-wide mt-20">
        <div className="text-center">
          <p className="eyebrow">Our story</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">From a verse to a <span className="gradient-text">vision</span></h2>
        </div>
        <div className="relative mt-12 grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-gold-light via-cyan-light to-profit md:block" />
          {TIMELINE.map((c, i) => (
            <Reveal key={c.n} variant="up" index={i}>
              <div className="relative text-center md:text-left">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-lg font-bold text-[var(--gold)] md:mx-0">{c.n}</div>
                <h3 className="mt-4 text-xl font-bold">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── THE TEAM (constellation) ── */}
      <section className="container-wide mt-20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="compass" size={56} /></div>
          <p className="eyebrow">The Body, mapped in light</p>
          <h2 className="section-title mt-2 text-3xl md:text-4xl">Every star is <span className="gradient-text">called by name</span></h2>
        </div>

        {/* mobile list */}
        <div className="star-list mt-10 md:hidden">
          {stars.map((s) => (
            <div key={s.name} className="card flex items-center gap-3 p-4">
              <div className="orb h-12 w-12 shrink-0">
                <img src={s.avatar} alt={s.name} className="h-full w-full rounded-full object-cover" loading="lazy" />
              </div>
              <div>
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-xs text-[var(--gold)]">{s.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* member cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {stars.map((s, i) => (
            <Reveal as="div" variant="up" index={i} key={s.name} className="card flex flex-col gap-4 border-l-2 border-[var(--gold)] p-7">
              <div className="flex items-center gap-4">
                <img src={s.avatar} alt={s.name} className="h-14 w-14 rounded-full object-cover ring-2" style={{ boxShadow: `0 0 0 2px ${s.kind === "pastor" ? "var(--gold)" : "var(--cyan)"}` }} loading="lazy" />
                <div>
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="text-sm text-[var(--gold)]">{s.role}</p>
                </div>
                <span className="ml-auto text-xl text-[var(--muted)]">{s.glyph}</span>
              </div>
              {s.line && <p className="text-sm text-[var(--muted)]">{s.line}</p>}
              {s.word && <p className="text-sm text-[var(--muted)]">{s.word}</p>}
              {s.ministry && <span className="pill w-fit">{s.ministry}</span>}
              {s.verse && (
                <blockquote className="mt-auto border-l-2 border-[var(--gold)] pl-3 text-sm italic text-[var(--gold)]">
                  &ldquo;{s.verse.text}&rdquo;
                  <span className="mt-1 block not-italic text-[var(--muted)]">— {s.verse.ref}</span>
                </blockquote>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      <section className="container-wide py-20 text-center">
        <Reveal variant="blur">
          <h2 className="section-title text-3xl md:text-5xl">Join a platform built on <span className="gradient-text">trust</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">Licensed, transparent, and rooted in stewardship. Your journey starts here.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary inline-flex">Create an account</Link>
            <Link href="/plans" className="btn-ghost inline-flex">View the plans</Link>
          </div>
        </Reveal>
        <div className="mt-12">
          <Verse variant="random" />
        </div>
      </section>
    </main>
  );
}
