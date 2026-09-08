import Link from "next/link";
import { stars, pastors } from "@/lib/team";
import { Reveal } from "@/components/Reveal";
import { SectionIcon } from "@/components/SectionIcon";
import { Starfield } from "@/components/Starfield";

export const metadata = { title: "The Constellation — KingdomTradeX" };

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 4], [1, 4], [1, 5], [4, 5], [5, 6], [2, 6], [3, 6],
];

const builders = stars.filter((s) => s.kind === "builder");
const shepherds = stars.filter((s) => s.kind === "pastor");

// Map a member's 0-100 sky coords into a pseudo celestial coordinate string.
function celestial(s: { x: number; y: number }): string {
  const ra = ((s.x / 100) * 24).toFixed(1).padStart(4, "0");
  const dec = ((50 - s.y) * 0.9).toFixed(1);
  return `RA ${ra}ʰ · DEC ${Number(dec) >= 0 ? "+" : ""}${dec}°`;
}

export default function TeamPage() {
  return (
    <main>
      {/* ── THE SKY: cosmic hero ── */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
        <Starfield density={160} />
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(700px 400px at 50% 40%, rgba(22,27,69,0.55), transparent 70%)" }} />

        {/* central glowing Source */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative grid h-40 w-40 place-items-center md:h-52 md:w-52">
            <div className="absolute inset-0 rounded-full opacity-70 blur-3xl animate-[haloPulse_5s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, rgba(245,201,123,0.5), transparent 70%)" }} />
            <div className="relative grid h-20 w-20 place-items-center rounded-full md:h-24 md:w-24" style={{ background: "radial-gradient(circle at 35% 30%, #ffffff33, var(--gold))", boxShadow: "0 0 80px rgba(245,201,123,0.6)" }}>
              <span className="text-2xl text-[#0a0e27] md:text-3xl">✦</span>
            </div>
          </div>
        </div>

        <div className="container-wide relative z-10 mt-64 text-center md:mt-80">
          <p className="eyebrow">The constellation of KingdomTradeX</p>
          <h1 className="section-title mt-3 text-4xl md:text-6xl">
            Every star is <span className="gradient-text">called by name</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
            He determines the number of the stars and calls them each by name. So it is with this body —
            builders and shepherds, every one numbered, every one known.
          </p>
          <p className="eyebrow mt-5">Psalm 147:4</p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Descend into the sky</span>
          <div className="mx-auto mt-2 h-9 w-5 rounded-full border border-[var(--border)]">
            <div className="mx-auto mt-1.5 h-2 w-1 animate-bounce rounded-full bg-[var(--gold)]" />
          </div>
        </div>
      </section>

      {/* ── THE INTERACTIVE SKY ── */}
      <section className="container-wide py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="compass" size={56} /></div>
          <p className="eyebrow">The Body, mapped in light</p>
          <h2 className="section-title mt-2 text-3xl md:text-4xl">Trace the <span className="gradient-text">constellation</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">Hover a star to read its story. The lines are the bonds that hold the body together.</p>
        </div>

        <div className="relative mx-auto mt-12 aspect-[4/3] w-full max-w-5xl">
          {/* cosmic background */}
          <div className="absolute inset-0 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#0a0e27] via-[#0f1435] to-[#0a0e27] overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(600px 400px at 50% 50%, rgba(245,201,123,0.15), transparent 70%)" }} />
          </div>

          {/* central Source */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative grid h-20 w-20 place-items-center">
              <div className="absolute inset-0 rounded-full opacity-70 blur-2xl animate-[haloPulse_4s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, rgba(245,201,123,0.6), transparent 70%)" }} />
              <div className="relative grid h-12 w-12 place-items-center rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #ffffff33, var(--gold))", boxShadow: "0 0 60px rgba(245,201,123,0.7)" }}>
                <span className="text-xl text-[#0a0e27]">✦</span>
              </div>
            </div>
          </div>

          {/* SVG lines (animated) */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 75" preserveAspectRatio="none">
            {LINKS.map(([a, b], i) => {
              const x1 = stars[a].x;
              const y1 = stars[a].y * 0.75;
              const x2 = stars[b].x;
              const y2 = stars[b].y * 0.75;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(245,201,123,0.3)"
                  strokeWidth="0.15"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              );
            })}
          </svg>

          {/* stars */}
          {stars.map((s, i) => {
            const isPastor = s.kind === "pastor";
            const size = isPastor ? "h-16 w-16 md:h-20 md:w-20" : "h-14 w-14 md:h-16 md:w-16";
            return (
              <div
                key={s.name}
                className="group absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110 hover:z-50"
                style={{ left: `${s.x}%`, top: `${s.y * 0.75}%` }}
              >
                {/* glow halo */}
                <div className={`absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 ${isPastor ? "bg-[var(--gold)]" : "bg-[var(--cyan)]"}`} />

                {/* the star */}
                <div className={`relative ${size} cursor-pointer`}>
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className={`h-full w-full rounded-full object-cover ring-2 transition-all duration-500 ${isPastor ? "ring-[var(--gold)]" : "ring-[var(--cyan)]"}`}
                    loading="lazy"
                  />
                  <span className={`absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full text-xs font-black text-[#0a0e27] ${isPastor ? "bg-[var(--gold)]" : "bg-[var(--cyan)]"}`}>
                    {s.glyph}
                  </span>
                </div>

                {/* hover tooltip */}
                <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 opacity-0 shadow-2xl transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className={`font-mono text-[10px] uppercase tracking-widest ${isPastor ? "text-[var(--gold)]" : "text-[var(--cyan)]"}`}>{s.role}</p>
                  {s.line && <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{s.line}</p>}
                  {s.ministry && <p className="mt-2 text-xs font-semibold text-[var(--gold)]">{s.ministry}</p>}
                  {s.verse && (
                    <blockquote className="mt-2 border-l-2 border-[var(--gold)] pl-2 text-[10px] italic text-[var(--gold)]">
                      &ldquo;{s.verse.text}&rdquo;
                    </blockquote>
                  )}
                </div>

                {/* name label */}
                <p className="mt-2 text-center text-[10px] font-semibold text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--fg)]">
                  {s.name.split(" ")[0]}
                </p>
              </div>
            );
          })}

          {/* legend */}
          <div className="absolute bottom-4 left-4 flex gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)]/80 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[var(--cyan)]" />
              <span className="text-[10px] text-[var(--muted)]">Builders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[var(--gold)]" />
              <span className="text-[10px] text-[var(--muted)]">Shepherds</span>
            </div>
          </div>
        </div>

        {/* mobile fallback */}
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
      </section>

      {/* ── THE CATALOGUE: builders as star entries ── */}
      <section className="container-wide py-24">
        <div className="text-center">
          <p className="eyebrow">Stellar catalogue · Sector I</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">The <span className="gradient-text">builders</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">Those who shape the engine and keep the platform faithful to its promises.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {builders.map((s, i) => (
            <Reveal as="div" variant="up" index={i} key={s.name} className="group card relative overflow-hidden p-0">
              {/* catalogue header strip */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-soft)]/40 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                <span>★ KTX-{String(i + 1).padStart(3, "0")}</span>
                <span className="text-[var(--gold)]">{celestial(s)}</span>
              </div>

              <div className="flex gap-6 p-6">
                {/* the celestial body */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full opacity-60 blur-xl transition duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(245,201,123,0.5), transparent 70%)" }} />
                  <img src={s.avatar} alt={s.name} className="relative h-20 w-20 rounded-full object-cover ring-2 ring-[var(--gold)]/60 md:h-24 md:w-24" loading="lazy" />
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-[var(--gold)] text-sm font-black text-[#0a0e27]">{s.glyph}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-[var(--gold)]">{s.role}</p>
                  {s.line && <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.line}</p>}
                  {s.verse && (
                    <blockquote className="mt-4 border-l-2 border-[var(--gold)] pl-3 text-sm italic text-[var(--gold)]">
                      &ldquo;{s.verse.text}&rdquo;
                      <span className="mt-1 block font-mono text-[10px] not-italic tracking-widest text-[var(--muted)]">— {s.verse.ref}</span>
                    </blockquote>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── THE SHEPHERDS' CROWN ── */}
      <section className="container-wide py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="cross" size={56} /></div>
          <p className="eyebrow">Stellar catalogue · Sector II</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">The shepherds&rsquo; <span className="gradient-text">crown</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">A circle of pastors who pray over the work and hold it to a standard higher than the market&rsquo;s.</p>
        </div>

        {/* crown layout: pastors arranged around a center */}
        <div className="relative mx-auto mt-14 flex max-w-4xl flex-wrap items-start justify-center gap-6 md:gap-8">
          {pastors.map((s, i) => (
            <Reveal as="div" variant="up" index={i} key={s.name} className="group w-64">
              <div className="card relative p-6 text-center transition duration-500 hover:-translate-y-2">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 rounded-full opacity-60 blur-xl transition duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(245,201,123,0.5), transparent 70%)" }} />
                  <img src={s.avatar} alt={s.name} className="relative h-24 w-24 rounded-full object-cover" style={{ boxShadow: "0 0 0 3px var(--gold)" }} loading="lazy" />
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-[var(--gold)] text-sm font-black text-[#0a0e27]">{s.glyph}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.name}</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--gold)]">{s.role}</p>
                <span className="pill mt-3">{s.ministry}</span>
                {s.word && <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.word}</p>}
              </div>
            </Reveal>
          ))}

          {/* the open seat */}
          <Reveal as="div" variant="up" index={pastors.length} className="w-64">
            <Link href="/become-pastor" className="card flex h-full min-h-[280px] flex-col items-center justify-center gap-3 border-dashed p-6 text-center transition duration-500 hover:-translate-y-2 hover:border-[var(--gold)]">
              <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-[var(--border)] text-3xl text-[var(--muted)] transition group-hover:border-[var(--gold)]">+</div>
              <p className="font-semibold">An open seat</p>
              <p className="text-xs text-[var(--muted)]">The crown is still being formed.</p>
              <span className="btn-gold mt-2 inline-flex !px-4 !py-1.5 text-xs">Take your place</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── JOIN THE CONSTELLATION ── */}
      <section className="relative overflow-hidden py-24">
        <Starfield density={90} />
        <div className="container-wide relative z-10 text-center">
          <Reveal variant="blur">
            <h2 className="section-title text-3xl md:text-5xl">
              This sky is still <span className="gradient-text">gaining stars</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">
              Whether you build with your hands or shepherd with your word, there is a coordinate here with your name on it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/become-pastor" className="btn-primary inline-flex">List as a pastor</Link>
              <Link href="/register" className="btn-ghost inline-flex">Join as a member</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
