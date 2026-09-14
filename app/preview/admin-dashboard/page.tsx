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
    heading: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4' },
      { id: 'treasury', label: 'Treasury', icon: 'M4 7h16M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M4 7l2-3h12l2 3M9 12h6' },
      { id: 'withdrawals', label: 'Withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9', badge: 3 },
      { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
      { id: 'pastors', label: 'Pastors', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', badge: 2 },
    ],
  },
  {
    heading: 'Platform',
    items: [
      { id: 'engine', label: 'AI Engine', icon: 'M9 3v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { id: 'announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.765 1.765 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6' },
      { id: 'chat', label: 'Live Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72A8.02 8.02 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', badge: 2 },
    ],
  },
];

const WALLETS = [
  { id: 'deposit', label: 'Deposit', note: 'pass-through', in: 128400, out: 128400, balance: 0 },
  { id: 'hot', label: 'Hot Wallet', note: 'payouts', in: 38520, out: 20099.5, balance: 18420.5 },
  { id: 'engine', label: 'Engine', note: 'XMR custody · manual', in: 96000, out: 0, balance: 96000 },
  { id: 'payout', label: 'Payout', note: 'profit withdrawals', in: 4210.3, out: 2969.5, balance: 1240.8 },
  { id: 'referral', label: 'Referral', note: '7-day holds', in: 1980.4, out: 1168, balance: 812.4 },
];

const APPROVALS = [
  { id: 'a1', member: 'Peter Okonkwo', type: 'Principal', amount: 1000, net: 500, fee: '50% early', status: 'pending_approval', when: 'Sep 14, 09:12' },
  { id: 'a2', member: 'Grace Adeyemi', type: 'Referral', amount: 204, net: 204, fee: '—', status: 'pending_approval', when: 'Sep 14, 08:03' },
  { id: 'a3', member: 'Daniel Mwangi', type: 'Principal', amount: 2000, net: 2000, fee: 'hold ended', status: 'awaiting_engine_transfer', when: 'Sep 13, 16:40' },
  { id: 'a4', member: 'Esther Kimani', type: 'Referral', amount: 88.5, net: 88.5, fee: '—', status: 'pending_approval', when: 'Sep 13, 11:22' },
];

const USERS = [
  { id: 'u1', name: 'Amara Okafor', email: 'amara@eg.com', tier: 'Ambassador', principal: 7000, status: 'active', joined: 'Jul 2026' },
  { id: 'u2', name: 'Sofia Reyes', email: 'sofia@eg.com', tier: 'Ambassador', principal: 6200, status: 'active', joined: 'Sep 2026' },
  { id: 'u3', name: 'Peter Okonkwo', email: 'peter@eg.com', tier: 'Faithful', principal: 650, status: 'withdrawal review', joined: 'Sep 2026' },
  { id: 'u4', name: 'Joseph Balogun', email: 'joseph@eg.com', tier: 'Steward', principal: 1200, status: 'active', joined: 'Sep 2026' },
];

const PASTOR_APPS = [
  { id: 'pa1', name: 'Rev. Michael Ade', ministry: 'Living Vine Chapel', members: 0, earned: 0, status: 'pending', when: 'Sep 13' },
  { id: 'pa2', name: 'Pastor Ruth Bennett', ministry: 'Cornerstone Assembly', members: 0, earned: 0, status: 'pending', when: 'Sep 12' },
  { id: 'pa3', name: 'Sarah Lin', ministry: "Shepherd's Gate Fellowship", members: 23, earned: 2412.6, status: 'approved', when: 'Mar 2026' },
];

const ANNOUNCEMENTS = [
  { id: 'an1', title: 'Sep 20 market briefing posted', created: 'Sep 14, 08:00', by: 'Admin' },
  { id: 'an2', title: 'Withdrawal windows now instant for profit', created: 'Sep 02, 10:15', by: 'Admin' },
];

function Pill({ tone, children }: { tone: 'green' | 'gold' | 'red' | 'cyan' | 'muted'; children: React.ReactNode }) {
  return <StatusPill tone={tone}>{children}</StatusPill>;
}

