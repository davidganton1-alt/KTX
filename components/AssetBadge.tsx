"use client";

import { useState } from "react";

/* Accurate, recognizable vector logos for every asset, all inline SVG so
   they work offline and adapt to the theme.
   - Crypto: circular coins in brand colours with the real glyph
   - Stocks: rounded brand-colour tiles with each company's mark
   - Commodities: circular badges with a distinct icon per commodity */

const G = "var(--gold)";
const INK = "rgba(0,0,0,0.72)";

/* ---------- shared round badge (crypto + commodities) ---------- */
function Round({
  c1,
  c2,
  uid,
  children,
}: {
  c1: string;
  c2: string;
  uid: string;
  children: React.ReactNode;
}) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" role="img" aria-hidden>
      <defs>
        <radialGradient id={`rb-${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </radialGradient>
      </defs>
      <circle cx="24" cy="25" r="18.5" fill={`url(#rb-${uid})`} />
      <circle cx="24" cy="25" r="18.5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
      <ellipse cx="20" cy="12.5" rx="10" ry="3.4" fill="rgba(255,255,255,0.14)" />
      {children}
    </svg>
  );
}

/* ---------- crypto marks ---------- */
function CryptoMark({ symbol }: { symbol: string }) {
  switch (symbol) {
    case "BTC":
      // Bitcoin: orange coin, white ₿
      return (
        <Round c1="#f9a825" c2="#c66a00" uid="btc">
          <path
            fill="#fff"
            d="M29.2 23.1c1-.7 1.6-1.8 1.4-3.3-.3-2-2-2.7-4.2-2.9v-3h-1.8v2.9h-1.5v-2.9h-1.8v3h-2.4v1.9h1.3c.7 0 .9.4.9.9v6.6c0 .5-.2.8-.8.8h-1.4l-.3 2.1h2.3v3h1.8v-2.9h1.5v2.9h1.8v-3c2.9-.2 4.9-1 4.9-3.5 0-1.8-1-2.8-2.1-3.5zm-6.1-4.6h1.7c1.2 0 1.9.5 1.9 1.4 0 1-.7 1.4-1.9 1.4h-1.7v-2.8zm2 8.6h-2v-3.1h2c1.4 0 2.2.5 2.2 1.6 0 1-.8 1.5-2.2 1.5z"
          />
        </Round>
      );
    case "ETH":
      // Ethereum: indigo coin, white octahedron
      return (
        <Round c1="#7a8cf0" c2="#3b4cb0" uid="eth">
          <g fill="#fff">
            <path opacity="0.95" d="M24 11l-8 13.2L24 29l8-4.8L24 11z" />
            <path opacity="0.6" d="M24 29l-8-4.8 8 14.3 8-14.3-8 4.8z" />
          </g>
        </Round>
      );
    case "SOL":
      // Solana: dark coin, three gradient bars
      return (
        <Round c1="#131a2a" c2="#060a12" uid="sol">
          <defs>
            <linearGradient id="solg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#9945FF" />
              <stop offset="1" stopColor="#14F195" />
            </linearGradient>
          </defs>
          <g fill="url(#solg)">
            <path d="M15.5 17.5l2.4-2.4h14.6l-2.4 2.4H15.5z" />
            <path d="M15.5 24.5l2.4-2.4h14.6l-2.4 2.4H15.5z" transform="translate(0 .2)" />
            <path d="M15.5 31.9l2.4-2.4h14.6l-2.4 2.4H15.5z" />
          </g>
        </Round>
      );
    case "XRP":
      // XRP: silver coin, double chevron X
      return (
        <Round c1="#e3e7ef" c2="#9aa2b4" uid="xrp">
          <g fill="none" stroke={INK} strokeWidth="2.7" strokeLinecap="round">
            <path d="M15.5 15.5c4.2 4.4 6.3 6.6 8.5 6.6s4.3-2.2 8.5-6.6" />
            <path d="M15.5 34.5c4.2-4.4 6.3-6.6 8.5-6.6s4.3 2.2 8.5 6.6" />
          </g>
        </Round>
      );
    case "BNB":
      // BNB: gold coin, four-diamond cluster
      return (
        <Round c1="#f3ba2f" c2="#b8860b" uid="bnb">
          <g fill="#fff">
            <rect x="21.2" y="12.2" width="5.6" height="5.6" transform="rotate(45 24 15)" />
            <rect x="12.7" y="22.2" width="5.6" height="5.6" transform="rotate(45 15.5 25)" />
            <rect x="29.7" y="22.2" width="5.6" height="5.6" transform="rotate(45 32.5 25)" />
            <rect x="21.2" y="32.2" width="5.6" height="5.6" transform="rotate(45 24 35)" />
          </g>
        </Round>
      );
    case "USDT":
      // Tether: green coin, white T
      return (
        <Round c1="#26a17b" c2="#0e5f47" uid="usdt">
          <g fill="#fff">
            <rect x="14.5" y="14.5" width="19" height="3.8" rx="1.2" />
            <rect x="22.1" y="14.5" width="3.8" height="20" rx="1.2" />
            <rect x="17.5" y="21.8" width="13" height="3.2" rx="1.2" />
          </g>
        </Round>
      );
    case "USDC":
      // USD Coin: blue coin, white dollar ring
      return (
        <Round c1="#4b8ef1" c2="#1f56c0" uid="usdc">
          <circle cx="24" cy="25" r="9.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeDasharray="40 12" strokeLinecap="round" />
          <path
            fill="#fff"
            d="M23 17.6v1.8c-2.4.3-4 1.6-4 3.4 0 2.2 1.9 3 4.3 3.6 2.5.6 3.7 1.2 3.7 2.5 0 1.4-1.4 2.3-3.5 2.3-1.9 0-3.3-.7-4.1-1.8l-1.5 1.6c1 1.4 2.5 2.2 4.6 2.5v1.9h2v-1.9c2.5-.3 4.1-1.7 4.1-3.6 0-2.3-2-3.1-4.4-3.7-2.4-.6-3.6-1.1-3.6-2.4 0-1.2 1.2-2.1 3.2-2.1 1.7 0 3 .6 3.7 1.5l1.5-1.5c-.9-1.2-2.3-2-4.2-2.3v-1.8h-2z"
          />
        </Round>
      );
    default:
      return (
        <Round c1="color-mix(in srgb, var(--gold) 55%, transparent)" c2="color-mix(in srgb, var(--cyan) 55%, transparent)" uid={`g-${symbol.toLowerCase()}`}>
          <text x="24" y="30" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--fg)">
            {symbol.slice(0, 2)}
          </text>
        </Round>
      );
  }
}

