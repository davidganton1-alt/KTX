# KingdomTradeX Dashboard Design System (v1)

Governs the redesign of all four dashboards: Member, Pastor, Admin, and (future) Creator.
Principle: **calm authority**. Information hierarchy through typography and spacing, not
color and size. Numbers are tools, not decorations.

## Principles
1. Professional, not flashy. No hover-animated cards inside dashboards; motion is reserved for state changes (modal in/out).
2. Hierarchy = typography first. The largest thing on a dashboard is the page title (24px) — never a raw number.
3. 8px spacing grid. Card padding 16/20/24; grid gaps 16 (dense) or 24 (between sections).
4. Muted palette, strategic accent: gold marks *attention or platform value* (holds, review states, primary CTA); green marks *member profit only*; red reserved for destructive/failed. Never more than one accent per card.
5. Density without clutter: tabular figures, right-aligned money, 11px uppercase labels, one border weight (hairline `--border`).

## Typography scale
| Token | Size / Weight / Tracking | Use |
|---|---|---|
| Display | 32 / 600 / -0.02em | marketing-style hero areas only (rare in dashboards) |
| H1 | 24 / 600 / -0.01em | page title (PageHeader) |
| H2 | 20 / 500 | section titles |
| H3 | 16 / 500 | card titles |
| Body | 14 / 400 / lh 1.5 | rows, values, text |
| Small | 12 / 400 | context, notes |
| Label | 11 / 500 / +0.05em / uppercase | stat labels, table headers |

All numeric surfaces use `tabular-nums`. Money format: `$1,247.50` (2dp unless sub-cent
profit shares need 4dp). Date format: `Sep 14` / `Sep 14, 09:12` — never raw ISO.

## Spacing scale (8px base)
xs 4 · sm 8 · md 16 · lg 24 · xl 32 · 2xl 48
- Page gutter: 32 (p-8). Between-section: 24. Inside card: 20-24. Table cell: 10-12px y.

## Color tokens (existing CSS variables, dual theme already supported)
- bg `--bg` / card `--bg-soft` / inner `--card` · text `--fg` / `--muted`
- border `--border` · accents `--gold`, `--accent`
- success `#34D399` (light theme `--profit` #059669) · warning `#FBBF24` · error `#F87171` (light `--loss`)
- Status semantics: pending/review → gold, completed/available → green, failed/rejected → red, informational → cyan `#22D3EE`.

## Components (in `components/design-system/`)
- **Typography.tsx** — Display/H1/H2/H3/Body/Small/Label + `Num` (tabular value).
- **StatCard.tsx** — Label(11) + Value(20, tone) + Context(12). Replaces every `text-3xl` stat. `StatInline` for label/value rows in sidecards.
- **DataCard.tsx** — optional 16px title + 12px subtitle header, actions slot, 24px content padding, `padded={false}` for tables.
- **DataTable.tsx** — 11px uppercase headers, 14px tabular rows, hover `--card`, sort toggles, 5/10-row pagination; `StatusPill` (5 tones) for status cells.
- **Sidebar.tsx** — 240px, word-mark + role subtitle, optional section headings, one-word labels, badges as small gold chips, active = gold tint (not a filled block).
- **PageHeader.tsx** — breadcrumb(Label) + H1 + description + actions row; hairline bottom rule.

## Navigation naming (final proposals)
**Member:** Dashboard · Wallet · Earnings · AI Engine · Referrals · Settings
**Pastor:** Dashboard · Flock · Earnings · Invite · Settings
**Admin:** Dashboard · Treasury · Withdrawals (badges) · Users · Pastors · AI Engine · Announcements · Live Chat
Rules: one word where possible; no "My", no "&", no internal jargon ("Live Chat" ok, "IPN" never).

## Data accuracy requirements (all dashboards)
Every figure must map to a named field on a live endpoint:
- principal → `wallets.principal`; profit available → `profiles.accumulated_profit - total_profit_withdrawn`
- platform credit → `profiles.platform_credit`; deposits → `deposits`; withdrawal states → `withdrawals.status`
- referral available/pending → `/api/referral/balance` (matured vs held + in-review)
- treasury → `platform_wallets` (5 buckets) + `wallet_transactions` audit.

## Deliberately NOT allowed
3xl/4xl stat numbers · colored gradient cards in dashboards · hover transforms on data cards ·
emoji as icons in nav · mixed 10/16/24 radius (use rounded-xl=12 everywhere, rounded-lg for buttons) ·
green for anything that is not member money · more than two type sizes inside one card.
