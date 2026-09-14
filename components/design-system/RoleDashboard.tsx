'use client';

// Shared full dashboard for role-holders (Pastor / Creator).
// A role holder is a USER FIRST: every member feature (wallet, own
// profit earnings, AI engine, referrals, settings) plus a role section
// (Ministry / Network). One implementation, two personas — no drift.

import { useState } from 'react';
import { Sidebar, type NavSection } from './Sidebar';
import { PageHeader } from './PageHeader';
import { StatCard, StatInline } from './StatCard';
import { DataCard } from './DataCard';
import { DataTable, StatusPill } from './DataTable';
import { Button } from './Button';
import { ThemeToggle } from '@/components/ThemeToggle';

export type RolePersona = {
  brandSub: string; // "Pastor" | "Creator"
  roleSection: string; // "Ministry" | "Network"
  peopleLabel: string; // "Flock" | "Community"
  name: string; // persona display name
  org: string; // ministry / brand name
  orgField: string; // "Ministry / church" | "Brand"
};

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ICONS = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  earnings: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  engine: 'M9 3v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
  people: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857',
  commissions: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1.042',
  invite: 'M8.684 13.342a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 5.316a3 3 0 105.316 1.5m-5.316-6.816a3 3 0 105.316-1.5',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066',
};

function sectionsFor(p: RolePersona): NavSection[] {
  return [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
        { id: 'wallet', label: 'Wallet', icon: ICONS.wallet },
        { id: 'earnings', label: 'Earnings', icon: ICONS.earnings },
        { id: 'engine', label: 'AI Engine', icon: ICONS.engine },
      ],
    },
    {
      heading: p.roleSection,
      items: [
        { id: 'flock', label: p.peopleLabel, icon: ICONS.people },
        { id: 'commissions', label: 'Commissions', icon: ICONS.commissions },
        { id: 'invite', label: 'Invite', icon: ICONS.invite },
      ],
    },
    {
      heading: 'Account',
      items: [{ id: 'settings', label: 'Settings', icon: ICONS.settings }],
    },
  ];
}

const TRANSACTIONS = [
  { id: 't1', date: 'Sep 14', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't2', date: 'Sep 13', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't3', date: 'Sep 12', type: 'Deposit', amount: 5000, status: 'completed' },
  { id: 't4', date: 'Sep 11', type: 'Profit withdrawal', amount: -200, status: 'completed' },
  { id: 't5', date: 'Sep 10', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't6', date: 'Sep 09', type: 'Commission credit', amount: 12.5, status: 'hold' },
];

const PEOPLE = [
  { id: 'f1', name: 'Amara Okafor', tier: 'Ambassador', principal: 7000, profitToday: 37.5, share: 3.75, joined: 'Jul 2026' },
  { id: 'f2', name: 'Daniel Mwangi', tier: 'Steward', principal: 2500, profitToday: 12.5, share: 1.25, joined: 'Aug 2026' },
  { id: 'f3', name: 'Grace Adeyemi', tier: 'Steward', principal: 1800, profitToday: 9.0, share: 0.9, joined: 'Aug 2026' },
  { id: 'f4', name: 'Peter Okonkwo', tier: 'Faithful', principal: 650, profitToday: 1.63, share: 0.16, joined: 'Sep 2026' },
  { id: 'f5', name: 'Esther Kimani', tier: 'Faithful', principal: 400, profitToday: 1.0, share: 0.1, joined: 'Sep 2026' },
  { id: 'f6', name: 'Joseph Balogun', tier: 'Steward', principal: 1200, profitToday: 6.0, share: 0.6, joined: 'Sep 2026' },
];

const COMMISSIONS = [
  { id: 'c1', date: 'Sep 12', member: 'Sofia Reyes', type: 'First-deposit bonus 5%', amount: 310, status: 'hold' },
  { id: 'c2', date: 'Sep 14', member: 'Amara Okafor', type: 'Profit share 0.1%', amount: 3.75, status: 'hold' },
  { id: 'c3', date: 'Sep 12', member: 'Amara Okafor', type: 'Profit share 0.1%', amount: 3.75, status: 'hold' },
  { id: 'c4', date: 'Aug 02', member: 'Daniel Mwangi', type: 'First-deposit bonus 5%', amount: 125, status: 'review' },
  { id: 'c5', date: 'Jul 19', member: 'Amara Okafor', type: 'First-deposit bonus 5%', amount: 350, status: 'available' },
  { id: 'c6', date: 'Jul 05', member: 'Grace Adeyemi', type: 'Profit share 0.1%', amount: 21.4, status: 'paid' },
];