function CryptoLogo({ symbol, image }: { symbol: string; image?: string }) {
  const [err, setErr] = useState(false);
  if (image && !err) {
    return (
      <span className="relative inline-flex h-full w-full items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={symbol}
          className="h-[78%] w-[78%] object-contain"
          onError={() => setErr(true)}
        />
      </span>
    );
  }
  return <CryptoMark symbol={symbol} />;
}

/* ---------- stock brand tiles ---------- */
function Tile({
  c1,
  c2,
  uid,
  children,
}: {
  c1: string;
  c2: string;
  uid: string;
  children: React.ReactNode;
}) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" role="img" aria-hidden>
      <defs>
        <linearGradient id={`st-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect x="5.5" y="5.5" width="37" height="37" rx="11.5" fill={`url(#st-${uid})`} />
      <rect x="5.5" y="5.5" width="37" height="37" rx="11.5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
      <rect x="9" y="7.5" width="30" height="7" rx="3.5" fill="rgba(255,255,255,0.1)" />
      {children}
    </svg>
  );
}

const STOCKS: Record<
  string,
  { c1: string; c2: string; mark: React.ReactNode }
> = {
  // Apple — accurate silhouette with bite and leaf
  AAPL: {
    c1: "#f8fafc",
    c2: "#c8d0dc",
    mark: (
      <g transform="translate(6,6) scale(1.5)" fill="#1f2430">
        <path d="M12.2 4.6c.9 0 2-.6 2.6-1.4.6-.7 1-1.7 1-2.7-.9 0-1.9.6-2.5 1.3-.6.7-1 1.7-1.1 2.8z" />
        <path d="M14.8 5.2c-1.1 0-2.1.7-3.2.7-1.1 0-2.3-.7-3.6-.7-1.7 0-3.4 1-4.3 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3 0 1.7-.8 3.4-.8s2.1.8 3.5.8 2.3-1.3 3.1-2.5c6-1 .9-1.6 1.5-2.9-1.8-.8-2.6-3.3-1.4-4.9-.7-1-2.2-2.3-3.5-2.3z" />
      </g>
    ),
  },
  // Microsoft — four squares
  MSFT: {
    c1: "#ffffff",
    c2: "#e2e8f0",
    mark: (
      <g>
        <rect x="13" y="13" width="10" height="10" fill="#F25022" />
        <rect x="25" y="13" width="10" height="10" fill="#7FBA00" />
        <rect x="13" y="25" width="10" height="10" fill="#00A4EF" />
        <rect x="25" y="25" width="10" height="10" fill="#FFB900" />
      </g>
    ),
  },
  // NVIDIA — green tile, stylized eye
  NVDA: {
    c1: "#8ce000",
    c2: "#5d9400",
    mark: (
      <g>
        <path
          d="M10.5 25.5C14 17.5 19.5 13.5 25 13.7c6.2.2 10.9 4.6 12.9 8.3-2.3 4.4-7 8.3-12.9 8.3-5.6 0-11-2.6-14.5-4.8z"
          fill="#fff"
        />
        <circle cx="26.5" cy="22.5" r="4.2" fill="#5d9400" />
        <path d="M10.5 25.5c1.3-5.5 4.6-10 9.2-11.6l-3.2 5.2c-2 1.6-3.5 3.6-4.4 6.4h-1.6z" fill="#d9f7a3" />
      </g>
    ),
  },
  // Tesla — red tile, T spear
  TSLA: {
    c1: "#ff3b40",
    c2: "#a30f14",
    mark: (
      <g fill="#fff">
        <path d="M11 14.5C15 11.8 19.4 10.5 24 10.5S33 11.8 37 14.5l-2.6 1.8c-3.1-1.8-6.6-2.7-10.4-2.7s-7.3.9-10.4 2.7L11 14.5z" />
        <path d="M20.8 17.2c1-.5 2.1-.7 3.2-.7s2.2.2 3.2.7L24 37.5l-3.2-20.3z" />
      </g>
    ),
  },
  // Amazon — dark tile, orange smile arrow
  AMZN: {
    c1: "#2b3a52",
    c2: "#131a26",
    mark: (
      <g>
        <text x="24" y="26" textAnchor="middle" fontSize="19" fontWeight="800" fill="#fff" fontFamily="Georgia, serif">
          a
        </text>
        <path d="M12 30.5c7.6 5.8 18 6 24.5.6" fill="none" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
        <path d="M36.5 31.3l4.2 1.9-2.6-3.8" fill="#FF9900" />
      </g>
    ),
  },
  // Google — white tile, four-colour G
  GOOGL: {
    c1: "#ffffff",
    c2: "#e6e9f0",
    mark: (
      <g transform="translate(7.5,7.5) scale(0.6875)">
        <path fill="#4285F4" d="M46 24.5c0-1.4-.1-2.8-.4-4.1H24v8.2h12.3c-.6 3-2.3 5.6-4.8 7.3l7.5 5.8c4.4-4.1 7-10.1 7-17.2z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.4 0-11.8-4.3-13.8-10.1H2.5v6C6.5 42.6 14.6 48 24 48z" />
        <path fill="#FBBC05" d="M10.2 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6v-6H2.5C.9 16.7 0 20.2 0 24s.9 7.3 2.5 10.6l7.7-6z" />
        <path fill="#EA4335" d="M24 9.3c3.6 0 6.8 1.2 9.4 3.6l6.9-6.9C35.9 2.3 30.5 0 24 0 14.6 0 6.5 5.4 2.5 13.4l7.7 6C12.2 13.6 17.6 9.3 24 9.3z" />
      </g>
    ),
  },
  // Meta — blue tile, infinity loop
  META: {
    c1: "#0866FF",
    c2: "#0343ad",
    mark: (
      <path
        d="M15 31c-2.8 0-4.8-2.6-4.8-5.6 0-3 2-5.6 4.8-5.6 2.3 0 4.2 2 6.6 5.9l.4.7.4-.7c2.4-3.9 4.3-5.9 6.6-5.9 2.8 0 4.8 2.6 4.8 5.6 0 3-2 5.6-4.8 5.6-2.2 0-4-1.8-6.3-5.3-.3-.5-.5-.8-.7-1.1-.2.3-.4.6-.7 1.1C18.9 29.2 17.2 31 15 31z"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    ),
  },
  // JPMorgan Chase — navy tile, octagon + wordmark
  JPM: {
    c1: "#1d6fd0",
    c2: "#0a3a78",
    mark: (
      <g>
        <path d="M24 10l9.9 4.1L38 24l-4.1 9.9L24 38l-9.9-4.1L10 24l4.1-9.9z" fill="none" stroke="#fff" strokeWidth="2.2" />
        <text x="24" y="28" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff" letterSpacing="0.5">
          JPM
        </text>
      </g>
    ),
  },
  // Visa — navy tile, italic V wordmark
  V: {
    c1: "#243b8f",
    c2: "#0c1147",
    mark: (
      <g fill="#fff">
        <path d="M14 16l6.5 16h4.2L35.8 16h-4.4l-7.1 12.6L21.6 16H14z" />
      </g>
    ),
  },
  // Walmart — blue tile, yellow spark
  WMT: {
    c1: "#1a7fd6",
    c2: "#00457a",
    mark: (
      <g fill="#ffc220">
        <rect x="22.4" y="10" width="3.2" height="10" rx="1.6" />
        <rect x="22.4" y="28" width="3.2" height="10" rx="1.6" />
        <rect x="10" y="22.4" width="10" height="3.2" rx="1.6" />
        <rect x="28" y="22.4" width="10" height="3.2" rx="1.6" />
        <rect x="13.3" y="14.7" width="10" height="3.2" rx="1.6" transform="rotate(60 18.3 16.3)" />
        <rect x="24.7" y="30.1" width="10" height="3.2" rx="1.6" transform="rotate(60 29.7 31.7)" />
        <rect x="13.3" y="30.1" width="10" height="3.2" rx="1.6" transform="rotate(-60 18.3 31.7)" />
        <rect x="24.7" y="14.7" width="10" height="3.2" rx="1.6" transform="rotate(-60 29.7 16.3)" />
      </g>
    ),
  },
  // Disney — blue tile, castle silhouette
  DIS: {
    c1: "#2a52d9",
    c2: "#0a2378",
    mark: (
      <g fill="#fff">
        <path d="M24 8.5l1 3h-2l1-3z" />
        <path d="M21.6 13.5h4.8l-1-2.4h-2.8l-1 2.4z" />
        <path d="M22.2 15h3.6l.9 8h-5.4l.9-8z" />
        <path d="M15 23.5h18v3H15z" />
        <path d="M15.5 26.5h4v9h-4zM28.5 26.5h4v9h-4zM21.5 26.5h5v9h-5z" />
        <path d="M13.5 20h4l-2-4.5-2 4.5zM30.5 20h4l-2-4.5-2 4.5z" />
        <path d="M24 29.8l1.2 2.4h-2.4l1.2-2.4z" fill="#2a52d9" />
      </g>
    ),
  },
  // Coca-Cola — red tile, dynamic ribbon waves
  KO: {
    c1: "#f40009",
    c2: "#8a0005",
    mark: (
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M10 24.5c2.6-5.6 6.3-7.6 10-6.1 3 1.2 4.9 4.6 8.6 4.6 3.5 0 6.2-1.7 7.4-4.5" strokeWidth="3" />
        <path d="M12.5 31.5c3.4-4.2 6.9-5.3 10.4-4 2.7 1 4.6 2.7 7.4 2.3 2.4-.3 4.2-1.7 5.2-3.8" strokeWidth="2.2" opacity="0.75" />
      </g>
    ),
  },
};