export default function AdminDashboardPreview() {
  const [tab, setTab] = useState('dashboard');
  return (
    <div className="flex min-h-screen" data-preview="admin">
      <Sidebar brand="KingdomTradeX" brandSub="Control Room" sections={SECTIONS} active={tab} onSelect={setTab} footer={<ThemeToggle />} />
      <main className="min-w-0 flex-1 p-8">
        <div key={tab} className="ds-fade-in mx-auto max-w-[1240px]">
          {tab === 'dashboard' && <DashboardTab go={setTab} />}
          {tab === 'treasury' && <TreasuryTab />}
          {tab === 'withdrawals' && <WithdrawalsTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'pastors' && <PastorsTab />}
          {tab === 'engine' && <EngineTab />}
          {tab === 'announcements' && <AnnouncementsTab />}
          {tab === 'chat' && <ChatTab />}
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
      <PageHeader crumbs={['Admin', 'Dashboard']} title="Control Room" description="Saturday, Sep 14, 2026 · all systems nominal"
        actions={<button onClick={() => go('treasury')} className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[14px] font-semibold text-black transition hover:brightness-110">Record Engine → Hot</button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total in custody" value={`$${money(116473.7)}`} context="5 platform wallets · USDT" onClick={() => go('treasury')} />
        <StatCard label="Members" value="312" context="6 new this week" onClick={() => go('users')} />
        <StatCard label="AUM (principal)" value={`$${money(486250)}`} context="89 active plans" />
        <StatCard label="Owed today" value={`$${money(1240.8)}`} tone="gold" context="Payout obligations" onClick={() => go('withdrawals')} />
      </div>
      <div className="mt-4 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] px-5 py-3">
        <p className="text-[12px] text-[var(--muted)]">
          <span className="font-medium text-[var(--gold)]">Attention:</span> 1 principal withdrawal awaits the Engine → Hot custody transfer before payout. Hot covers obligations 14×.
        </p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Queue needing you" subtitle="3 approvals · 2 pastor applications" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={APPROVALS} pageSize={4} columns={[
              { key: 'member', header: 'Member' },
              { key: 'type', header: 'Type' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r) => `$${money(r.amount)}` },
              { key: 'net', header: 'Net', align: 'right', render: (r) => `$${money(r.net)}` },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'pending_approval' ? <Pill tone="gold">Review</Pill> : <Pill tone="cyan">Awaiting transfer</Pill>) },
              { key: 'act', header: '', align: 'right', render: (r) => r.status === 'pending_approval' ? (
                <span className="inline-flex gap-1.5"><button className="rounded-md bg-[var(--profit)] px-2.5 py-1 text-[11px] font-semibold text-black">Approve</button><button className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--fg)]">Reject</button></span>
              ) : <button className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--fg)]">Mark paid</button> },
            ]} />
          </div>
        </DataCard>
        <div className="space-y-6">
          <DataCard title="Flow today">
            <div className="space-y-2.5">
              <StatInline label="Deposits" value="+$5,000" tone="profit" />
              <StatInline label="Profit accrual" value="$268.40" />
              <StatInline label="Paid out" value="−$200.00" />
              <div className="my-2 border-t border-[var(--border)]" />
              <StatInline label="Net movement" value="+$4,533.40" tone="profit" />
            </div>
          </DataCard>
          <DataCard title="Live chat">
            <p className="text-[13px] text-[var(--fg)]">2 visitors online</p>
            <p className="mt-1 text-[12px] text-[var(--muted)]">1 unanswered for 4 minutes — queue is on the Live Chat tab.</p>
          </DataCard>
        </div>
      </div>
    </>
  );
}

function TreasuryTab() {
  return (
    <>
      <PageHeader crumbs={['Admin', 'Treasury']} title="Treasury" description="Ledger view of custody. Engine is external (XMR cold wallet) — record transfers here after they happen." />
      <div className="mt-6 grid gap-4 md:grid-cols-5">
        {WALLETS.map((w) => (
          <StatCard key={w.id} label={w.label} value={`$${money(w.balance)}`} context={w.note} tone={w.id === 'engine' ? 'gold' : 'default'} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Wallet ledger" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={WALLETS} pageSize={5} columns={[
              { key: 'label', header: 'Wallet' },
              { key: 'note', header: 'Role', render: (r) => <span className="text-[12px] text-[var(--muted)]">{r.note}</span> },
              { key: 'in', header: 'In', align: 'right', render: (r) => `$${money(r.in)}` },
              { key: 'out', header: 'Out', align: 'right', render: (r) => `$${money(r.out)}` },
              { key: 'balance', header: 'Balance', align: 'right', render: (r) => <span className="font-medium">${money(r.balance)}</span> },
            ]} />
          </div>
        </DataCard>
        <DataCard title="Record transfer" subtitle="Engine → Hot after XMR→USDT conversion" interactive>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--muted)]">Amount (USDT)</div>
          <button className="mt-3 w-full rounded-lg bg-[var(--gold)] px-4 py-2.5 text-[14px] font-semibold text-black">Record transfer</button>
          <p className="mt-3 text-[11px] leading-[1.6] text-[var(--muted)]">Engine: ${money(96000)} · Hot: ${money(18420.5)}. The move updates both ledgers atomically.</p>
        </DataCard>
      </div>
    </>
  );
}