const PROFIT_WEEK = [
  { day: 'Sep 8', amt: 21.2 }, { day: 'Sep 9', amt: 25 }, { day: 'Sep 10', amt: 37.5 },
  { day: 'Sep 11', amt: 37.5 }, { day: 'Sep 12', amt: 37.5 }, { day: 'Sep 13', amt: 37.5 }, { day: 'Sep 14', amt: 37.5 },
];

function Pill({ tone, children }: { tone: 'green' | 'gold' | 'red' | 'cyan' | 'muted'; children: React.ReactNode }) {
  return <StatusPill tone={tone}>{children}</StatusPill>;
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-[var(--gold)]' : 'border border-[var(--border)] bg-[var(--card)]'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  );
}

export function RoleDashboard({ persona }: { persona: RolePersona }) {
  const [tab, setTab] = useState('dashboard');
  return (
    <div className="flex min-h-screen" data-preview={persona.brandSub.toLowerCase()}>
      <Sidebar brand="KingdomTradeX" brandSub={persona.brandSub} sections={sectionsFor(persona)} active={tab} onSelect={setTab} footer={<ThemeToggle />} />
      <main className="min-w-0 flex-1 p-8">
        <div key={tab} className="ds-fade-in mx-auto max-w-[1200px]">
          {tab === 'dashboard' && <Overview p={persona} go={setTab} />}
          {tab === 'wallet' && <WalletTab />}
          {tab === 'earnings' && <EarningsTab />}
          {tab === 'engine' && <EngineTab />}
          {tab === 'flock' && <PeopleTab p={persona} />}
          {tab === 'commissions' && <CommissionsTab />}
          {tab === 'invite' && <InviteTab p={persona} />}
          {tab === 'settings' && <SettingsTab p={persona} />}
        </div>
        <p className="mt-10 text-center text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Design preview · data is illustrative
        </p>
      </main>
    </div>
  );
}

function Overview({ p, go }: { p: RolePersona; go: (t: string) => void }) {
  return (
    <>
      <PageHeader
        crumbs={[p.brandSub, 'Dashboard']}
        title={p.name}
        description={`${p.org} · Ambassador plan · 23 ${p.peopleLabel.toLowerCase()} members · hold ends Apr 13, 2027`}
        actions={
          <>
            <Button variant="secondary" onClick={() => go('wallet')}>Withdraw profit</Button>
            <Button variant="primary" onClick={() => go('wallet')}>Deposit</Button>
          </>
        }
      />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Principal" value={`$${money(5000)}`} context="Ambassador plan" onClick={() => go('wallet')} />
        <StatCard label="Accumulated profit" value={`$${money(1247.5)}`} tone="profit" context="$1,047.50 available" onClick={() => go('earnings')} />
        <StatCard label="Today's profit" value="+$37.50" tone="profit" context="0.75% daily target" />
        <StatCard label="Platform credit" value="$50.00" tone="gold" context="Earns profit · not withdrawable" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label={`${p.peopleLabel} size`} value="23 members" context="4 joined this month" onClick={() => go('flock')} />
        <StatCard label={`${p.peopleLabel} principal`} value={`$${money(96500)}`} context="Under your invitation" />
        <StatCard label="Commissions earned" value={`$${money(2412.6)}`} tone="gold" context="5% bonuses + 0.1% lifetime" onClick={() => go('commissions')} />
        <StatCard label="Available to withdraw" value={`$${money(408.6)}`} tone="profit" context="$204.00 pending hold" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Recent transactions" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={TRANSACTIONS} pageSize={5} columns={[
              { key: 'date', header: 'Date', width: '86px' },
              { key: 'type', header: 'Description' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className={r.amount >= 0 ? 'text-[var(--profit)]' : ''}>{r.amount >= 0 ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'hold' ? <Pill tone="gold">7-day hold</Pill> : <Pill tone="green">Done</Pill>) },
            ]} />
          </div>
        </DataCard>
        <div className="space-y-6">
          <DataCard title="Your plan">
            <div className="space-y-2.5">
              <StatInline label="Tier" value="Ambassador" tone="gold" />
              <StatInline label="Daily target" value="0.75%" tone="profit" />
              <StatInline label={`${p.brandSub} commission`} value="5% + 0.1%" tone="gold" />
            </div>
          </DataCard>
          <DataCard title="Quick actions">
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={() => go('wallet')}>Deposit</Button>
              <Button variant="secondary" onClick={() => go('wallet')}>Withdraw profit</Button>
              <Button variant="ghost" onClick={() => go('invite')}>Copy invite link</Button>
            </div>
          </DataCard>
        </div>
      </div>
    </>
  );
}

