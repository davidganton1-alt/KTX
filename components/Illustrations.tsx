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

/* ---- 9-12. Scrollytelling step illustrations (biblical + tech orbit sets) ---- */
export function IllGiftHalo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="giftGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5C97B" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F5C97B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="giftMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5C97B" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#giftGlow)" />
      <g className="origin-center" style={{ animation: 'spin 20s linear infinite' }}>
        <circle cx="100" cy="100" r="60" stroke="#F5C97B" strokeWidth="2" fill="none" opacity="0.3" />
        <circle cx="100" cy="40" r="4" fill="#F5C97B" />
        <circle cx="160" cy="100" r="4" fill="#F5C97B" />
        <circle cx="100" cy="160" r="4" fill="#F5C97B" />
        <circle cx="40" cy="100" r="4" fill="#F5C97B" />
      </g>
      <g className="origin-center" style={{ animation: 'spin 15s linear infinite reverse' }}>
        <circle cx="100" cy="100" r="45" stroke="#F5C97B" strokeWidth="1.5" fill="none" opacity="0.5" />
        <rect x="85" y="55" width="30" height="30" rx="2" fill="url(#giftMetal)" />
        <path d="M95 55 L100 45 L105 55" stroke="#F5C97B" strokeWidth="2" fill="none" />
        <line x1="85" y1="70" x2="115" y2="70" stroke="#B8860B" strokeWidth="2" />
      </g>
      <g opacity="0.6">
        <circle cx="70" cy="70" r="2" fill="#F5C97B" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
        <circle cx="130" cy="130" r="2" fill="#F5C97B" style={{ animation: 'pulse 2s ease-in-out infinite 0.5s' }} />
        <circle cx="130" cy="70" r="2" fill="#F5C97B" style={{ animation: 'pulse 2s ease-in-out infinite 1s' }} />
        <circle cx="70" cy="130" r="2" fill="#F5C97B" style={{ animation: 'pulse 2s ease-in-out infinite 1.5s' }} />
      </g>
    </svg>
  );
}

export function IllPillars({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pillarGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g className="origin-center" style={{ animation: 'spin 25s linear infinite' }}>
        <circle cx="100" cy="100" r="70" stroke="#A855F7" strokeWidth="1" fill="none" opacity="0.3" />
        <circle cx="100" cy="30" r="3" fill="#A855F7" />
        <circle cx="170" cy="100" r="3" fill="#A855F7" />
        <circle cx="100" cy="170" r="3" fill="#A855F7" />
        <circle cx="30" cy="100" r="3" fill="#A855F7" />
      </g>
      <g>
        <rect x="60" y="80" width="16" height="60" rx="2" fill="url(#pillarGlow)" />
        <rect x="92" y="70" width="16" height="70" rx="2" fill="url(#pillarGlow)" />
        <rect x="124" y="75" width="16" height="65" rx="2" fill="url(#pillarGlow)" />
        <line x1="60" y1="80" x2="76" y2="80" stroke="#A855F7" strokeWidth="3" />
        <line x1="92" y1="70" x2="108" y2="70" stroke="#A855F7" strokeWidth="3" />
        <line x1="124" y1="75" x2="140" y2="75" stroke="#A855F7" strokeWidth="3" />
      </g>
      <g opacity="0.5">
        <line x1="68" y1="90" x2="68" y2="130" stroke="#A855F7" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="100" y1="80" x2="100" y2="130" stroke="#A855F7" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="132" y1="85" x2="132" y2="130" stroke="#A855F7" strokeWidth="1" strokeDasharray="2 2" />
      </g>
      <g className="origin-center" style={{ animation: 'spin 18s linear infinite reverse' }}>
        <circle cx="100" cy="100" r="50" stroke="#A855F7" strokeWidth="1.5" fill="none" opacity="0.4" />
      </g>
    </svg>
  );
}

export function IllEyeScan({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#eyeGlow)" />
      <g className="origin-center" style={{ animation: 'spin 30s linear infinite' }}>
        <circle cx="100" cy="100" r="65" stroke="#22D3EE" strokeWidth="1" fill="none" opacity="0.3" />
        <circle cx="100" cy="35" r="3" fill="#22D3EE" />
        <circle cx="165" cy="100" r="3" fill="#22D3EE" />
        <circle cx="100" cy="165" r="3" fill="#22D3EE" />
        <circle cx="35" cy="100" r="3" fill="#22D3EE" />
      </g>
      <g className="origin-center" style={{ animation: 'spin 20s linear infinite reverse' }}>
        <circle cx="100" cy="100" r="45" stroke="#22D3EE" strokeWidth="2" fill="none" opacity="0.5" />
        <ellipse cx="100" cy="100" rx="30" ry="20" stroke="#22D3EE" strokeWidth="2" fill="none" />
        <circle cx="100" cy="100" r="12" fill="#22D3EE" opacity="0.8" />
        <circle cx="100" cy="100" r="6" fill="#0891B2" />
      </g>
      <g opacity="0.6">
        <path d="M60 100 Q100 60 140 100 Q100 140 60 100" stroke="#22D3EE" strokeWidth="1" fill="none" opacity="0.4" />
        <circle cx="80" cy="90" r="1.5" fill="#22D3EE" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
        <circle cx="120" cy="110" r="1.5" fill="#22D3EE" style={{ animation: 'pulse 1.5s ease-in-out infinite 0.3s' }} />
      </g>
    </svg>
  );
}

export function IllTree({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="treeGlow" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <g className="origin-center" style={{ animation: 'spin 35s linear infinite' }}>
        <circle cx="100" cy="100" r="75" stroke="#34D399" strokeWidth="1" fill="none" opacity="0.25" />
        <circle cx="100" cy="25" r="3" fill="#34D399" />
        <circle cx="175" cy="100" r="3" fill="#34D399" />
        <circle cx="100" cy="175" r="3" fill="#34D399" />
        <circle cx="25" cy="100" r="3" fill="#34D399" />
      </g>
      <g>
        <line x1="100" y1="150" x2="100" y2="70" stroke="url(#treeGlow)" strokeWidth="3" />
        <circle cx="100" cy="70" r="8" fill="#34D399" opacity="0.9" />
        <circle cx="100" cy="70" r="15" fill="#34D399" opacity="0.3" />
        <line x1="100" y1="100" x2="80" y2="85" stroke="#34D399" strokeWidth="2" />
        <line x1="100" y1="100" x2="120" y2="85" stroke="#34D399" strokeWidth="2" />
        <circle cx="80" cy="85" r="5" fill="#34D399" opacity="0.8" />
        <circle cx="120" cy="85" r="5" fill="#34D399" opacity="0.8" />
        <line x1="100" y1="120" x2="70" y2="110" stroke="#34D399" strokeWidth="1.5" opacity="0.6" />
        <line x1="100" y1="120" x2="130" y2="110" stroke="#34D399" strokeWidth="1.5" opacity="0.6" />
      </g>
      <g className="origin-center" style={{ animation: 'spin 22s linear infinite reverse' }}>
        <circle cx="100" cy="100" r="55" stroke="#34D399" strokeWidth="1.5" fill="none" opacity="0.35" />
      </g>
      <g opacity="0.5">
        <circle cx="70" cy="60" r="2" fill="#34D399" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
        <circle cx="130" cy="60" r="2" fill="#34D399" style={{ animation: 'pulse 2s ease-in-out infinite 0.5s' }} />
        <circle cx="100" cy="40" r="2" fill="#34D399" style={{ animation: 'pulse 2s ease-in-out infinite 1s' }} />
      </g>
    </svg>
  );
}
