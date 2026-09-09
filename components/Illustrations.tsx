"use client";

/* Animated 3D-style vector illustrations for the homepage.
   All use the site's theme tokens so they adapt to the night/day themes. */

const VG = "var(--gold)";
const VGP = "color-mix(in srgb, var(--gold) 75%, transparent)";
const VGP2 = "color-mix(in srgb, var(--gold) 45%, transparent)";
const VGGL = "color-mix(in srgb, var(--gold) 15%, transparent)";
const VC = "var(--cyan)";
const VCP2 = "color-mix(in srgb, var(--cyan) 40%, transparent)";
const VP = "var(--purple)";
const VFL = "var(--fg)";
const VM = "var(--muted)";

/* ---- 1. Gift / $50 credit ---- */
export function IllGift() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Gift">
      <defs>
        <linearGradient id="giftBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={VGP2} />
          <stop offset="1" stopColor={VGGL} />
        </linearGradient>
        <linearGradient id="giftLid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={VG} />
          <stop offset="1" stopColor={VGP} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="172" rx="58" ry="10" fill="rgba(0,0,0,0.18)" />
      <g className="ill-float-slow">
        {/* box */}
        <rect x="48" y="86" width="104" height="78" rx="10" fill="url(#giftBox)" stroke={VGP} strokeWidth="2" />
        {/* lid */}
        <rect x="40" y="70" width="120" height="28" rx="10" fill="url(#giftLid)" stroke={VG} strokeWidth="2" />
        {/* ribbon vertical */}
        <rect x="92" y="70" width="16" height="94" fill={VG} opacity="0.9" />
        {/* ribbon horizontal */}
        <rect x="40" y="78" width="120" height="11" fill={VG} opacity="0.7" />
        {/* bow */}
        <path d="M100 70 C82 44 56 50 72 70 Z" fill={VG} stroke={VGP} strokeWidth="1.5" />
        <path d="M100 70 C118 44 144 50 128 70 Z" fill={VG} stroke={VGP} strokeWidth="1.5" />
        <circle cx="100" cy="70" r="7" fill={VGP} stroke={VG} strokeWidth="2" />
      </g>
      {/* floating sparkles */}
      <g className="ill-pulse" fill={VC}>
        <circle cx="150" cy="56" r="3" />
        <circle cx="52" cy="62" r="2.4" />
      </g>
    </svg>
  );
}

/* ---- 2. Choose a plan (stacked coins) ---- */
export function IllCoins() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Coins">
      <defs>
        <linearGradient id="coinTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={VG} />
          <stop offset="1" stopColor={VGP} />
        </linearGradient>
        <linearGradient id="coinSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={VGP} />
          <stop offset="1" stopColor={VGGL} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="172" rx="64" ry="11" fill="rgba(0,0,0,0.18)" />
      {/* bottom coin */}
      <g className="ill-float-slow">
        <ellipse cx="100" cy="150" rx="58" ry="20" fill="url(#coinSide)" stroke={VG} strokeWidth="2" />
        <ellipse cx="100" cy="138" rx="58" ry="20" fill="url(#coinTop)" stroke={VG} strokeWidth="2" />
        <ellipse cx="100" cy="138" rx="34" ry="11" fill="none" stroke={VGP} strokeWidth="1.5" />
      </g>
      {/* middle coin */}
      <g className="ill-float">
        <ellipse cx="100" cy="108" rx="58" ry="20" fill="url(#coinSide)" stroke={VG} strokeWidth="2" />
        <ellipse cx="100" cy="96" rx="58" ry="20" fill="url(#coinTop)" stroke={VG} strokeWidth="2" />
        <ellipse cx="100" cy="96" rx="34" ry="11" fill="none" stroke={VGP} strokeWidth="1.5" />
      </g>
      {/* top coin with cross */}
      <g className="ill-float">
        <ellipse cx="100" cy="66" rx="58" ry="20" fill="url(#coinSide)" stroke={VG} strokeWidth="2" />
        <ellipse cx="100" cy="54" rx="58" ry="20" fill="url(#coinTop)" stroke={VG} strokeWidth="2" />
        <path d="M100 34 v28 M86 48 h28" stroke={VGP} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ---- 3. AI engine (neural orb) ---- */