function WalletTab() {
  return (
    <>
      <PageHeader crumbs={['Wallet']} title="Wallet" description="USDT (TRC20) deposits and payouts. Identical to every member's wallet — your role adds income on top, never access." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Principal" value={`$${money(5000)}`} context="Ambassador plan" />
        <StatCard label="Profit available" value={`$${money(1047.5)}`} tone="profit" context="Withdraws instantly, no approval" />
        <StatCard label="Platform credit" value="$50.00" tone="gold" context="Not withdrawable" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Deposit" subtitle="Generates a personal TRC20 address + QR" interactive>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((a) => (
              <Button key={a} variant="secondary" size="sm">{'$' + a.toLocaleString('en-US')}</Button>
            ))}
          </div>
          <div className="mt-3 flex gap-3">
            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--muted)]">Amount in USD</div>
            <Button variant="primary">Get address</Button>
          </div>
          <p className="mt-3 text-[12px] text-[var(--muted)]">Min $100 · Max $15,000 · USDT TRC20 only</p>
        </DataCard>
        <DataCard title="Withdraw" interactive>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[var(--fg)]">Profit</p>
                <p className="text-[12px] text-[var(--muted)]">Automatic payout · no fee · minutes</p>
              </div>
              <Button variant="primary" size="sm">Withdraw $1,047.50</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[var(--fg)]">Principal</p>
                <p className="text-[12px] text-[var(--muted)]">Admin review 12–24h · 50% fee until Apr 2027</p>
              </div>
              <Button variant="secondary" size="sm">Request</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[var(--fg)]">Commissions</p>
                <p className="text-[12px] text-[var(--muted)]">Admin review · unlocks after 7-day hold</p>
              </div>
              <Button variant="secondary" size="sm">Request $408.60</Button>
            </div>
          </div>
        </DataCard>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Deposit history" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={[
              { id: 'd1', date: 'Sep 12, 2026', usd: 5000, paid: 4972.14, tier: 'Ambassador' },
              { id: 'd2', date: 'Aug 03, 2026', usd: 2000, paid: 1988.6, tier: 'Steward' },
              { id: 'd3', date: 'Jul 13, 2026', usd: 1000, paid: 994.2, tier: 'Faithful' },
            ]} columns={[
              { key: 'date', header: 'Date' },
              { key: 'usd', header: 'USD', align: 'right', render: (r) => `$${money(r.usd)}` },
              { key: 'paid', header: 'Paid (USDT)', align: 'right', render: (r) => money(r.paid) },
              { key: 'tier', header: 'Tier' },
              { key: 'st', header: 'Status', align: 'right', render: () => <Pill tone="green">Completed</Pill> },
            ]} />
          </div>
        </DataCard>
        <DataCard title="All transactions" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={TRANSACTIONS} pageSize={5} columns={[
              { key: 'date', header: 'Date', width: '86px' },
              { key: 'type', header: 'Description' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className={r.amount >= 0 ? 'text-[var(--profit)]' : ''}>{r.amount >= 0 ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'hold' ? <Pill tone="gold">Hold</Pill> : <Pill tone="green">Done</Pill>) },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function EarningsTab() {
  const max = Math.max(...PROFIT_WEEK.map((d) => d.amt));
  return (
    <>
      <PageHeader crumbs={['Earnings']} title="Earnings" description="Your own profit ledger — same engine as every member. Commissions live in their own tab." actions={<Button variant="primary">Withdraw profit</Button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Lifetime" value={`$${money(1247.5)}`} />
        <StatCard label="Available" value={`$${money(1047.5)}`} tone="profit" />
        <StatCard label="This week" value="+$233.7" tone="profit" />
        <StatCard label="Daily rate" value="0.75%" context="$37.50 / day at current principal" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Last 7 days" className="lg:col-span-2">
          <div className="flex h-40 items-end gap-3">
            {PROFIT_WEEK.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] tabular-nums text-[var(--muted)]">{d.amt.toFixed(0)}</span>
                <div className="w-full rounded-t-md bg-gradient-to-t from-[var(--gold)]/40 to-[var(--gold)] transition-all" style={{ height: `${(d.amt / max) * 110}px` }} />
                <span className="text-[10px] text-[var(--muted)]">{d.day.replace('Sep ', '')}</span>
              </div>
            ))}
          </div>
        </DataCard>
        <DataCard title="How profit is computed">
          <div className="space-y-2.5">
            <StatInline label="Principal" value="$5,000" />
            <StatInline label="Platform credit" value="+$50" tone="gold" />
            <StatInline label="Basis" value="$5,050" />
            <StatInline label="Rate (Ambassador)" value="0.75% / day" tone="profit" />
            <StatInline label="Daily target" value="$37.88" tone="profit" />
          </div>
          <p className="mt-3 text-[11px] leading-[1.6] text-[var(--muted)]">Targets, not promises. Actual daily returns vary with the market.</p>
        </DataCard>
      </div>
      <div className="mt-6">
        <DataCard title="Withdrawal history" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={[
              { id: 'w1', date: 'Sep 11, 2026', type: 'Profit', amount: 200, network: 'TRC20', status: 'completed' },
              { id: 'w2', date: 'Aug 02, 2026', type: 'Profit', amount: 150, network: 'TRC20', status: 'completed' },
              { id: 'w3', date: 'Sep 13, 2026', type: 'Commission', amount: 204, network: 'TRC20', status: 'review' },
            ]} columns={[
              { key: 'date', header: 'Date' },
              { key: 'type', header: 'Type' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r) => `$${money(r.amount)}` },
              { key: 'network', header: 'Network', align: 'right' },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'review' ? <Pill tone="gold">In review</Pill> : <Pill tone="green">Paid</Pill>) },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function EngineTab() {
  return (
    <>
      <PageHeader crumbs={['AI Engine']} title="AI Engine" description="Live execution on your allocated desk. Every fill is published to your ledger." />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Win rate (30d)" value="71%" tone="profit" context="1,204 closed trades" />
        <StatCard label="Open positions" value="14" context="$25,000 notional" />
        <StatCard label="Best class" value="US Tech" tone="gold" context="+18.4% this month" />
        <StatCard label="Max drawdown" value="2.1%" context="Guardrail: 8%" />
      </div>
      <div className="mt-6">
        <DataCard title="Today's fills" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={[
              { id: 'x1', time: '14:22', symbol: 'BTC', side: 'BUY', qty: 0.014, pnl: 12.4 },
              { id: 'x2', time: '13:58', symbol: 'NVDA', side: 'SELL', qty: 3.2, pnl: 8.1 },
              { id: 'x3', time: '12:31', symbol: 'ETH', side: 'BUY', qty: 0.22, pnl: -3.2 },
              { id: 'x4', time: '11:05', symbol: 'XAU', side: 'BUY', qty: 1.1, pnl: 5.9 },
              { id: 'x5', time: '09:44', symbol: 'AAPL', side: 'SELL', qty: 6.0, pnl: 4.3 },
            ]} pageSize={5} columns={[
              { key: 'time', header: 'Time', width: '70px' },
              { key: 'symbol', header: 'Asset' },
              { key: 'side', header: 'Side', render: (r) => <span className={r.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--gold)]'}>{r.side}</span> },
              { key: 'qty', header: 'Qty', align: 'right' },
              { key: 'pnl', header: 'P&L', align: 'right', render: (r) => <span className={r.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[#F87171]'}>{r.pnl >= 0 ? '+' : '−'}${money(Math.abs(r.pnl))}</span> },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function PeopleTab({ p }: { p: RolePersona }) {
  return (
    <>
      <PageHeader crumbs={[p.roleSection, p.peopleLabel]} title={p.peopleLabel} description={`Members who joined with your invitation. Their balances are theirs — you see activity, never access.`} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Members" value="23" context="4 new this month" />
        <StatCard label="Principal under care" value={`$${money(96500)}`} />
        <StatCard label="Daily profit (their side)" value={`$${money(186.4)}`} tone="profit" />
        <StatCard label="Your 0.1% (today)" value={`$${money(6.76)}`} tone="gold" />
      </div>
      <div className="mt-6">
        <DataCard title="All members" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={PEOPLE} pageSize={6} columns={[
              { key: 'name', header: 'Member' },
              { key: 'tier', header: 'Plan' },
              { key: 'principal', header: 'Principal', align: 'right', render: (r) => `$${money(r.principal)}` },
              { key: 'profitToday', header: 'Profit today', align: 'right', render: (r) => <span className="text-[var(--profit)]">+${money(r.profitToday)}</span> },
              { key: 'share', header: 'Your share', align: 'right', render: (r) => `$${money(r.share)}` },
              { key: 'joined', header: 'Joined', align: 'right' },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function CommissionsTab() {
  return (
    <>
      <PageHeader crumbs={['Commissions']} title="Commissions" description="5% on each member's first deposit + 0.1% of their profit, for life. Funds unlock after a 7-day hold; payouts are admin-reviewed."
        actions={<Button variant="primary">Request payout</Button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total earned" value={`$${money(2412.6)}`} tone="gold" />
        <StatCard label="Available" value="$408.60" tone="profit" />
        <StatCard label="Pending (hold)" value="$204.00" tone="gold" context="Unlocks Sep 19" />
        <StatCard label="In review" value="$125.00" context="1 request" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Breakdown" className="lg:col-span-1">
          <div className="space-y-2.5">
            <StatInline label="First-deposit bonuses (5%)" value="$1,922.60" tone="gold" />
            <StatInline label="Profit shares (0.1%)" value="$490.00" tone="profit" />
            <div className="my-2 border-t border-[var(--border)]" />
            <StatInline label="Paid out" value="$1,796.00" />
          </div>
        </DataCard>
        <DataCard title="Commission history" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={COMMISSIONS} pageSize={6} columns={[
              { key: 'date', header: 'Date', width: '86px' },
              { key: 'member', header: 'Source' },
              { key: 'type', header: 'Type' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="text-[var(--gold)]">+${money(r.amount)}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (
                r.status === 'hold' ? <Pill tone="gold">Hold</Pill> :
                r.status === 'review' ? <Pill tone="cyan">In review</Pill> :
                r.status === 'paid' ? <Pill tone="muted">Paid</Pill> : <Pill tone="green">Available</Pill>) },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function InviteTab({ p }: { p: RolePersona }) {
  return (
    <>
      <PageHeader crumbs={[p.roleSection, 'Invite']} title="Invite" description={`Your ${p.brandSub.toLowerCase()} link opens registration pre-filled with your name.`}
        actions={<Button variant="primary">Copy link</Button>} />
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title={`Your ${p.brandSub.toLowerCase()} link`} className="lg:col-span-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-[13px] text-[var(--gold)]">
            kingdomtradex.com/register?{p.brandSub.toLowerCase()}={encodeURIComponent(p.name)}
          </div>
          <div className="mt-4 space-y-2 text-[12px] text-[var(--muted)]">
            <p>· Anyone joining with your link joins your {p.peopleLabel.toLowerCase()} on their first deposit.</p>
            <p>· You earn 5% of their first deposit and 0.1% of their daily profit forever.</p>
            <p>· No cost to them. You never see or touch their funds.</p>
          </div>
        </DataCard>
        <DataCard title="QR code">
          <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-[12px] text-[var(--muted)]">QR placeholder</div>
          <p className="mt-2 text-[11px] text-[var(--muted)]">Print for bulletins, slides, or business cards.</p>
        </DataCard>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Funnel">
          <div className="space-y-2.5">
            <StatInline label="Link visits" value="312" />
            <StatInline label="Signups" value="29" />
            <StatInline label="Funded plans" value="23" tone="profit" />
            <StatInline label="Conversion" value="7.4%" />
          </div>
        </DataCard>
        <DataCard title="Welcome materials">
          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant="secondary" size="sm">Printable card</Button>
            <Button variant="secondary" size="sm">WhatsApp intro</Button>
            <Button variant="secondary" size="sm">Sunday slides</Button>
          </div>
          <p className="mt-3 text-[11px] text-[var(--muted)]">Brand-safe copy that explains the plan without promising returns.</p>
        </DataCard>
      </div>
    </>
  );
}

function SettingsTab({ p }: { p: RolePersona }) {
  return (
    <>
      <PageHeader crumbs={['Settings']} title="Settings" description="Profile, security and payout preferences." />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Profile">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
            <div>
              <p className="text-[14px] font-medium text-[var(--fg)]">{p.name}</p>
              <p className="text-[12px] text-[var(--muted)]">{p.brandSub.toLowerCase()} · verified</p>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            <StatInline label={p.orgField} value={p.org} />
            <StatInline label="Commission" value="5% first deposit + 0.1% profit" tone="gold" />
            <StatInline label="Member since" value="Jul 13, 2026" />
          </div>
        </DataCard>
        <DataCard title="Security & payouts">
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Two-factor authentication</p><p className="text-[12px] text-[var(--muted)]">TOTP app recommended</p></div><Toggle on /></div>
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Notify on new member</p><p className="text-[12px] text-[var(--muted)]">Email when someone funds a plan</p></div><Toggle on /></div>
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Default payout network</p><p className="text-[12px] text-[var(--muted)]">USDT · TRC20 · TQ5...9kR</p></div><Toggle on={false} /></div>
          </div>
        </DataCard>
      </div>
    </>
  );
}
