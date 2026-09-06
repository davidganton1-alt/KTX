import Link from "next/link";
import { stars, pastors } from "@/lib/team";
import { Reveal } from "@/components/Reveal";
import { SectionIcon } from "@/components/SectionIcon";
import { Verse } from "@/components/Verse";
import { MemberEmblem } from "@/components/MemberEmblem";

export const metadata = { title: "The Team — KingdomTradeX" };

const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 4], [4, 5], [5, 6], [2, 6], [3, 6], [1, 5]];

const TIMELINE = [
  { n: "I", t: "The verse", d: "It began with Matthew 6:21 — 'where your treasure is, there your heart will be also.' A question: what if treasure could be grown with wisdom, not worry?" },
  { n: "II", t: "The build", d: "Engineers and stewards built an engine that trades with discipline — models, guardrails, and a ledger open to every member." },
  { n: "III", t: "The flock", d: "Pastors joined to pray over the work and shepherd the community. The constellation is still growing — star by star." },
];

export default function TeamPage() {
  return (
    <main>
      {/* ── HERO: orbiting emblems ── */}
      <section className="container-wide relative overflow-hidden pt-16 text-center md:pt-24">
        <p className="eyebrow">The Body, mapped in light</p>
        <h1 className="section-title mt-3 text-4xl md:text-6xl">Every star is <span className="gradient-text">called by name</span></h1>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Builders and shepherds, engineers and pastors — one body, one standard. He counts the stars and calls them all by name; so do we.
        </p>
        <div className="relative mx-auto mt-12 h-72 w-72 md:h-96 md:w-96">
          <div className="absolute inset-0 rounded-full border border-white/10" style={{ animation: "spin 40s linear infinite" }} />
          <div className="absolute inset-[14%] rounded-full border border-dashed border-white/10" style={{ animation: "spin 28s linear infinite reverse" }} />
          <div className="absolute inset-0" style={{ animation: "spin 60s linear infinite" }}>
            {stars.map((s, i) => {
              const angle = (i / stars.length) * 2 * Math.PI;
              const x = 50 + 46 * Math.cos(angle);
              const y = 50 + 46 * Math.sin(angle);
              return (
                <div key={s.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%`, animation: `spin 60s linear infinite reverse` }}>
                  <MemberEmblem name={s.name} className="h-12 w-12 md:h-14 md:w-14" />
                </div>
              );
            })}
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-3xl text-[var(--gold)]">✦</p>
              <p className="eyebrow mt-1">One body</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSTELLATION SKY ── */}
      <section className="container-wide mt-20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="compass" size={56} /></div>
          <h2 className="section-title mt-2 text-3xl md:text-4xl">The <span className="gradient-text">constellation</span></h2>
        </div>
        <div className="constellation mt-12 hidden md:block" role="img" aria-label="Constellation of the KingdomTradeX team">
          <svg viewBox="0 0 100 75" preserveAspectRatio="none">
            {LINKS.map(([a, b], i) => (
              <line key={i} x1={stars[a].x} y1={stars[a].y * 0.75} x2={stars[b].x} y2={stars[b].y * 0.75} />
            ))}
          </svg>
          {stars.map((s) => (
            <div key={s.name} className={`cstar ${s.kind === "pastor" ? "cstar--pastor" : ""}`} style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              <div className="orb"><img src={s.avatar} alt={s.name} className="h-full w-full rounded-full object-cover" loading="lazy" /></div>
              <div className="lbl">{s.name}</div>
              <div className="role">{s.role}</div>
            </div>
          ))}
        </div>
        <div className="star-list mt-10 md:hidden">
          {stars.map((s) => (
            <div key={s.name} className="card flex items-center gap-3 p-4">
              <MemberEmblem name={s.name} className="h-11 w-11" />
              <div>
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-xs text-[var(--gold)]">{s.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALLED BY NAME — detail cards ── */}
      <section className="container-wide mt-20">
        <div className="grid gap-6 md:grid-cols-2">
          {stars.map((s, i) => (
            <Reveal as="div" variant="up" index={i} key={s.name} className="card flex flex-col gap-4 border-l-2 border-[var(--gold)] p-7">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <MemberEmblem name={s.name} className="h-14 w-14" />
                  <img src={s.avatar} alt={s.name} className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-[var(--bg)] object-cover" loading="lazy" />
                </div>
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

      {/* ── FROM A VERSE TO A VISION ── */}
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

      {/* ── THE FLOCK RAIL ── */}
      <section className="container-wide mt-20">
        <div className="card-grad p-8 md:p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="cross" size={56} /></div>
            <p className="eyebrow">Our shepherds</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">The pastors who <span className="gradient-text">watch over the flock</span></h2>
          </div>
          <div className="flock-rail mt-10">
            {pastors.map((p) => (
              <Reveal as="div" variant="up" key={p.name} className="shepherd-card card flex flex-col items-center gap-3 p-6 text-center">
                <div className="relative">
                  <MemberEmblem name={p.name} className="h-16 w-16" />
                  <img src={p.avatar} alt={p.name} className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-[var(--bg)] object-cover" loading="lazy" />
                </div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">{p.role}</p>
                <span className="pill">{p.ministry}</span>
                <p className="mt-1 text-sm text-[var(--muted)]">{p.word}</p>
              </Reveal>
            ))}
            <div className="shepherd-ghost" aria-hidden="true">
              <div className="plus">+</div>
              <p className="mt-2 text-sm">Shepherd being added</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="/become-pastor" className="btn-primary inline-flex">List as a pastor</Link>
            <p className="mt-3 text-sm text-[var(--muted)]">Pastors who join can refer members and share in the fruit of their growth.</p>
          </div>
        </div>
      </section>

      {/* ── CLOSING VERSE ── */}
      <section className="container-page py-20">
        <Reveal variant="blur">
          <Verse variant="random" className="text-center" />
        </Reveal>
      </section>
    </main>
  );
}