export function IllEngine() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="AI engine">
      <defs>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={VFL} />
          <stop offset="0.5" stopColor={VC} />
          <stop offset="1" stopColor={VCP2} />
        </radialGradient>
        <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={VG} />
          <stop offset="1" stopColor={VC} />
        </linearGradient>
      </defs>
      {/* outer dashed orbit */}
      <g>
        <circle cx="100" cy="100" r="74" fill="none" stroke={VGP2} strokeWidth="2" strokeDasharray="6 10" />
        {/* orbiting nodes */}
        <g>
          <circle cx="174" cy="100" r="6" fill={VG} />
          <circle cx="100" cy="26" r="5" fill={VC} />
          <circle cx="38" cy="150" r="4" fill={VG} />
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="26s" repeatCount="indefinite" />
        </g>
      </g>
      {/* mid ring */}
      <g>
        <circle cx="100" cy="100" r="52" fill="none" stroke={VCP2} strokeWidth="2" strokeDasharray="3 8" />
        <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="20s" repeatCount="indefinite" />
      </g>
      {/* pulse rings */}
      <circle cx="100" cy="100" r="40" fill="none" stroke={VG} strokeWidth="2" className="ill-ring" />
      {/* core */}
      <circle cx="100" cy="100" r="34" fill="url(#core)" className="ill-pulse" />
      <circle cx="100" cy="100" r="34" fill="none" stroke={VC} strokeWidth="2" />
      {/* inner nodes */}
      <g fill={VFL}>
        <circle cx="100" cy="100" r="5" />
        <circle cx="78" cy="86" r="3" />
        <circle cx="124" cy="112" r="3" />
        <circle cx="118" cy="78" r="2.5" />
      </g>
      <g stroke={VGP2} strokeWidth="1.6" className="ill-pulse">
        <line x1="100" y1="100" x2="78" y2="86" />
        <line x1="100" y1="100" x2="124" y2="112" />
        <line x1="100" y1="100" x2="118" y2="78" />
      </g>
    </svg>
  );
}

/* ---- 4. Watch profit grow (rising candles / chart) ---- */
export function IllGrowth() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Growth chart">
      <defs>
        <linearGradient id="stem" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={VGGL} />
          <stop offset="1" stopColor={VG} />
        </linearGradient>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={VGP2} />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>
      </defs>
      {/* panel */}
      <rect x="28" y="34" width="144" height="128" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      {/* y baseline */}
      <line x1="40" y1="146" x2="160" y2="146" stroke={VM} strokeWidth="1" opacity="0.5" />
      {/* area under line */}
      <path d="M40 140 L70 120 L100 128 L130 92 L160 52 L160 146 L40 146 Z" fill="url(#area)" />
      {/* line */}
      <polyline points="40,140 70,120 100,128 130,92 160,52" fill="none" stroke="url(#stem)" strokeWidth="3" className="ill-pulse" />
      {/* candles growing */}
      <g className="ill-float-slow">
        <rect x="52" y="118" width="12" height="28" rx="3" fill={VG} opacity="0.85" stroke={VG} strokeWidth="1" />
        <rect x="88" y="104" width="12" height="42" rx="3" fill={VC} opacity="0.85" />
        <rect x="124" y="74" width="12" height="72" rx="3" fill={VG} opacity="0.9" />
        {/* arrow up */}
        <g className="ill-pulse" stroke={VG} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M150 60 L162 42 M162 42 L150 42 M162 42 L162 54" />
        </g>
      </g>
      {/* flowing dot */}
      <circle cx="160" cy="52" r="4" fill={VFL} className="ill-pulse" />
    </svg>
  );
}

/* ---- 5. Stewardship (shield + cross) ---- */
export function IllShield() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Shield">
      <defs>
        <linearGradient id="shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={VGP} />
          <stop offset="1" stopColor={VCP2} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="176" rx="52" ry="9" fill="rgba(0,0,0,0.18)" />
      <g className="ill-float">
        <path
          d="M100 34 L150 52 V104 C150 138 128 160 100 170 C72 160 50 138 50 104 V52 Z"
          fill="url(#shield)"
          stroke={VG}
          strokeWidth="2.5"
        />
        {/* cross */}
        <path d="M100 64 v52 M78 92 h44" stroke={VFL} strokeWidth="7" strokeLinecap="round" />
        {/* glow ring */}
        <circle cx="100" cy="102" r="46" fill="none" stroke={VG} strokeWidth="2" className="ill-ring" />
      </g>
    </svg>
  );
}

