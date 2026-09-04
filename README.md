# KTX — KingdomTradeX AI Trading Platform

Faith-aligned AI trading platform built on Christian values. AI-assisted trading across crypto, US stocks, and commodities with daily profit withdrawals.

## Tech Stack

- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** JWT cookie-based authentication
- **Data:** Local JSON files (users.json, pastors.json, announcements.json)
- **Deployment:** Docker (Debian container with standalone Next.js output)

## Features

- **AI Trading Engine** — trades across crypto, US stocks, and commodities with live Yahoo Finance prices
- **Three Tiers:** Faithful (0.5%/day), Steward (0.75%/day), Ambassador (1.0%/day)
- **Pastor Program** — pastors can invite members and earn a share of their profit
- **Member Referral Program** — invite friends and earn bonuses
- **Dual Theme** — light and dark mode
- **Admin Dashboard** — manage users, pastors, announcements, view analytics
- **User Console** — wallet, deposits, withdrawals, profit calendar, AI insights, notifications, referrals
- **Pastor Panel** — referral links, earnings chart, payout requests, activity feed, leaderboard
- **Live Markets** — real-time prices via CoinGecko (crypto) and Yahoo Finance fallback

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run with Docker
docker compose up -d
```

## Project Structure

```
KingdomTradeX/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── console/           # User dashboard
│   ├── pastor/            # Pastor panel
│   ├── ai-trading/        # AI trading engine page
│   └── ...
├── components/            # React components
├── lib/                   # Core logic (store, auth, engine, etc.)
├── public/                # Static assets
├── data/                  # JSON data files (gitignored)
├── Dockerfile             # Production Docker image
├── docker-compose.yml     # Docker Compose config
└── package.json
```

## Environment

No environment variables required for local development. The app uses local JSON files for data persistence.

## License

Private — all rights reserved.
