"use client";

type Emblem = { from: string; to: string; art: React.ReactNode };

const EMBLEMS: Record<string, Emblem> = {
  DAVID: { from: "#F5C97B", to: "#B8860B", art: <path fill="#fff" d="M4 16.5 2.8 7.5 8 10.5 12 4.5l4 6 5.2-3-1.2 9zM4 18.5h16V21H4z" /> },
  MIRIAM: { from: "#2DD4BF", to: "#0E7490", art: <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="4.5" /><path d="M11.5 11.5 20 20M16.5 16.5l2.5-2.5M13.5 13.5 16 11" /></g> },
  JAMES: { from: "#22D3EE", to: "#7C3AED", art: <g fill="none" stroke="#fff" strokeWidth="1.8"><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M12 2.5V7M12 17v4.5M2.5 12H7M17 12h4.5M5 5l2 2M19 5l-2 2M5 19l2-2M19 19l-2-2" /></g> },
  GRACE: { from: "#A78BFA", to: "#4338CA", art: <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v18M8.5 21h7M12 5.5 6 7.5M12 5.5l6 2" /><path d="M6 7.5 3.5 13a3 3 0 0 0 5 0zM18 7.5 15.5 13a3 3 0 0 0 5 0z" /></g> },
  SAMUEL: { from: "#F5C97B", to: "#7C3AED", art: <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" d="M9.5 21V8a4.5 4.5 0 0 1 9 0v.5a2.5 2.5 0 0 1-5 0M9.5 12H6" /> },
  RUTH: { from: "#FB7185", to: "#B45309", art: <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 6C10 4.5 7 4 4 4v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z" /><path d="M12 6v14" /></g> },
  DANIEL: { from: "#22D3EE", to: "#F5C97B", art: <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 3c1 3 4 4.5 4 8a4 4 0 1 1-8 0c0-3.5 3-5 4-8z" /><path d="M8 21h8" /></g> },
};

const KEY: Record<string, string> = {
  "David Okonkwo": "DAVID", "Miriam Cohen": "MIRIAM", "James Whitfield": "JAMES",
  "Grace Mensah": "GRACE", "Pastor Samuel Adeyemi": "SAMUEL", "Pastor Ruth Becci": "RUTH", "Pastor Daniel Kim": "DANIEL",
};

export function MemberEmblem({ name, className = "h-12 w-12" }: { name: string; className?: string }) {
  const id = KEY[name] ?? (name.includes("Pastor") ? "SAMUEL" : "DAVID");
  const e = EMBLEMS[id];
  const gid = `me-${id}`;
  return (
    <svg viewBox="0 0 48 48" className={`${className} shrink-0 drop-shadow-[0_2px_10px_rgba(0,0,0,.4)]`} role="img" aria-label={name}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={e.from} />
          <stop offset="100%" stopColor={e.to} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill={`url(#${gid})`} />
      <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1" />
      <g transform="translate(12 12)">{e.art}</g>
    </svg>
  );
}
