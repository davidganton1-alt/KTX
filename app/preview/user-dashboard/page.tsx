'use client';

import { useState } from 'react';
import { Sidebar, type NavSection } from '@/components/design-system/Sidebar';
import { PageHeader } from '@/components/design-system/PageHeader';
import { StatCard, StatInline } from '@/components/design-system/StatCard';
import { DataCard } from '@/components/design-system/DataCard';
import { DataTable, StatusPill } from '@/components/design-system/DataTable';
import { ThemeToggle } from '@/components/ThemeToggle';

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SECTIONS: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4' },
      { id: 'wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'earnings', label: 'Earnings', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { id: 'engine', label: 'AI Engine', icon: 'M9 3v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { id: 'referrals', label: 'Referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
      { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.573 1.066' },
    ],
  },
];

const TRANSACTIONS = [
  { id: 't1', date: 'Sep 14', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't2', date: 'Sep 13', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't3', date: 'Sep 12', type: 'Deposit', amount: 5000, status: 'completed' },
  { id: 't4', date: 'Sep 11', type: 'Profit withdrawal', amount: -200, status: 'completed' },
  { id: 't5', date: 'Sep 10', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't6', date: 'Sep 09', type: 'Referral credit', amount: 12.5, status: 'hold' },
  { id: 't7', date: 'Sep 08', type: 'Profit accrual', amount: 21.2, status: 'completed' },
];

const DEPOSITS = [
  { id: 'd1', date: 'Sep 12, 2026', usd: 5000, paid: 4972.14, tier: 'Ambassador', status: 'completed' },
  { id: 'd2', date: 'Aug 03, 2026', usd: 2000, paid: 1988.6, tier: 'Steward', status: 'completed' },
  { id: 'd3', date: 'Jul 13, 2026', usd: 1000, paid: 994.2, tier: 'Faithful', status: 'completed' },
];

const PROFIT_WEEK = [
  { day: 'Sep 8', amt: 21.2 }, { day: 'Sep 9', amt: 25 }, { day: 'Sep 10', amt: 37.5 },
  { day: 'Sep 11', amt: 37.5 }, { day: 'Sep 12', amt: 37.5 }, { day: 'Sep 13', amt: 37.5 }, { day: 'Sep 14', amt: 37.5 },
];

const TRADES = [
  { id: 'x1', time: '14:22', symbol: 'BTC', side: 'BUY', qty: 0.014, pnl: 12.4 },
  { id: 'x2', time: '13:58', symbol: 'NVDA', side: 'SELL', qty: 3.2, pnl: 8.1 },
  { id: 'x3', time: '12:31', symbol: 'ETH', side: 'BUY', qty: 0.22, pnl: -3.2 },
  { id: 'x4', time: '11:05', symbol: 'XAU', side: 'BUY', qty: 1.1, pnl: 5.9 },
  { id: 'x5', time: '09:44', symbol: 'AAPL', side: 'SELL', qty: 6.0, pnl: 4.3 },
];

const REFERRAL_EARNINGS = [
  { id: 'r1', date: 'Sep 12', member: 'Sofia Reyes', type: 'First-deposit bonus', amount: 155, status: 'hold' },
  { id: 'r2', date: 'Sep 12', member: 'Sofia Reyes', type: 'Profit share', amount: 3.1, status: 'hold' },
  { id: 'r3', date: 'Sep 05', member: 'Peter Okonkwo', type: 'First-deposit bonus', amount: 40, status: 'available' },
  { id: 'r4', date: 'Aug 20', member: 'Grace Adeyemi', type: 'Profit share', amount: 14.9, status: 'available' },
];

function Pill({ tone, children }: { tone: 'green' | 'gold' | 'red' | 'muted'; children: React.ReactNode }) {
  return <StatusPill tone={tone}>{children}</StatusPill>;
}