/* ---- 6. Clarity (open eye) ---- */
export function IllEye() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Clarity">
      <defs>
        <radialGradient id="iris" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={VFL} />
          <stop offset="0.45" stopColor={VC} />
          <stop offset="1" stopColor={VGP} />
        </radialGradient>
      </defs>
      <g className="ill-float">
        <path d="M40 100 C70 60 130 60 160 100 C130 140 70 140 40 100 Z" fill="var(--card)" stroke={VGP} strokeWidth="2.5" />
        <circle cx="100" cy="100" r="32" fill="url(#iris)" stroke={VG} strokeWidth="2.5" className="ill-pulse" />
        <circle cx="100" cy="100" r="13" fill={VG} />
        <circle cx="112" cy="88" r="6" fill={VFL} opacity="0.85" />
      </g>
      {/* rays */}
      <g className="ill-pulse" stroke={VGP2} strokeWidth="2" strokeLinecap="round">
        <line x1="100" y1="42" x2="100" y2="58" />
        <line x1="158" y1="100" x2="142" y2="100" />
        <line x1="42" y1="100" x2="58" y2="100" />
        <line x1="52" y1="52" x2="63" y2="63" />
        <line x1="148" y1="52" x2="137" y2="63" />
      </g>
    </svg>
  );
}

/* ---- 7. Integrity (handshake / linked rings) ---- */
export function IllIntegrity() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Integrity">
      <defs>
        <linearGradient id="ringA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={VG} />
          <stop offset="1" stopColor={VGP2} />
        </linearGradient>
      </defs>
      <g className="ill-float">
        {/* interlocking rings = unity / trust */}
        <circle cx="78" cy="100" r="36" fill="none" stroke={VG} strokeWidth="6" />
        <circle cx="122" cy="100" r="36" fill="none" stroke={VC} strokeWidth="6" className="ill-pulse" />
        {/* glints */}
        <circle cx="78" cy="76" r="6" fill={VFL} opacity="0.8" />
        <circle cx="122" cy="124" r="6" fill={VFL} opacity="0.8" />
      </g>
      <path d="M100 36 l8 16 18 3 -13 13 3 18 -16 -9 -16 9 3 -18 -13 -13 18 -3 z" fill={VG} className="ill-pulse" />
    </svg>
  );
}

/* ---- 8. Trade evaluation (magnifier over data) ---- */
export function IllEvaluate() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Analysis">
      <defs>
        <linearGradient id="lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={VCP2} />
          <stop offset="1" stopColor={VGP2} />
        </linearGradient>
      </defs>
      {/* data bars */}
      <g fill={VGP2}>
        <rect x="34" y="120" width="14" height="40" rx="3" />
        <rect x="54" y="100" width="14" height="60" rx="3" />
        <rect x="74" y="132" width="14" height="28" rx="3" />
      </g>
      {/* magnifier */}
      <g className="ill-float">
        <circle cx="112" cy="96" r="40" fill="url(#lens)" stroke={VG} strokeWidth="3" />
        <circle cx="112" cy="96" r="40" fill="none" stroke={VC} strokeWidth="1.5" className="ill-pulse" />
        <line x1="142" y1="126" x2="170" y2="154" stroke={VG} strokeWidth="9" strokeLinecap="round" />
        {/* inner spark */}
        <path d="M112 78 l6 12 13 2 -9 9 2 13 -12 -7 -12 7 2 -13 -9 -9 13 -2 z" fill={VFL} className="ill-pulse" />
      </g>
    </svg>
  );
}

