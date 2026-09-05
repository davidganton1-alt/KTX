"use client";

type Glyph = { from: string; to: string; art: React.ReactNode };

/* Each logo = vibrant gradient coin + crisp white vector glyph (24x24 space). */
const LOGOS: Record<string, Glyph> = {
  /* ── CRYPTO (fallback if no image) ── */
  BTC:  { from: "#F7931A", to: "#b35c00", art: <path fill="#fff" d="M15.7 10.2c.4-1.6-.6-2.7-2.3-3.2l.5-2-1.5-.4-.5 2-1.2-.3.5-2L9.7 4l-.5 2L7 5.5l-.4 1.5 1.6.4c.5.1.6.4.5.8l-1.4 5.6c-.1.3-.3.5-.8.4L5 13.8l-.6 1.6 2.2.6-.5 2 1.5.4.5-2 1.2.3-.5 2 1.5.4.5-2c2.2.4 3.8 0 4.3-1.8.4-1.5-.3-2.4-1.5-2.9 1-.2 1.6-.9 1.6-2.2zm-2.6 4.5c-.3 1.3-2.3.8-3.3.6l.6-2.4c1 .3 3 .5 2.7 1.8zm.5-4.4c-.3 1.2-2 .7-2.8.5l.5-2.2c.9.2 2.6.5 2.3 1.7z" /> },
  ETH:  { from: "#627EEA", to: "#3b4fb8", art: <g fill="#fff"><path opacity=".8" d="M12 3v7.3l6 2.7z" /><path d="M12 3L6 13l6-2.7z" /><path opacity=".8" d="M12 21v-6.2l6-3.5z" /><path d="M12 21L6 11.3l6 3.5z" /><path opacity=".5" d="M12 14.8l6-2.8-6-2.7z" /><path opacity=".5" d="M12 14.8V9.3L6 12z" /></g> },
  SOL:  { from: "#14F195", to: "#9945FF", art: <g fill="#fff"><path d="M7 6.5h11l-2 2.5H5z" /><path d="M7 15h11l-2 2.5H5z" /><path d="M7 10.7h11l2 2.3H7z" transform="rotate(180 12 11.9)" /></g> },
  BNB:  { from: "#F3BA2F", to: "#c78a00", art: <g fill="#fff"><path d="M12 4l3 3-3 3-3-3z" /><path d="M7 9l3 3-3 3-3-3z" /><path d="M17 9l3 3-3 3-3-3z" /><path d="M12 14l3 3-3 3-3-3z" /><path d="M12 9.5l2.5 2.5-2.5 2.5L9.5 12z" /></g> },
  XRP:  { from: "#25A8E0", to: "#0b6ea8", art: <path fill="#fff" d="M6 5l4 4.5L14 5h4l-6 7 6 7h-4l-4-4.5L6 19H2l6-7-6-7z" transform="translate(2 0)" /> },

  /* ── US STOCKS ── */
  AAPL: { from: "#FF3B30", to: "#FF9500", art: <path fill="#fff" d="M15.6 12.6c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.7c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.5-1-2.5-3zM13.6 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.5-1.2z" /> },
  MSFT: { from: "#00A4EF", to: "#7FBA00", art: <g fill="#fff"><path d="M4.5 4.5h7v7h-7z" /><path d="M12.5 4.5h7v7h-7z" opacity=".85" /><path d="M4.5 12.5h7v7h-7z" opacity=".85" /><path d="M12.5 12.5h7v7h-7z" /></g> },
  NVDA:{ from: "#76B900", to: "#1a4d1a", art: <path fill="#fff" d="M12 5C7 5 3 9 2 12c1 3 5 7 10 7s9-4 10-7c-1-3-5-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" /> },
  TSLA:{ from: "#CC0000", to: "#ff5252", art: <path fill="#fff" d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /> },
  AMZN:{ from: "#FF9900", to: "#146eb4", art: <g><path fill="#fff" d="M5 6h14v9H5z" /><path d="M4 17c5 3.5 11 3.5 16 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /><path fill="#fff" d="M20 16.5l1.5 2.5-3-.5z" /></g> },
  GOOGL:{ from: "#4285F4", to: "#34A853", art: <g><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="#fff" strokeWidth="2.6" /><path d="M15 15l6 6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></g> },
  META:{ from: "#0081FB", to: "#0047ab", art: <g fill="none" stroke="#fff" strokeWidth="2.4"><circle cx="8.5" cy="12" r="4" /><circle cx="15.5" cy="12" r="4" /></g> },
  JPM: { from: "#003087", to: "#0066b3", art: <g fill="#fff"><path d="M5 8l7-4 7 4v1H5z" /><path d="M7 10h2v7H7z" /><path d="M11 10h2v7h-2z" /><path d="M15 10h2v7h-2z" /><path d="M5 18h14v2H5z" /></g> },
  V:   { from: "#1A1F71", to: "#F7B600", art: <path fill="#fff" d="M5 7l4.5 11h2L16 7h-2.6l-2.9 8L7.6 7z" /> },
  WMT: { from: "#0071CE", to: "#FFC220", art: <path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3.5 3.5M14.5 14.5L18 18M18 6l-3.5 3.5M9.5 14.5L6 18" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /> },
  DIS: { from: "#113CCF", to: "#7b5cff", art: <path fill="#fff" d="M7 20v-8l2-2V7l1.5 1.5L12 5l1.5 3.5L15 7v3l2 2v8zm3 0v-4a2 2 0 0 1 4 0v4z" /> },
  KO:  { from: "#F40009", to: "#8a0000", art: <path fill="#fff" d="M9 3h6v3c0 2 2 3 2 6s-2 4-2 6v3H9v-3c0-2-2-3-2-6s2-4 2-6z" /> },

  /* ── COMMODITIES ── */
  XAU: { from: "#FFD700", to: "#B8860B", art: <g fill="#fff"><path d="M9 7h6l2 4H7z" /><path d="M5.5 13h6l2 4h-10z" /><path d="M14 13h6l2 4h-10z" /></g> },
  XAG: { from: "#cfd8e3", to: "#8494a8", art: <g><circle cx="12" cy="12" r="7" fill="none" stroke="#fff" strokeWidth="2.2" /><path d="M12 8.5v7M9 10.5h6M9 13.5h6" stroke="#fff" strokeWidth="1.6" /></g> },
  WTI: { from: "#101418", to: "#2f6f4f", art: <path fill="#fff" d="M12 4c3 4 6 7 6 10a6 6 0 1 1-12 0c0-3 3-6 6-10z" /> },
  NG:  { from: "#00c2ff", to: "#0055ff", art: <path fill="#fff" d="M12 3c1 4 6 6 6 11a6 6 0 1 1-12 0c0-3 2-4 3-6 .8 1.6 2 2 3-5z" /> },
  WHEAT:{ from: "#f7b733", to: "#c98a1b", art: <path d="M12 21V8M12 8C9 8 8 6 8 4c3 0 4 2 4 4zm0 0c3 0 4-2 4-4-3 0-4 2-4 4zm0 5c-3 0-4-2-4-4 3 0 4 2 4 4zm0 0c3 0 4-2 4-4-3 0-4 2-4 4z" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" /> },
  COPPER:{ from: "#b87333", to: "#8c4a1f", art: <g><path d="M12 4l7 4v8l-7 4-7-4V8z" fill="none" stroke="#fff" strokeWidth="2.2" /><circle cx="12" cy="12" r="2.5" fill="#fff" /></g> },
  CORN:{ from: "#ffe259", to: "#7fb069", art: <g><path fill="#fff" d="M12 3c3 3 4 6 4 9s-1 7-4 9c-3-2-4-6-4-9s1-6 4-9z" /><path d="M12 6v13M9.5 9.5h5M9.5 13.5h5" stroke="rgba(0,0,0,.3)" strokeWidth="1.2" /></g> },
  COFFEE:{ from: "#6f4e37", to: "#3e2a1e", art: <g><path fill="#fff" d="M5 9h11v5a5 5 0 0 1-10 0z" /><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2M8.5 4c0 1.2-1 1.3-1 2.5M12.5 4c0 1.2-1 1.3-1 2.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" /></g> },
  SUGAR:{ from: "#ff9a9e", to: "#d16ba5", art: <g><path fill="#fff" d="M8 9h8v8H8z" /><path d="M8 9l3-3h8l-3 3M16 17l3-3V6" stroke="#fff" strokeWidth="1.6" fill="none" /></g> },
};

export function AssetVectorLogo({ symbol, className = "h-10 w-10" }: { symbol: string; className?: string }) {
  const cfg = LOGOS[symbol];
  if (!cfg) {
    return (
      <div className={`grid ${className} shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-light to-royal-violet text-[10px] font-extrabold text-[#0a0e27]`}>
        {symbol.slice(0, 3)}
      </div>
    );
  }
  const gid = `lg-${symbol}`;
  return (
    <svg viewBox="0 0 48 48" className={`${className} shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,.35)]`} role="img" aria-label={symbol}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cfg.from} />
          <stop offset="100%" stopColor={cfg.to} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill={`url(#${gid})`} />
      <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
      <g transform="translate(12 12)">{cfg.art}</g>
    </svg>
  );
}