function Bar({ pct, label, value }: { pct: number; label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-[var(--muted)]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--card)]">
        <div className="h-full rounded-full bg-[var(--gold)] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`relative inline-block h-5 w-9 rounded-full transition-colors ${on ? 'bg-[var(--gold)]' : 'bg-[var(--card)] border border-[var(--border)]'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  );
}

export default function UserDashboardPreview() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="flex min-h-screen" data-preview="user">
      <Sidebar brand="KingdomTradeX" brandSub="Member" sections={SECTIONS} active={tab} onSelect={setTab} footer={<ThemeToggle />} />
      <main className="min-w-0 flex-1 p-8">
        <div key={tab} className="ds-fade-in mx-auto max-w-[1200px]">
          {tab === 'dashboard' && <DashboardTab go={setTab} />}
          {tab === 'wallet' && <WalletTab />}
          {tab === 'earnings' && <EarningsTab />}
          {tab === 'engine' && <EngineTab />}
          {tab === 'referrals' && <ReferralsTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
        <p className="mt-10 text-center text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Design preview · data is illustrative
        </p>
      </main>
    </div>
  );
}

function DashboardTab({ go }: { go: (t: string) => void }) {
  return (
    <>
      <PageHeader
        crumbs={['Member', 'Dashboard']}
        title="Good morning, Amara"
        description="Ambassador plan · active since Jul 13, 2026 · hold ends Apr 13, 2027"
        actions={
          <>
            <button onClick={() => go('wallet')} className="rounded-lg border border-[var(--border)] px-4 py-2 text-[14px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--gold)]">Withdraw profit</button>
            <button onClick={() => go('wallet')} className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[14px] font-semibold text-black transition hover:brightness-110">Deposit</button>
          </>
        }
      />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Principal" value={`$${money(7000)}`} context="Across 3 deposits" onClick={() => go('wallet')} />
        <StatCard label="Accumulated profit" value={`$${money(1247.5)}`} tone="profit" context="$1,047.50 available" onClick={() => go('earnings')} />
        <StatCard label="Today" value={`+$${money(37.5)}`} tone="profit" context="0.75% daily target" />
        <StatCard label="Platform credit" value="$50.00" tone="gold" context="Earns profit · not withdrawable" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Recent transactions" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable
              rows={TRANSACTIONS}
              pageSize={5}
              columns={[
                { key: 'date', header: 'Date', width: '86px' },
                { key: 'type', header: 'Description' },
                { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className={r.amount >= 0 ? 'text-[var(--profit)]' : ''}>{r.amount >= 0 ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
                { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'hold' ? <Pill tone="gold">7-day hold</Pill> : <Pill tone="green">Done</Pill>) },
              ]}
            />
          </div>
        </DataCard>
        <div className="space-y-6">
          <DataCard title="Plan" subtitle="Ambassador · $5,000 – $15,000">
            <div className="space-y-2.5">
              <StatInline label="Daily target" value="0.75%" tone="profit" />
              <StatInline label="Hold period" value="12 months" />
              <StatInline label="Early exit fee" value="50%" />
            </div>
            <div className="mt-4 space-y-3">
              <Bar pct={47} label="To top tier" value="$7,000 / $15,000" />
              <Bar pct={64} label="Hold elapsed" value="8 of 12 months" />
            </div>
          </DataCard>
          <DataCard title="Referral earnings">
            <div className="space-y-2.5">
              <StatInline label="Total earned" value={`$${money(312)}`} tone="gold" />
              <StatInline label="Available" value="$147.00" tone="profit" />
              <StatInline label="Pending (hold)" value="$165.00" tone="gold" />
            </div>
            <button onClick={() => go('referrals')} className="mt-3 text-[12px] font-medium text-[var(--gold)] hover:underline">Manage referrals →</button>
          </DataCard>
        </div>
      </div>
    </>
  );
}

function WalletTab() {
  return (
    <>
      <PageHeader crumbs={['Member', 'Wallet']} title="Wallet" description="USDT (TRC20) deposits and payouts. One address, any network — we warn you before anything irreversible." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Principal" value={`$${money(7000)}`} context="Invested in your plan" />
        <StatCard label="Profit available" value={`$${money(1047.5)}`} tone="profit" context="Withdraws instantly, no approval" />
        <StatCard label="Platform credit" value="$50.00" tone="gold" context="Not withdrawable" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Deposit" subtitle="Generates a personal TRC20 address + QR" interactive>
          <div className="grid grid-cols-4 gap-2">
            {[100, 1000, 5000, 15000].map((a) => (
              <button key={a} className="rounded-lg border border-[var(--border)] px-2 py-2 text-[12px] text-[var(--muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]">${a.toLocaleString('en-US')}</button>
            ))}
          </div>
          <div className="mt-3 flex gap-3">
            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--muted)]">Amount in USD</div>
            <button className="rounded-lg bg-[var(--gold)] px-5 py-3 text-[14px] font-semibold text-black">Get address</button>
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
              <button className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[13px] font-semibold text-black">Withdraw $1,047.50</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[var(--fg)]">Principal</p>
                <p className="text-[12px] text-[var(--muted)]">Admin review 12–24h · 50% fee until Apr 2027</p>
              </div>
              <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-[13px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--gold)]">Request</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[var(--fg)]">Referral earnings</p>
                <p className="text-[12px] text-[var(--muted)]">Admin review · unlocks after 7-day hold</p>
              </div>
              <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-[13px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--gold)]">Request $147.00</button>
            </div>
          </div>
        </DataCard>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Deposit history" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={DEPOSITS} pageSize={5} columns={[
              { key: 'date', header: 'Date' },
              { key: 'usd', header: 'USD', align: 'right', render: (r) => `$${money(r.usd)}` },
              { key: 'paid', header: 'Paid (USDT)', align: 'right', render: (r) => money(r.paid) },
              { key: 'tier', header: 'Tier' },
              { key: 'status', header: 'Status', align: 'right', render: () => <Pill tone="green">Completed</Pill> },
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
      <PageHeader crumbs={['Member', 'Earnings']} title="Earnings" description="Your profit ledger and the daily rhythm behind it." actions={<button className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[14px] font-semibold text-black">Withdraw profit</button>} />
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
            <StatInline label="Principal" value="$7,000" />
            <StatInline label="Platform credit" value="+$50" tone="gold" />
            <StatInline label="Basis" value="$7,050" />
            <StatInline label="Rate (Ambassador)" value="0.75% / day" tone="profit" />
            <StatInline label="Daily target" value="$52.88" tone="profit" />
          </div>
          <p className="mt-3 text-[11px] leading-[1.6] text-[var(--muted)]">Targets, not promises. Actual daily returns vary with the market; the hold never touches your harvest.</p>
        </DataCard>
      </div>
      <div className="mt-6">
        <DataCard title="Withdrawal history" padded={false}>
          <div className="px-2 pb-2">
            <DataTable
              rows={[
                { id: 'w1', date: 'Sep 11, 2026', type: 'Profit', amount: 200, network: 'TRC20', status: 'completed' },
                { id: 'w2', date: 'Aug 02, 2026', type: 'Profit', amount: 150, network: 'TRC20', status: 'completed' },
                { id: 'w3', date: 'Sep 13, 2026', type: 'Principal', amount: 1000, network: 'TRC20', status: 'review' },
              ]}
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'type', header: 'Type' },
                { key: 'amount', header: 'Amount', align: 'right', render: (r) => `$${money(r.amount)}` },
                { key: 'network', header: 'Network', align: 'right' },
                { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'review' ? <Pill tone="gold">In review</Pill> : <Pill tone="green">Paid</Pill>) },
              ]}
            />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function EngineTab() {
  return (
    <>
      <PageHeader crumbs={['Member', 'AI Engine']} title="AI Engine" description="Live execution on your allocated desk. Every fill is published to your ledger." />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Win rate (30d)" value="71%" tone="profit" context="1,204 closed trades" />
        <StatCard label="Open positions" value="14" context="$35,000 notional" />
        <StatCard label="Best class" value="US Tech" tone="gold" context="+18.4% this month" />
        <StatCard label="Max drawdown" value="2.1%" context="Guardrail: 8%" />
      </div>
      <div className="mt-6">
        <DataCard title="Today's fills" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={TRADES} pageSize={5} columns={[
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

function ReferralsTab() {
  return (
    <>
      <PageHeader crumbs={['Member', 'Referrals']} title="Referrals" description="2.5% of each friend's first deposit, plus 0.1% of their profit forever. Funds unlock after a 7-day hold." actions={<button className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[14px] font-semibold text-black">Copy invite link</button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total earned" value={`$${money(312)}`} tone="gold" />
        <StatCard label="Available" value="$147.00" tone="profit" />
        <StatCard label="Pending hold" value="$165.00" tone="gold" context="Unlocks Sep 19" />
        <StatCard label="Invited" value="6 members" context="$10,400 funded" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Invite link" className="lg:col-span-2">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-[13px] text-[var(--gold)]">
            kingdomtradex.com/register?ref=7f3a9c
          </div>
          <div className="mt-4 space-y-3 text-[12px] text-[var(--muted)]">
            <p>· They join under your link → you earn on their first deposit and their daily profit.</p>
            <p>· No cost to them. You never see or touch their funds.</p>
            <p>· Referral payouts are reviewed within 24h after the 7-day hold.</p>
          </div>
        </DataCard>
        <DataCard title="Your referrals" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={[
              { id: 'p1', name: 'Sofia Reyes', funded: 6200, joined: 'Sep 12' },
              { id: 'p2', name: 'Peter Okonkwo', funded: 1600, joined: 'Sep 05' },
              { id: 'p3', name: 'Grace Adeyemi', funded: 1800, joined: 'Aug 20' },
            ]} pageSize={5} columns={[
              { key: 'name', header: 'Member' },
              { key: 'funded', header: 'Funded', align: 'right', render: (r) => `$${money(r.funded)}` },
              { key: 'joined', header: 'Joined', align: 'right' },
            ]} />
          </div>
        </DataCard>
      </div>
      <div className="mt-6">
        <DataCard title="Earnings detail" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={REFERRAL_EARNINGS} pageSize={5} columns={[
              { key: 'date', header: 'Date', width: '86px' },
              { key: 'member', header: 'Source' },
              { key: 'type', header: 'Type' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="text-[var(--gold)]">+${money(r.amount)}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'hold' ? <Pill tone="gold">Hold</Pill> : <Pill tone="green">Available</Pill>) },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function SettingsTab() {
  return (
    <>
      <PageHeader crumbs={['Member', 'Settings']} title="Settings" description="Profile, security and payout preferences." />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Profile">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
            <div>
              <p className="text-[14px] font-medium text-[var(--fg)]">Amara Okafor</p>
              <p className="text-[12px] text-[var(--muted)]">amara@example.com · verified</p>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            <StatInline label="Member since" value="Jul 13, 2026" />
            <StatInline label="Pastor" value="Sarah Lin" />
            <StatInline label="Referral code" value="7f3a9c" />
          </div>
        </DataCard>
        <DataCard title="Security & preferences">
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Two-factor authentication</p><p className="text-[12px] text-[var(--muted)]">TOTP app recommended</p></div><Toggle on /></div>
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Email me profit milestones</p><p className="text-[12px] text-[var(--muted)]">Weekly digest, no marketing</p></div><Toggle on={false} /></div>
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Default payout network</p><p className="text-[12px] text-[var(--muted)]">USDT · TRC20</p></div><Toggle on={false} /></div>
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Theme</p><p className="text-[12px] text-[var(--muted)]">Use the toggle below the sidebar</p></div><Toggle on={false} /></div>
          </div>
        </DataCard>
      </div>
    </>
  );
}