function WithdrawalsTab() {
  return (
    <>
      <PageHeader crumbs={['Admin', 'Withdrawals']} title="Withdrawals" description="Principal and referral payouts need your approval. Profit payouts are automatic and shown here for the record." />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Pending approval" value="3 requests" tone="gold" context="$1,292.50 total" />
        <StatCard label="Awaiting transfer" value="1" tone="gold" context="$2,000 principal" />
        <StatCard label="Paid (30d)" value="$4,870.20" tone="profit" context="41 payouts" />
        <StatCard label="Rejected" value="2" context="12-24h SLA kept" />
      </div>
      <div className="mt-6">
        <DataCard title="Queue" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={APPROVALS} pageSize={5} columns={[
              { key: 'member', header: 'Member' },
              { key: 'type', header: 'Type' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r) => `$${money(r.amount)}` },
              { key: 'net', header: 'Net', align: 'right', render: (r) => `$${money(r.net)}` },
              { key: 'fee', header: 'Fee', align: 'right', render: (r) => <span className="text-[12px] text-[var(--muted)]">{r.fee}</span> },
              { key: 'when', header: 'Requested', align: 'right', render: (r) => <span className="text-[12px] text-[var(--muted)]">{r.when}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'pending_approval' ? <Pill tone="gold">Review</Pill> : <Pill tone="cyan">Transfer</Pill>) },
              { key: 'act', header: '', align: 'right', render: (r) => r.status === 'pending_approval' ? (
                <span className="inline-flex gap-1.5"><button className="rounded-md bg-[var(--profit)] px-2.5 py-1 text-[11px] font-semibold text-black">Approve</button><button className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)]">Reject</button></span>
              ) : <button className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)]">Mark paid</button> },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function UsersTab() {
  return (
    <>
      <PageHeader crumbs={['Admin', 'Users']} title="Users" description="312 members · 89 funded plans"
        actions={<div className="w-56 rounded-lg border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--muted)]">Search…</div>} />
      <div className="mt-6">
        <DataCard padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={USERS} pageSize={4} columns={[
              { key: 'name', header: 'Member' },
              { key: 'email', header: 'Email', render: (r) => <span className="text-[12px] text-[var(--muted)]">{r.email}</span> },
              { key: 'tier', header: 'Plan' },
              { key: 'principal', header: 'Principal', align: 'right', render: (r) => `$${money(r.principal)}` },
              { key: 'joined', header: 'Joined', align: 'right' },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'active' ? <Pill tone="green">Active</Pill> : <Pill tone="gold">Review</Pill>) },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function PastorsTab() {
  return (
    <>
      <PageHeader crumbs={['Admin', 'Pastors']} title="Pastors" description="Applications, roster and performance. Approval mints their login and flock link." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Applications" value="2 pending" tone="gold" />
        <StatCard label="Active pastors" value="6" context="87 members in flocks" />
        <StatCard label="Pastor earnings (30d)" value="$1,268.40" tone="profit" />
      </div>
      <div className="mt-6">
        <DataCard title="Applications & roster" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={PASTOR_APPS} pageSize={5} columns={[
              { key: 'name', header: 'Pastor' },
              { key: 'ministry', header: 'Ministry' },
              { key: 'members', header: 'Flock', align: 'right' },
              { key: 'earned', header: 'Earned', align: 'right', render: (r) => `$${money(r.earned)}` },
              { key: 'when', header: 'Since', align: 'right' },
              { key: 'status', header: 'Status', align: 'right', render: (r) => (r.status === 'pending' ? <Pill tone="gold">Pending</Pill> : <Pill tone="green">Approved</Pill>) },
              { key: 'act', header: '', align: 'right', render: (r) => r.status === 'pending' ? (
                <span className="inline-flex gap-1.5"><button className="rounded-md bg-[var(--profit)] px-2.5 py-1 text-[11px] font-semibold text-black">Approve</button><button className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)]">Reject</button></span>
              ) : <span className="text-[12px] text-[var(--muted)]">—</span> },
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
      <PageHeader crumbs={['Admin', 'AI Engine']} title="AI Engine" description="Aggregate engine health across all member desks." />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Win rate (30d)" value="69.8%" tone="profit" context="41,208 trades" />
        <StatCard label="Open notional" value="$1.24M" />
        <StatCard label="Max drawdown" value="2.6%" context="Guardrail 8%" />
        <StatCard label="Fees accrued" value="$18,420" tone="gold" context="Platform share" />
      </div>
      <div className="mt-6">
        <DataCard title="Desk performance by tier" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={[
              { id: 'g1', tier: 'Ambassador', desks: 21, target: '0.75%', hit: '96%', pnl: 1247.5 },
              { id: 'g2', tier: 'Steward', desks: 34, target: '0.50%', hit: '94%', pnl: 412.8 },
              { id: 'g3', tier: 'Faithful', desks: 34, target: '0.25%', hit: '97%', pnl: 84.1 },
            ]} columns={[
              { key: 'tier', header: 'Tier' },
              { key: 'desks', header: 'Active desks', align: 'right' },
              { key: 'target', header: 'Daily target', align: 'right' },
              { key: 'hit', header: 'Target hit (30d)', align: 'right', render: (r) => <span className="text-[var(--profit)]">{r.hit}</span> },
              { key: 'pnl', header: '30d P&L', align: 'right', render: (r) => `$${money(r.pnl)}` },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function AnnouncementsTab() {
  return (
    <>
      <PageHeader crumbs={['Admin', 'Announcements']} title="Announcements" description="Posted to every member and pastor panel." />
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="New announcement" className="lg:col-span-1" interactive>
          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--muted)]">Title</div>
            <div className="h-24 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--muted)]">Body…</div>
            <button className="w-full rounded-lg bg-[var(--gold)] px-4 py-2.5 text-[14px] font-semibold text-black">Publish</button>
          </div>
        </DataCard>
        <DataCard title="Recent" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={ANNOUNCEMENTS} columns={[
              { key: 'title', header: 'Title' },
              { key: 'by', header: 'By', align: 'right' },
              { key: 'created', header: 'Posted', align: 'right', render: (r) => <span className="text-[12px] text-[var(--muted)]">{r.created}</span> },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function ChatTab() {
  return (
    <>
      <PageHeader crumbs={['Admin', 'Live Chat']} title="Live Chat" description="Visitor conversations in real time." />
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Conversations" subtitle="2 online · 1 waiting" padded={false}>
          <div className="p-3 space-y-1">
            <div className="rounded-lg bg-[var(--gold)]/10 px-3 py-2 text-[13px] text-[var(--fg)]">Mark · homepage <span className="float-right text-[11px] text-[var(--gold)]">waiting 4m</span></div>
            <div className="rounded-lg px-3 py-2 text-[13px] text-[var(--muted)]">Anonymous · plans</div>
            <div className="rounded-lg px-3 py-2 text-[13px] text-[var(--muted)]">Ada · markets</div>
          </div>
        </DataCard>
        <DataCard title="Mark" subtitle="Visited: home, plans" className="lg:col-span-2">
          <div className="space-y-3 text-[13px]">
            <div className="max-w-[75%] rounded-xl rounded-tl-sm bg-[var(--card)] px-4 py-2.5 text-[var(--fg)]">Is there a minimum I can start with?</div>
            <div className="ml-auto max-w-[75%] rounded-xl rounded-tr-sm bg-[var(--gold)] px-4 py-2.5 text-black">Yes — $100 on the Faithful plan. Would you like me to walk you through it?</div>
            <div className="flex items-center gap-3 border-t border-[var(--border)] pt-4">
              <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--muted)]">Type a message…</div>
              <button className="rounded-lg bg-[var(--gold)] px-5 py-3 font-semibold text-black">Send</button>
            </div>
          </div>
        </DataCard>
      </div>
    </>
  );
}
