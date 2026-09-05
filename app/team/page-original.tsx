import Link from "next/link";
import { Verse } from "@/components/Verse";
import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";
import {
  stars,
  pastors,
  morningStar,
  scriptureWall,
  ribbon,
} from "@/lib/team";

// Connection lines between stars (by index into `stars`) to form a constellation.
const links: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [5, 6],
  [1, 4],
  [2, 6],
];

export default function TeamPage() {
  return (
    <Reveal as="main" variant="up" className="container-page py-16">
      {/* HERO — The Bright Morning Star */}
      <section className="cosmos text-center">
        <div className="cosmos-field" aria-hidden="true" />
        {/* a few twinkling stars */}
        {[
          [10, 18],
          [85, 22],
          [70, 80],
          [22, 78],
          [50, 10],
          [92, 60],
        ].map(([l, t], i) => (
          <span
            key={i}
            className="twinkle"
            style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${i * 0.5}s` }}
            aria-hidden="true"
          />
        ))}

        <div className="relative">
          <div className="morning-star">
            <span className="cross text-4xl font-black">✚</span>
          </div>
          <p className="eyebrow mt-8">{morningStar.title}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            A sky of <span className="gradient-text">named stars</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[var(--muted)]">
            &ldquo;He determines the number of the stars and calls them each by name.&rdquo; This is
            not a company. It is a constellation, every light placed on purpose and known by the
            One who hung it there. Below, the stars of our work.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm italic text-[var(--gold)]">{morningStar.verse}</p>
        </div>
      </section>

      {/* SCRIPTURE RIBBON */}
      <div className="relative mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] py-4">
        <div className="team-ribbon">
          {[...ribbon, ...ribbon].map((r, i) => (
            <span key={i} className="whitespace-nowrap text-sm text-[var(--gold)]">
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* THE CONSTELLATION */}
      <section className="mt-20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center">
            <SectionIcon name="compass" size={56} />
          </div>
          <p className="eyebrow">The Body, mapped in light</p>
          <h2 className="section-title mt-2 text-3xl md:text-4xl">
            Every star is <span className="gradient-text">called by name</span>
          </h2>
        </div>

        {/* desktop / tablet: constellation sky */}
        <div className="constellation mt-12 hidden md:block" role="img" aria-label="Constellation of the KingdomTradeX team">
          <svg viewBox="0 0 100 75" preserveAspectRatio="none">
            {links.map(([a, b], i) => (
              <line
                key={i}
                x1={stars[a].x * (100 / 100)}
                y1={stars[a].y * (75 / 100)}
                x2={stars[b].x * (100 / 100)}
                y2={stars[b].y * (75 / 100)}
              />
            ))}
          </svg>
          {stars.map((s) => (
            <div
              key={s.name}
              className={`cstar ${s.kind === "pastor" ? "cstar--pastor" : ""}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <div className="orb">
                <img src={s.avatar} alt={s.name} className="h-full w-full rounded-full object-cover" loading="lazy" />
              </div>
              <div className="lbl">{s.name}</div>
              <div className="role">{s.role}</div>
            </div>
          ))}
        </div>

        {/* mobile: simple star list */}
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

      {/* CALLED BY NAME — member detail cards */}
      <section className="mt-20">
        <div className="grid gap-6 md:grid-cols-2">
          {stars.map((s, i) => (
            <Reveal
              as="div"
              variant="up"
              index={i}
              key={s.name}
              className="card flex flex-col gap-4 border-l-2 border-[var(--gold)] p-7"
            >
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="h-14 w-14 rounded-full object-cover ring-2"
                    style={{ boxShadow: `0 0 0 2px ${s.kind === "pastor" ? "var(--gold)" : "var(--cyan)"}` }}
                    loading="lazy"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-[#0a0e27]"
                    style={{ background: s.kind === "pastor" ? "var(--gold)" : "var(--cyan)" }}
                  >
                    {s.glyph}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="text-sm text-[var(--gold)]">{s.role}</p>
                </div>
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

      {/* THE FLOCK — ongoing, scrollable roster of shepherds */}
      <section className="mt-20">
        <div className="card-grad p-8 md:p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit justify-center">
              <SectionIcon name="cross" size={56} />
            </div>
            <p className="eyebrow">Our shepherds</p>
            <h2 className="section-title mt-2 text-3xl md:text-4xl">
              The pastors who <span className="gradient-text">watch over the flock</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--muted)]">
              We do not build alone. A circle of pastors walks with this work, praying over it,
              teaching through it, and holding it to a standard higher than the market&rsquo;s.
              The circle is growing; new shepherds are added as the work expands.
            </p>
          </div>

          <div className="flock-rail mt-10">
            {pastors.map((p) => (
              <Reveal
                as="div"
                variant="up"
                key={p.name}
                className="shepherd-card card flex flex-col items-center gap-3 p-6 text-center"
              >
                <div className="relative">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="h-16 w-16 rounded-full object-cover"
                    style={{ boxShadow: "0 0 0 3px var(--gold)" }}
                    loading="lazy"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--gold)] text-xs font-black text-[#0a0e27]"
                  >
                    {p.glyph}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
                  {p.role}
                </p>
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
            <Link href="/become-pastor" className="btn-primary inline-flex">
              List as a pastor
            </Link>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Pastors who join can refer members and share in the fruit of their growth.
            </p>
          </div>
        </div>
      </section>

      {/* SCRIPTURE COLLAGE */}
      <section className="mt-20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-fit justify-center">
            <SectionIcon name="book" size={56} />
          </div>
          <p className="eyebrow">Written on our hearts</p>
          <h2 className="section-title mt-2 text-3xl md:text-4xl">
            The <span className="gradient-text">word</span> we build by
          </h2>
        </div>
        <div className="verse-collage mt-12">
          {scriptureWall.map((v, i) => (
            <Reveal as="div" variant="up" index={i} key={v.ref} className="team-verse-card card p-7">
              <p className={`text-[var(--fg)] ${v.size === "lg" ? "verse-lg" : "verse-sm"}`}>
                {v.text}
              </p>
              <p className="mt-4 text-sm font-semibold text-[var(--gold)]">{v.ref}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="mt-20">
        <Reveal as="div" variant="blur" className="card-grad p-10 text-center">
          <p className="text-2xl font-bold md:text-3xl">
            &ldquo;Now you are the body of Christ, and each one of you is a part of it.&rdquo;
          </p>
          <p className="mt-2 text-sm text-[var(--gold)]">— 1 Corinthians 12:27</p>
          <Link href="/support" className="btn-primary mt-6 inline-flex">
            Walk with us
          </Link>
        </Reveal>
        <div className="mt-8">
          <Verse variant="random" className="text-center" />
        </div>
      </section>
    </Reveal>
  );
}