function StockMark({ symbol }: { symbol: string }) {
  const def = STOCKS[symbol];
  if (!def) {
    return (
      <Tile c1={G} c2="var(--purple)" uid={`g-${symbol.toLowerCase()}`}>
        <text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">
          {symbol.slice(0, 3)}
        </text>
      </Tile>
    );
  }
  return (
    <Tile c1={def.c1} c2={def.c2} uid={symbol.toLowerCase()}>
      {def.mark}
    </Tile>
  );
}

/* ---------- commodities ---------- */
function Commodity({ symbol }: { symbol: string }) {
  switch (symbol) {
    case "XAU":
      // Gold bullion — stacked bars
      return (
        <Round c1="#f5c97b" c2="#a06a08" uid="xau">
          <g stroke={INK} strokeWidth="1" strokeLinejoin="round">
            <path d="M13.5 30l2.2-4.4h16.6l2.2 4.4H13.5z" fill="#ffe9b3" />
            <path d="M15 25.6l2.2-4.4h13.6l2.2 4.4H15z" fill="#f5c97b" />
            <path d="M20 30l1.8-3.6h4.4l1.8 3.6H20z" fill="#d99a2b" opacity="0" />
          </g>
          <text x="24" y="34.4" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={INK}>
            999.9
          </text>
        </Round>
      );
    case "XAG":
      // Silver — stacked coins
      return (
        <Round c1="#eef1f6" c2="#98a1b3" uid="xag">
          <g stroke={INK} strokeWidth="1">
            <ellipse cx="24" cy="31" rx="10.5" ry="3.6" fill="#d7dce5" />
            <ellipse cx="24" cy="27" rx="10.5" ry="3.6" fill="#e8ecf2" />
            <ellipse cx="24" cy="23" rx="10.5" ry="3.6" fill="#f7f9fc" />
          </g>
          <text x="24" y="25.6" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={INK}>
            Ag
          </text>
        </Round>
      );
    case "WTI":
      // Crude oil — dark droplet on charcoal
      return (
        <Round c1="#3d4657" c2="#12161f" uid="wti">
          <path d="M24 12c-4.2 6-6.4 10-6.4 13.6a6.4 6.4 0 0 0 12.8 0C30.4 22 28.2 18 24 12z" fill="#0c0f14" stroke="#f5c97b" strokeWidth="1.4" />
          <ellipse cx="21.8" cy="24.5" rx="1.7" ry="3.2" fill="rgba(245,201,123,0.45)" />
        </Round>
      );
    case "NG":
      // Natural gas — blue flame
      return (
        <Round c1="#20415f" c2="#0a1a2c" uid="ng">
          <path d="M24 11c1 4.2-1 6.2-2.9 8.4-1.7 2-3.4 4.2-3.4 7a6.3 6.3 0 0 0 12.6 0c0-2.6-1.2-4.5-2.4-6.3-.5 1.3-1.3 2-2.3 2.5.8-3.9.2-8-1.6-11.6z" fill="#22d3ee" />
          <path d="M24 21.5c.7 2.3-.2 3.5-1.2 4.8-.9 1.2-1.6 2.4-1.6 3.9a3.8 3.8 0 0 0 7.6 0c0-1.6-.8-2.9-1.6-4-.3.8-.8 1.3-1.4 1.6.5-2.3 0-4.4-1.8-6.3z" fill="#e0faff" />
        </Round>
      );
    case "WHEAT":
      // Wheat ear
      return (
        <Round c1="#e9c46a" c2="#96660f" uid="wheat">
          <path d="M24 37V17" stroke="#5c3d06" strokeWidth="1.8" strokeLinecap="round" />
          <g fill="#fff7e0" stroke="#8a5a00" strokeWidth="0.9">
            <ellipse cx="24" cy="14.5" rx="2.6" ry="4.6" />
            <ellipse cx="19.6" cy="19.5" rx="2.4" ry="4.2" transform="rotate(-28 19.6 19.5)" />
            <ellipse cx="28.4" cy="19.5" rx="2.4" ry="4.2" transform="rotate(28 28.4 19.5)" />
            <ellipse cx="19.6" cy="26.5" rx="2.4" ry="4.2" transform="rotate(-28 19.6 26.5)" />
            <ellipse cx="28.4" cy="26.5" rx="2.4" ry="4.2" transform="rotate(28 28.4 26.5)" />
          </g>
        </Round>
      );
    case "CORN":
      // Corn cob with husk
      return (
        <Round c1="#f0d060" c2="#a37d08" uid="corn">
          <ellipse cx="24" cy="23" rx="5.6" ry="10" fill="#ffd23f" stroke="#8a5a00" strokeWidth="1" />
          <g stroke="#b97f0a" strokeWidth="0.8" opacity="0.8">
            <path d="M21 15.5h6M20 19h8M19.5 23h9M20 27h8M21 30.5h6" fill="none" />
            <path d="M22 13.8v18.4M26 13.8v18.4" fill="none" />
          </g>
          <path d="M18.2 30c-2.6 1.4-4.2 4-4.4 7 3-.2 5.4-1.6 6.8-3.8z" fill="#7fb069" stroke="#3f6b31" strokeWidth="0.9" />
          <path d="M29.8 30c2.6 1.4 4.2 4 4.4 7-3-.2-5.4-1.6-6.8-3.8z" fill="#7fb069" stroke="#3f6b31" strokeWidth="0.9" />
        </Round>
      );
    case "COFFEE":
      // Coffee bean
      return (
        <Round c1="#a9743f" c2="#4a2c12" uid="coffee">
          <ellipse cx="24" cy="24" rx="9.6" ry="12.5" fill="#6f4322" stroke="#f5c97b" strokeWidth="1.2" transform="rotate(18 24 24)" />
          <path d="M27.5 13.5c-4.8 5.4-7.8 11-6.6 21" stroke="#f5c97b" strokeWidth="1.8" fill="none" transform="rotate(18 24 24)" />
        </Round>
      );
    case "SUGAR":
      // Sugar cube
      return (
        <Round c1="#dfe9f5" c2="#9db4d0" uid="sugar">
          <g stroke={INK} strokeWidth="1" strokeLinejoin="round">
            <path d="M15 21.5l9-5 9 5-9 5-9-5z" fill="#ffffff" />
            <path d="M15 21.5v8.5l9 5v-8.5l-9-5z" fill="#dbe6f2" />
            <path d="M33 21.5v8.5l-9 5v-8.5l9-5z" fill="#c3d4e8" />
          </g>
          <g fill="#fff">
            <circle cx="20.5" cy="18.5" r="0.8" />
            <circle cx="26" cy="16.5" r="0.8" />
            <circle cx="24" cy="21" r="0.8" />
          </g>
        </Round>
      );
    case "COPPER":
      // Copper coin
      return (
        <Round c1="#f0934d" c2="#8c3f0e" uid="copper">
          <circle cx="24" cy="24" r="10.5" fill="#d97b33" stroke="#5c2c08" strokeWidth="1.2" />
          <circle cx="24" cy="24" r="7.2" fill="none" stroke="#5c2c08" strokeWidth="1" opacity="0.55" />
          <text x="24" y="27.4" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#3f1d00">
            Cu
          </text>
        </Round>
      );
    default:
      return (
        <Round c1="color-mix(in srgb, var(--gold) 45%, transparent)" c2="color-mix(in srgb, var(--cyan) 45%, transparent)" uid={`g-${symbol.toLowerCase()}`}>
          <text x="24" y="29" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--fg)">
            {symbol.slice(0, 2)}
          </text>
        </Round>
      );
  }
}

export function AssetBadge({
  symbol,
  assetClass,
  size = 32,
  image,
}: {
  symbol: string;
  assetClass?: string;
  size?: number;
  image?: string;
}) {
  const cls = (assetClass || "").toLowerCase();
  const isCrypto = cls.includes("crypto");
  const isStock = cls.includes("stock");
  const inner = isCrypto ? (
    <CryptoLogo symbol={symbol} image={image} />
  ) : isStock ? (
    <StockMark symbol={symbol} />
  ) : (
    <Commodity symbol={symbol} />
  );
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {inner}
    </span>
  );
}
