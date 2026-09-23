"use client";

/* Cohesive 3D vector section logos.
   One consistent "app-tile" aesthetic (rounded cube with a top bevel highlight
   and a gradient face) so every section across every page feels like one set.
   Uses theme tokens so they adapt to night/day modes. */

type IconName =
  | "gift"
  | "coins"
  | "engine"
  | "growth"
  | "shield"
  | "eye"
  | "integrity"
  | "evaluate"
  | "spark"
  | "chart"
  | "pulse"
  | "book"
  | "users"
  | "help"
  | "lock"
  | "mail"
  | "bolt"
  | "globe"
  | "scale"
  | "seed"
  | "hand"
  | "star"
  | "cross"
  | "compass";

const G = "var(--gold)";
const C = "var(--cyan)";
const P = "var(--purple)";
const V = "var(--fg)";

function Glyph({ name }: { name: IconName }) {
  switch (name) {
    case "gift":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="13" y="22" width="22" height="16" rx="2.5" />
          <path d="M13 27h22" />
          <path d="M24 22v16" />
          <path d="M24 22c-5-7-13-5-11 0M24 22c5-7 13-5 11 0" />
        </g>
      );
    case "coins":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="19" cy="30" rx="8" ry="3.4" />
          <path d="M11 30v-6c0-1.9 3.6-3.4 8-3.4s8 1.5 8 3.4v6" />
          <ellipse cx="29" cy="24" rx="8" ry="3.4" />
          <path d="M21 24v-6c0-1.9 3.6-3.4 8-3.4s8 1.5 8 3.4v6" />
        </g>
      );
    case "engine":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="13" />
          <circle cx="24" cy="24" r="5" />
          <path d="M24 6v6M24 36v6M6 24h6M36 24h6" />
        </g>
      );
    case "growth":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 32l9-9 6 6 9-12" />
          <path d="M33 17h5v5" />
        </g>
      );
    case "shield":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 7l13 5v8c0 9-6 14-13 17-7-3-13-8-13-17v-8z" />
          <path d="M18 24l4 4 8-8" />
        </g>
      );
    case "eye":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 24c5-9 21-9 30 0-5 9-21 9-30 0z" />
          <circle cx="24" cy="24" r="4.5" />
        </g>
      );
    case "integrity":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="14" />
          <circle cx="24" cy="24" r="9" />
          <circle cx="24" cy="24" r="4" />
        </g>
      );
    case "evaluate":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="17" cy="17" r="9" />
          <path d="M23.5 23.5L34 34" />
          <path d="M13.5 17h7M17 13.5v7" />
        </g>
      );
    case "spark":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 6l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />
        </g>
      );
    case "chart":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 34V12M9 34h27" />
          <rect x="14" y="22" width="5" height="12" rx="1.5" />
          <rect x="22" y="16" width="5" height="18" rx="1.5" />
          <rect x="30" y="26" width="5" height="8" rx="1.5" />
        </g>
      );
    case "pulse":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 24h7l4-12 6 24 5-14 3 6h7" />
        </g>
      );
    case "book":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 11c4-3 9-3 13 0 4-3 9-3 13 0v22c-4-3-9-3-13 0-4-3-9-3-13 0z" />
          <path d="M24 11v22" />
        </g>
      );
    case "users":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="18" r="5" />
          <path d="M9 33c0-5 4-8 9-8s9 3 9 8" />
          <path d="M30 14a5 5 0 010 10M33 33c0-4-2-7-5-8" />
        </g>
      );
    case "help":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="14" />
          <path d="M19 19a5 5 0 015-4c3 0 5 2 5 5s-2 4-4 5-2 3-2 5" />
          <circle cx="24" cy="32" r="1.6" fill={V} stroke="none" />
        </g>
      );
    case "lock":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="13" y="20" width="22" height="16" rx="3" />
          <path d="M17 20v-4a7 7 0 0114 0v4" />
          <circle cx="24" cy="27" r="2.4" />
        </g>
      );
    case "mail":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="14" width="30" height="20" rx="3" />
          <path d="M10 16l14 11 14-11" />
        </g>
      );
    case "bolt":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 5L12 26h9l-3 13 14-21h-9z" />
        </g>
      );
    case "globe":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="14" />
          <path d="M10 24h28M24 10c-6 6-6 22 0 28 6-6 6-22 0-28" />
        </g>
      );
    case "scale":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 8v8M14 16h20M24 16l-9 14M24 16l9 14" />
          <path d="M10 30h8l-4 5zM30 30h8l-4 5z" />
        </g>
      );
    case "seed":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 33c0-9 0-15-7-19 0 9 3 15 7 19 4-4 7-10 7-19-7 4-7 10-7 19z" />
          <path d="M24 33v-3" />
        </g>
      );
    case "hand":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 20v10a6 6 0 006 6h2a8 8 0 008-8v-8" />
          <path d="M18 20v-3a2 2 0 014 0M22 17v-3a2 2 0 014 0M26 14v3" />
        </g>
      );
    case "star":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 7l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" />
        </g>
      );
    case "cross":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 9v30M9 24h30" />
        </g>
      );
    case "compass":
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="14" />
          <path d="M19 19l5 2 2 5 5 5-5-2-2-5z" />
        </g>
      );
    default:
      return (
        <g fill="none" stroke={V} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="13" />
        </g>
      );
  }
}

export function SectionIcon({
  name,
  size = 56,
  accent = G,
  animate = true,
  className,
}: {
  name: IconName;
  size?: number;
  accent?: string;
  animate?: boolean;
  className?: string;
}) {
  const gid = `si-${name}-${accent.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <span
      className={`section-icon ${animate ? "ill-float" : ""} ${className || ""}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" role="img" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor={C} />
          </linearGradient>
        </defs>
        {/* 3D bevel base */}
        <rect x="6" y="8" width="36" height="36" rx="11" fill={gid} opacity="0.28" />
        <rect x="6" y="6" width="36" height="36" rx="11" fill={gid} opacity="0.5" />
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="11"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          opacity="0.85"
        />
        {/* top bevel highlight */}
        <rect x="6" y="6" width="36" height="36" rx="11" fill="rgba(255,255,255,0.10)" />
        <Glyph name={name} />
      </svg>
    </span>
  );
}

export type { IconName };

export function SectionHeading({
  icon,
  eyebrow,
  title,
  accent,
  sub,
}: {
  icon: IconName;
  eyebrow: string;
  title: React.ReactNode;
  accent?: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex w-fit justify-center">
        <SectionIcon name={icon} accent={accent} size={56} />
      </div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-2 text-3xl md:text-4xl">{title}</h2>
      {sub && <p className="mx-auto mt-3 max-w-2xl text-[var(--muted)]">{sub}</p>}
    </div>
  );
}