/* ---- 9-12. Scrollytelling step illustrations (premium: orbital layers, gradients, particles) ---- */
export function IllGiftHalo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="giftCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE5A8" stopOpacity="1" />
          <stop offset="50%" stopColor="#F5C97B" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="giftMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE5A8" />
          <stop offset="50%" stopColor="#F5C97B" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <filter id="giftGlow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <circle cx="120" cy="120" r="110" fill="url(#giftCore)" opacity="0.4" />

      <g className="origin-center" style={{ animation: 'spin 40s linear infinite', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="95" stroke="#F5C97B" strokeWidth="0.5" fill="none" opacity="0.3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <circle key={angle} cx={120 + 95 * Math.cos(angle * Math.PI / 180)} cy={120 + 95 * Math.sin(angle * Math.PI / 180)} r="2" fill="#F5C97B" style={{ animation: `pulse 3s ease-in-out infinite ${angle}ms` }} />
        ))}
      </g>

      <g className="origin-center" style={{ animation: 'spin 25s linear infinite reverse', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="75" stroke="#F5C97B" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="8 4" />
        <path d="M120 45 L120 195 M45 120 L195 120" stroke="#F5C97B" strokeWidth="0.5" opacity="0.4" />
      </g>

      <g className="origin-center" style={{ animation: 'spin 18s linear infinite', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="60" stroke="#F5C97B" strokeWidth="1.5" fill="none" opacity="0.6" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <circle key={angle} cx={120 + 60 * Math.cos(angle * Math.PI / 180)} cy={120 + 60 * Math.sin(angle * Math.PI / 180)} r="3" fill="#FFE5A8" filter="url(#giftGlow)" />
        ))}
      </g>

      <g filter="url(#giftGlow)">
        <path d="M90 90 L150 90 L150 150 L90 150 Z" fill="url(#giftMetal)" opacity="0.9" />
        <path d="M85 95 L155 95 L155 100 L85 100 Z" fill="#B8860B" />
        <path d="M85 145 L155 145 L155 150 L85 150 Z" fill="#B8860B" />
        <path d="M120 90 L120 70 M110 70 L130 70 M105 65 L115 75 M125 75 L135 65" stroke="#FFE5A8" strokeWidth="3" fill="none" />
        <circle cx="120" cy="120" r="8" fill="#FFE5A8" />
        <path d="M116 120 L124 120 M120 116 L120 124" stroke="#B8860B" strokeWidth="2" />
      </g>

      {[
        { x: 80, y: 80, delay: 0 },
        { x: 160, y: 80, delay: 500 },
        { x: 160, y: 160, delay: 1000 },
        { x: 80, y: 160, delay: 1500 },
        { x: 120, y: 60, delay: 200 },
        { x: 180, y: 120, delay: 700 },
        { x: 120, y: 180, delay: 1200 },
        { x: 60, y: 120, delay: 1700 }
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#FFE5A8" style={{ animation: `pulse 2.5s ease-in-out infinite ${p.delay}ms` }} />
      ))}
    </svg>
  );
}

export function IllPillars({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pillar1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="pillar2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="pillar3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="50%" stopColor="#D8B4FE" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="pillarGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g className="origin-center" style={{ animation: 'spin 45s linear infinite', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="100" stroke="#A855F7" strokeWidth="0.5" fill="none" opacity="0.2" />
        <path d="M120 20 L120 220 M20 120 L220 120 M50 50 L190 190 M190 50 L50 190" stroke="#A855F7" strokeWidth="0.3" opacity="0.3" />
      </g>

      <g className="origin-center" style={{ animation: 'spin 30s linear infinite reverse', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="80" stroke="#A855F7" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="12 6" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <g key={angle}>
            <circle cx={120 + 80 * Math.cos(angle * Math.PI / 180)} cy={120 + 80 * Math.sin(angle * Math.PI / 180)} r="4" fill="#C084FC" filter="url(#pillarGlow)" />
            <line x1="120" y1="120" x2={120 + 80 * Math.cos(angle * Math.PI / 180)} y2={120 + 80 * Math.sin(angle * Math.PI / 180)} stroke="#A855F7" strokeWidth="0.5" opacity="0.3" />
          </g>
        ))}
      </g>

      <g className="origin-center" style={{ animation: 'spin 20s linear infinite', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="65" stroke="#A855F7" strokeWidth="1.5" fill="none" opacity="0.5" />
      </g>

      <g filter="url(#pillarGlow)">
        <rect x="75" y="90" width="18" height="80" rx="2" fill="url(#pillar1)" />
        <rect x="72" y="95" width="24" height="8" rx="1" fill="#6D28D9" />
        <rect x="72" y="162" width="24" height="8" rx="1" fill="#6D28D9" />
        <line x1="84" y1="103" x2="84" y2="162" stroke="#C084FC" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />

        <rect x="111" y="75" width="18" height="95" rx="2" fill="url(#pillar2)" />
        <rect x="108" y="80" width="24" height="8" rx="1" fill="#7C3AED" />
        <rect x="108" y="162" width="24" height="8" rx="1" fill="#7C3AED" />
        <line x1="120" y1="88" x2="120" y2="162" stroke="#D8B4FE" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />

        <rect x="147" y="85" width="18" height="85" rx="2" fill="url(#pillar3)" />
        <rect x="144" y="90" width="24" height="8" rx="1" fill="#8B5CF6" />
        <rect x="144" y="162" width="24" height="8" rx="1" fill="#8B5CF6" />
        <line x1="156" y1="98" x2="156" y2="162" stroke="#E9D5FF" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
      </g>

      <g opacity="0.7">
        <path d="M84 110 Q120 90 156 110" stroke="#C084FC" strokeWidth="1" fill="none" strokeDasharray="2 2" />
        <path d="M84 130 Q120 110 156 130" stroke="#C084FC" strokeWidth="1" fill="none" strokeDasharray="2 2" />
        <path d="M84 150 Q120 130 156 150" stroke="#C084FC" strokeWidth="1" fill="none" strokeDasharray="2 2" />
      </g>

      {[
        { x: 84, y: 110 },
        { x: 120, y: 95 },
        { x: 156, y: 110 },
        { x: 84, y: 150 },
        { x: 120, y: 135 },
        { x: 156, y: 150 }
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#E9D5FF" style={{ animation: `pulse 2s ease-in-out infinite ${i * 200}ms` }} />
      ))}
    </svg>
  );
}

