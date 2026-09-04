# KingdomTradeX — Build Plan

> AI-powered **crypto** trading platform for a Christian audience.
> Futuristic, 3D-animated, highly interactive UX. Fully custom **user + admin** dashboards.
> Dual theme: **Royal-Dark** (primary) + **Daylight** (light mode).

## 1. Identity (decided)
- **Name:** KingdomTradeX.com
- **Tagline (draft):** "Trade with wisdom. Build with purpose."
- **Audience:** Christians seeking a faith-aligned, ethical, hope-filled crypto trading experience.
- **Tone:** Reverent but cutting-edge; trustworthy; prosperous (fruitfulness, stewardship).

## 2. Brand direction
- **Logo:** Biblical emblem (crown of life / cross / lion of Judah / ichthys / alpha-omega, etc.). 15 concept samples generated; final pick + refined vector + wordmark + favicon to follow.
- **Colors — Royal-Dark (primary):**
  - Base navy `#0A0E27` · Royal purple `#6D28D9`→`#A855F7` · Champagne gold `#F5C97B`→`#E6B450` · Electric cyan `#22D3EE`→`#06B6D4` · Pearl text `#EEF2FF` · Gain `#34D399` · Loss `#F87171`
- **Colors — Daylight (light mode):** same accents on a soft pearl/ivory `#F7F8FC` base with navy text — both themes share the same token scale.

## 3. Tech stack (approved)
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS (CSS variables driving both themes)
- **Animation:** Framer Motion + GSAP accents
- **3D:** React Three Fiber / Three.js (hero scene, coin/particle effects), optional Spline
- **Auth & roles:** NextAuth (or custom JWT) with `user` + `admin` roles
- **Data:** SQLite (100% local, zero external service) for dev; Postgres-ready schema for prod
- **Charts:** lightweight-charts / Recharts for candlesticks & portfolio
- **State:** Zustand / React Query

## 4. Information architecture
**Public**
- `/` Landing — 3D animated hero, faith + AI pitch, live-ticker mock
- `/features` AI signals, risk guardrails, prayer/stewardship framing
- `/pricing` Plans (free / pro / kingdom)
- `/about` Mission, verse-driven
- `/contact`
- `/login` `/register`

**User dashboard** (`/dashboard`)
- Portfolio & balances (crypto)
- AI trade signals feed
- Watchlist + live candlestick charts
- Performance / P&L
- Paper-trading simulator
- Settings, security, withdrawal

**Admin dashboard** (`/admin`)
- User management & KYC status
- Signal publishing & strategy control
- Platform analytics
- Content / verse / announcement management
- Withdrawal & risk oversight

## 5. Phased rollout
- **Phase 0 — Foundation:** Next.js init, Tailwind, dual-theme tokens, layout shell, fonts, design system, logo assets. *(previewable)*
- **Phase 1 — Public site:** Landing (3D hero + animations), Features, Pricing, About, Contact, Auth pages.
- **Phase 2 — Auth + User dashboard:** login/register, sessions, role gating, portfolio/signals/watchlist/charts.
- **Phase 3 — Admin dashboard:** full admin controls + analytics.
- **Phase 4 — AI trading module:** signal engine scaffold (pluggable model/API), paper-trader, risk guardrails.
- **Phase 5 — Polish & "go live locally":** run on localhost, responsive pass, a11y, final animations.

## 6. Next actions
1. User picks final logo → I deliver refined SVG/PNG + wordmark + favicon set.
2. Confirm color tokens → build design system.
3. Begin Phase 0 scaffold.

## 7. Open questions (for later)
- Real crypto data source (Binance/CoinGecko API) vs mocked feed for dev.
- Real AI model/API for signals, or rules-based simulator first.
- Payments / KYC scope for v1.
- Domain + hosting plan (local now; VPS later).
