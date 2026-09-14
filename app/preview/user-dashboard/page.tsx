'use client';

import { useState } from 'react';
import { Sidebar, type NavSection } from '@/components/design-system/Sidebar';
import { PageHeader } from '@/components/design-system/PageHeader';
import { StatCard, StatInline } from '@/components/design-system/StatCard';
import { DataCard } from '@/components/design-system/DataCard';
import { DataTable, StatusPill } from '@/components/design-system/DataTable';
import { Label } from '@/components/design-system/Typography';

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

const DEPOSITS = [
  { id: 'd1', date: 'Sep 12, 2026', usd: 5000, paid: 4972.14, tier: 'Ambassador', status: 'completed' },
  { id: 'd2', date: 'Aug 03, 2026', usd: 2000, paid: 1988.6, tier: 'Steward', status: 'completed' },
  { id: 'd3', date: 'Jul 13, 2026', usd: 1000, paid: 994.2, tier: 'Faithful', status: 'completed' },
];

const TRANSACTIONS = [
  { id: 't1', date: 'Sep 14', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't2', date: 'Sep 13', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't3', date: 'Sep 12', type: 'Deposit', amount: 5000, status: 'completed' },
  { id: 't4', date: 'Sep 11', type: 'Profit withdrawal', amount: -200, status: 'completed' },
  { id: 't5', date: 'Sep 10', type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't6', date: 'Sep 09', type: 'Referral credit', amount: 12.5, status: 'hold' },
];

export default function UserDashboardPreview() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1400px] border-x border-[var(--border)]" data-preview="user">
      <Sidebar brand="KingdomTradeX" brandSub="Member" sections={SECTIONS} active={tab} onSelect={setTab} />

      <main className="min-w-0 flex-1 bg-[var(--bg)] p-8">
        <PageHeader
          crumbs={['Member', 'Dashboard']}
          title="Good morning, Amara"
          description="Ambassador plan · active since Jul 13, 2026 · hold ends Apr 13, 2027"
          actions={
            <>
              <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-[14px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--gold)]">
                Withdraw profit
              </button>
              <button className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[14px] font-semibold text-black transition hover:brightness-110">
                Deposit
              </button>
            </>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Principal" value={`$${money(7000)}`} context="Across 3 deposits" />
          <StatCard label="Accumulated profit" value={`$${money(1247.5)}`} tone="profit" context="$1,047.50 available" />
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
                  { key: 'date', header: 'Date', width: '90px' },
                  { key: 'type', header: 'Description' },
                  {
                    key: 'amount',
                    header: 'Amount',
                    align: 'right',
                    render: (r) => (
                      <span className={r.amount >= 0 ? 'text-[var(--profit)]' : 'text-[var(--fg)]'}>
                        {r.amount >= 0 ? '+' : '−'}${money(Math.abs(r.amount))}
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    align: 'right',
                    render: (r) =>
                      r.status === 'hold' ? (
                        <StatusPill tone="gold">7-day hold</StatusPill>
                      ) : (
                        <StatusPill tone="green">Done</StatusPill>
                      ),
                  },
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
                <StatInline label="Referral share" value="0.1% lifetime" />
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[11px] text-[var(--muted)]">
                  <span>Progress to next milestone</span>
                  <span>$7,000 / $15,000</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--card)]">
                  <div className="h-full w-[47%] rounded-full bg-[var(--gold)]" />
                </div>
              </div>
            </DataCard>

            <DataCard title="Referral earnings" subtitle="Invite link shared 41 times">
              <div className="space-y-2.5">
                <StatInline label="Total earned" value={`$${money(312)}`} tone="gold" />
                <StatInline label="First-deposit bonuses" value="$250.00" />
                <StatInline label="Profit share (0.1%)" value="$62.00" />
                <StatInline label="Available" value="$147.00" tone="profit" />
                <StatInline label="Pending (hold)" value="$165.00" tone="gold" />
              </div>
            </DataCard>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DataCard title="Deposit history" padded={false}>
            <div className="px-2 pb-2">
              <DataTable
                rows={DEPOSITS}
                pageSize={5}
                columns={[
                  { key: 'date', header: 'Date' },
                  { key: 'usd', header: 'USD', align: 'right', render: (r) => `$${money(r.usd)}` },
                  { key: 'paid', header: 'Paid (USDT)', align: 'right', render: (r) => money(r.paid) },
                  { key: 'tier', header: 'Tier' },
                  { key: 'status', header: 'Status', align: 'right', render: () => <StatusPill tone="green">Completed</StatusPill> },
                ]}
              />
            </div>
          </DataCard>
          <DataCard title="Withdrawals">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--fg)]">Profit · $200.00</p>
                  <Label className="mt-0.5">Sep 11 · TRC20 · automatic</Label>
                </div>
                <StatusPill tone="green">Paid</StatusPill>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--fg)]">Principal · $1,000.00</p>
                  <Label className="mt-0.5">Requested Sep 13 · early exit, net $500</Label>
                </div>
                <StatusPill tone="gold">In review</StatusPill>
              </div>
              <p className="pt-1 text-[12px] leading-[1.5] text-[var(--muted)]">
                Profit pays out automatically. Principal and referral withdrawals are reviewed within 12–24 hours.
              </p>
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
