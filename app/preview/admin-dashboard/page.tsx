'use client';

import { useState } from 'react';
import { Sidebar, type NavSection } from '@/components/design-system/Sidebar';
import { PageHeader } from '@/components/design-system/PageHeader';
import { StatCard, StatInline } from '@/components/design-system/StatCard';
import { DataCard } from '@/components/design-system/DataCard';
import { DataTable, StatusPill } from '@/components/design-system/DataTable';

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SECTIONS: NavSection[] = [
  {
    heading: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4' },
      { id: 'treasury', label: 'Treasury', icon: 'M4 7h16M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M4 7l2-3h12l2 3M9 12h6' },
      { id: 'withdrawals', label: 'Withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9', badge: 4 },
      { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
      { id: 'pastors', label: 'Pastors', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', badge: 2 },
    ],
  },
  {
    heading: 'Platform',
    items: [
      { id: 'engine', label: 'AI Engine', icon: 'M9 3v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { id: 'announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.765 1.765 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6' },
      { id: 'chat', label: 'Live Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72A8.02 8.02 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    ],
  },
];

const WALLETS = [
  { id: 'deposit', label: 'Deposit', balance: 0, in: 128400, out: 128400, note: 'pass-through' },
  { id: 'hot', label: 'Hot Wallet', balance: 18420.5, in: 38520, out: 20099.5, note: 'payouts' },
  { id: 'engine', label: 'Engine', balance: 96000, in: 96000, out: 0, note: 'XMR custody · manual' },
  { id: 'payout', label: 'Payout', balance: 1240.8, in: 4210.3, out: 2969.5, note: 'profit withdrawals' },
  { id: 'referral', label: 'Referral', balance: 812.4, in: 1980.4, out: 1168, note: '7-day holds' },
];

const APPROVALS = [
  { id: 'a1', member: 'Peter Okonkwo', type: 'Principal', amount: 1000, net: 500, fee: '50% early', status: 'pending_approval', when: 'Sep 14, 09:12' },
  { id: 'a2', member: 'Grace Adeyemi', type: 'Referral', amount: 204, net: 204, fee: '—', status: 'pending_approval', when: 'Sep 14, 08:03' },
  { id: 'a3', member: 'Daniel Mwangi', type: 'Principal', amount: 2000, net: 2000, fee: 'hold ended', status: 'awaiting_engine_transfer', when: 'Sep 13, 16:40' },
  { id: 'a4', member: 'Esther Kimani', type: 'Referral', amount: 88.5, net: 88.5, fee: '—', status: 'pending_approval', when: 'Sep 13, 11:22' },
];

const TOP_MEMBERS = [
  { id: 'm1', name: 'Amara Okafor', tier: 'Ambassador', principal: 7000, profit: 1247.5, status: 'active' },
  { id: 'm2', name: 'Sofia Reyes', tier: 'Ambassador', principal: 6200, profit: 1034.2, status: 'active' },
  { id: 'm3', name: 'Daniel Mwangi', tier: 'Steward', principal: 2500, profit: 412.8, status: 'active' },
  { id: 'm4', name: 'Grace Adeyemi', tier: 'Steward', principal: 1800, profit: 298.4, status: 'active' },
  { id: 'm5', name: 'Peter Okonkwo', tier: 'Faithful', principal: 650, profit: 84.1, status: 'withdrawal review' },
];

export default function AdminDashboardPreview() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1400px] border-x border-[var(--border)]" data-preview="admin">
      <Sidebar brand="KingdomTradeX" brandSub="Control Room" sections={SECTIONS} active={tab} onSelect={setTab} />

      <main className="min-w-0 flex-1 bg-[var(--bg)] p-8">
        <PageHeader
          crumbs={['Admin', 'Dashboard']}
          title="Control Room"
          description="Saturday, Sep 14, 2026 · all systems nominal"
          actions={
            <button className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[14px] font-semibold text-black transition hover:brightness-110">
              Record Engine → Hot
            </button>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Total in custody" value={`$${money(116473.7)}`} context="5 platform wallets · USDT" />
          <StatCard label="Members" value="312" context="6 new this week" />
          <StatCard label="AUM (principal)" value={`$${money(486250)}`} context="Across 89 active plans" />
          <StatCard label="Owed today" value={`$${money(1240.8)}`} tone="gold" context="Payout + referral obligations" />
        </div>

        <div className="mt-4 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] px-5 py-3">
          <p className="text-[12px] text-[var(--muted)]">
            <span className="font-medium text-[var(--gold)]">Attention:</span> Hot wallet covers today's obligations 14×.
            1 principal withdrawal awaits the Engine → Hot custody transfer before payout.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <DataCard title="Treasury" subtitle="Ledger balances (USDT) — engine is custody-tracked only" padded={false} className="lg:col-span-2">
            <div className="px-2 pb-2">
              <DataTable
                rows={WALLETS}
                pageSize={5}
                columns={[
                  { key: 'label', header: 'Wallet' },
                  { key: 'note', header: 'Role', render: (r) => <span className="text-[12px] text-[var(--muted)]">{r.note}</span> },
                  { key: 'in', header: 'In', align: 'right', render: (r) => `$${money(r.in)}` },
                  { key: 'out', header: 'Out', align: 'right', render: (r) => `$${money(r.out)}` },
                  { key: 'balance', header: 'Balance', align: 'right', render: (r) => <span className="font-medium text-[var(--fg)]">${money(r.balance)}</span> },
                ]}
              />
            </div>
          </DataCard>

          <DataCard title="Flow today">
            <div className="space-y-2.5">
              <StatInline label="Deposits" value="+$5,000" tone="profit" />
              <StatInline label="Profit accrual" value="$268.40" />
              <StatInline label="Profit paid out" value="−$200.00" />
              <StatInline label="Referral reserved (hold)" value="$165.00" tone="gold" />
              <div className="my-2 border-t border-[var(--border)]" />
              <StatInline label="Net treasury movement" value="+$4,533.40" tone="profit" />
            </div>
          </DataCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <DataCard title="Pending approvals" subtitle="Principal & referral · profit is automatic" className="lg:col-span-2" padded={false}>
            <div className="px-2 pb-2">
              <DataTable
                rows={APPROVALS}
                pageSize={5}
                columns={[
                  { key: 'member', header: 'Member' },
                  { key: 'type', header: 'Type' },
                  { key: 'amount', header: 'Amount', align: 'right', render: (r) => `$${money(r.amount)}` },
                  { key: 'net', header: 'Net', align: 'right', render: (r) => `$${money(r.net)}` },
                  { key: 'fee', header: 'Fee', align: 'right', render: (r) => <span className="text-[12px] text-[var(--muted)]">{r.fee}</span> },
                  {
                    key: 'status',
                    header: 'Status',
                    align: 'right',
                    render: (r) =>
                      r.status === 'pending_approval' ? (
                        <StatusPill tone="gold">Review</StatusPill>
                      ) : (
                        <StatusPill tone="cyan">Awaiting transfer</StatusPill>
                      ),
                  },
                  {
                    key: 'act',
                    header: '',
                    align: 'right',
                    render: (r) =>
                      r.status === 'pending_approval' ? (
                        <span className="inline-flex gap-1.5">
                          <button className="rounded-md bg-[var(--profit)] px-2.5 py-1 text-[11px] font-semibold text-black">Approve</button>
                          <button className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--fg)]">Reject</button>
                        </span>
                      ) : (
                        <button className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--fg)]">Mark paid</button>
                      ),
                  },
                ]}
              />
            </div>
          </DataCard>

          <DataCard title="Top members by principal" padded={false}>
            <div className="px-2 pb-2">
              <DataTable
                rows={TOP_MEMBERS}
                pageSize={5}
                columns={[
                  { key: 'name', header: 'Member' },
                  { key: 'principal', header: 'Principal', align: 'right', render: (r) => `$${money(r.principal)}` },
                  { key: 'profit', header: 'Profit', align: 'right', render: (r) => <span className="text-[var(--profit)]">${money(r.profit)}</span> },
                ]}
              />
            </div>
          </DataCard>
        </div>

        <p className="mt-8 text-center text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">
          Design preview · data is illustrative
        </p>
      </main>
    </div>
  );
}
