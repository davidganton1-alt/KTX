"use client";

/* Global, fixed, full-viewport animated background.
   Combines a subtle technology grid with biblical "light / living water"
   motifs: slow drifting glow orbs (Let there be light), rising motes
   (the Spirit / living water), and faint oversized scripture.
   Lives behind all content (z-index -1) so it never forms a rectangle. */

const MOTES = [
  { left: "8%", size: 3, dur: 17, delay: 0 },
  { left: "18%", size: 2, dur: 22, delay: 4 },
  { left: "28%", size: 4, dur: 19, delay: 8 },
  { left: "39%", size: 2, dur: 25, delay: 2 },
  { left: "47%", size: 3, dur: 20, delay: 11 },
  { left: "56%", size: 2, dur: 23, delay: 6 },
  { left: "64%", size: 4, dur: 18, delay: 9 },
  { left: "73%", size: 2, dur: 24, delay: 3 },
  { left: "82%", size: 3, dur: 21, delay: 12 },
  { left: "91%", size: 2, dur: 26, delay: 7 },
];

export function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden="true">
      <div className="site-bg-grid" />
      <div className="site-bg-orb site-bg-orb--gold" />
      <div className="site-bg-orb site-bg-orb--cyan" />
      <div className="site-bg-orb site-bg-orb--purple" />
      <div className="site-bg-motes">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: m.left,
              width: m.size,
              height: m.size,
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