export function IllEyeScan({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eyeCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="1" />
          <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eyeRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="eyeGlow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <circle cx="120" cy="120" r="110" fill="url(#eyeCore)" opacity="0.3" />

      <g className="origin-center" style={{ animation: 'spin 50s linear infinite', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="100" stroke="#22D3EE" strokeWidth="0.5" fill="none" opacity="0.2" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <line key={angle} x1="120" y1="120" x2={120 + 100 * Math.cos(angle * Math.PI / 180)} y2={120 + 100 * Math.sin(angle * Math.PI / 180)} stroke="#22D3EE" strokeWidth="0.3" opacity="0.2" />
        ))}
      </g>

      <g className="origin-center" style={{ animation: 'spin 35s linear infinite reverse', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="85" stroke="#22D3EE" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="15 5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <circle key={angle} cx={120 + 85 * Math.cos(angle * Math.PI / 180)} cy={120 + 85 * Math.sin(angle * Math.PI / 180)} r="2.5" fill="#67E8F9" style={{ animation: `pulse 3s ease-in-out infinite ${angle}ms` }} />
        ))}
      </g>

      <g className="origin-center" style={{ animation: 'spin 22s linear infinite', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="70" stroke="url(#eyeRing)" strokeWidth="2" fill="none" opacity="0.6" />
      </g>

      <g filter="url(#eyeGlow)">
        <ellipse cx="120" cy="120" rx="50" ry="30" stroke="#22D3EE" strokeWidth="2.5" fill="none" />
        <path d="M70 120 Q120 80 170 120 Q120 160 70 120" stroke="#67E8F9" strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="120" cy="120" r="18" fill="url(#eyeCore)" />
        <circle cx="120" cy="120" r="12" fill="#0891B2" />
        <circle cx="120" cy="120" r="6" fill="#0E7490" />
        <circle cx="115" cy="115" r="2" fill="#A5F3FC" opacity="0.8" />
      </g>

      <g className="origin-center" style={{ animation: 'spin 15s linear infinite reverse', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="55" stroke="#22D3EE" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 4" />
        <path d="M120 65 L120 175 M65 120 L175 120" stroke="#22D3EE" strokeWidth="1" opacity="0.4" />
      </g>

      <g opacity="0.5">
        <path d="M90 100 L95 105 M150 100 L145 105 M90 140 L95 135 M150 140 L145 135" stroke="#67E8F9" strokeWidth="1.5" />
        <circle cx="92" cy="102" r="1" fill="#A5F3FC" />
        <circle cx="148" cy="102" r="1" fill="#A5F3FC" />
        <circle cx="92" cy="138" r="1" fill="#A5F3FC" />
        <circle cx="148" cy="138" r="1" fill="#A5F3FC" />
      </g>

      {[
        { x: 120, y: 70, delay: 0 },
        { x: 170, y: 120, delay: 400 },
        { x: 120, y: 170, delay: 800 },
        { x: 70, y: 120, delay: 1200 },
        { x: 150, y: 90, delay: 200 },
        { x: 150, y: 150, delay: 600 },
        { x: 90, y: 150, delay: 1000 },
        { x: 90, y: 90, delay: 1400 }
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#A5F3FC" style={{ animation: `pulse 2.5s ease-in-out infinite ${p.delay}ms` }} />
      ))}
    </svg>
  );
}

export function IllTree({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="1" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </radialGradient>
        <filter id="treeGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <circle cx="120" cy="120" r="110" fill="url(#leafGlow)" opacity="0.3" />

      <g className="origin-center" style={{ animation: 'spin 55s linear infinite', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="100" stroke="#34D399" strokeWidth="0.5" fill="none" opacity="0.2" />
        <path d="M120 20 L120 220 M20 120 L220 120" stroke="#34D399" strokeWidth="0.3" opacity="0.2" />
      </g>

      <g className="origin-center" style={{ animation: 'spin 40s linear infinite reverse', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="85" stroke="#34D399" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="10 8" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <circle key={angle} cx={120 + 85 * Math.cos(angle * Math.PI / 180)} cy={120 + 85 * Math.sin(angle * Math.PI / 180)} r="3" fill="#6EE7B7" style={{ animation: `pulse 3.5s ease-in-out infinite ${angle}ms` }} />
        ))}
      </g>

      <g className="origin-center" style={{ animation: 'spin 25s linear infinite', transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="120" r="70" stroke="#34D399" strokeWidth="1.5" fill="none" opacity="0.4" />
      </g>

      <g filter="url(#treeGlow)">
        <path d="M120 180 L120 90" stroke="url(#trunkGrad)" strokeWidth="4" fill="none" />

        <path d="M120 90 L95 70 M120 90 L145 70 M120 110 L85 90 M120 110 L155 90 M120 130 L90 110 M120 130 L150 110" stroke="url(#trunkGrad)" strokeWidth="2" fill="none" />

        <circle cx="95" cy="70" r="6" fill="url(#leafGlow)" />
        <circle cx="145" cy="70" r="6" fill="url(#leafGlow)" />
        <circle cx="85" cy="90" r="5" fill="url(#leafGlow)" />
        <circle cx="155" cy="90" r="5" fill="url(#leafGlow)" />
        <circle cx="90" cy="110" r="4" fill="url(#leafGlow)" />
        <circle cx="150" cy="110" r="4" fill="url(#leafGlow)" />
        <circle cx="120" cy="90" r="8" fill="url(#leafGlow)" />

        <circle cx="95" cy="70" r="3" fill="#059669" />
        <circle cx="145" cy="70" r="3" fill="#059669" />
        <circle cx="85" cy="90" r="2.5" fill="#059669" />
        <circle cx="155" cy="90" r="2.5" fill="#059669" />
        <circle cx="90" cy="110" r="2" fill="#059669" />
        <circle cx="150" cy="110" r="2" fill="#059669" />
        <circle cx="120" cy="90" r="4" fill="#059669" />
      </g>

      <g opacity="0.6">
        <path d="M120 180 L110 190 M120 180 L130 190 M120 180 L115 195 M120 180 L125 195" stroke="#34D399" strokeWidth="1.5" fill="none" />
        <path d="M120 90 L120 75 M120 75 L115 70 M120 75 L125 70" stroke="#6EE7B7" strokeWidth="1" fill="none" opacity="0.5" />
      </g>

      {[
        { x: 120, y: 75, delay: 0 },
        { x: 100, y: 85, delay: 300 },
        { x: 140, y: 85, delay: 600 },
        { x: 80, y: 100, delay: 900 },
        { x: 160, y: 100, delay: 1200 },
        { x: 120, y: 60, delay: 1500 },
        { x: 110, y: 70, delay: 1800 },
        { x: 130, y: 70, delay: 2100 }
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#A7F3D0" style={{ animation: `pulse 3s ease-in-out infinite ${p.delay}ms` }} />
      ))}
    </svg>
  );
}
