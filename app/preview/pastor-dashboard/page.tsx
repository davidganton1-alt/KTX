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
      { id: 'flock', label: 'Flock', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
      { id: 'earnings', label: 'Earnings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1.042' },
      { id: 'invite', label: 'Invite', icon: 'M8.684 13.342a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 5.316a3 3 0 105.316 1.5m-5.316-6.816a3 3 0 105.316-1.5' },
      { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066' },
    ],
  },
];

const FLOCK = [
  { id: 'f1', name: 'Amara Okafor', tier: 'Ambassador', principal: 7000, profitToday: 37.5, share: 3.75, joined: 'Jul 2026' },
  { id: 'f2', name: 'Daniel Mwangi', tier: 'Steward', principal: 2500, profitToday: 12.5, share: 1.25, joined: 'Aug 2026' },
  { id: 'f3', name: 'Grace Adeyemi', tier: 'Steward', principal: 1800, profitToday: 9.0, share: 0.9, joined: 'Aug 2026' },
  { id: 'f4', name: 'Peter Okonkwo', tier: 'Faithful', principal: 650, profitToday: 1.63, share: 0.16, joined: 'Sep 2026' },
  { id: 'f5', name: 'Esther Kimani', tier: 'Faithful', principal: 400, profitToday: 1.0, share: 0.1, joined: 'Sep 2026' },
];

export default function PastorDashboardPreview() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1400px] border-x border-[var(--border)]" data-preview="pastor">
      <Sidebar brand="KingdomTradeX" brandSub="Pastor" sections={SECTIONS} active={tab} onSelect={setTab} />

      <main className="min-w-0 flex-1 bg-[var(--bg)] p-8">
        <PageHeader
          crumbs={['Pastor', 'Dashboard']}
          title="Pastor Sarah Lin"
          description="Shepherd's Gate Fellowship · pastor since Mar 2026 · share 5% on first deposits"
          actions={
            <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-[14px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--gold)]">
              Copy invite link
            </button>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Flock size" value="23 members" context="4 joined this month" />
          <StatCard label="Principal under care" value={`$${money(96500)}`} context="23 active plans" />
          <StatCard label="Lifetime earnings" value={`$${money(2412.6)}`} tone="gold" context="First-deposit + profit share" />
          <StatCard label="Available to withdraw" value={`$${money(408.6)}`} tone="profit" context="$204.00 pending (7-day hold)" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <DataCard title="Your flock" subtitle="Daily profit and your 0.1% lifetime share" className="lg:col-span-2" padded={false}>
            <div className="px-2 pb-2">
              <DataTable
                rows={FLOCK}
                pageSize={5}
                columns={[
                  { key: 'name', header: 'Member' },
                  { key: 'tier', header: 'Plan' },
                  { key: 'principal', header: 'Principal', align: 'right', render: (r) => `$${money(r.principal)}` },
                  { key: 'profitToday', header: 'Profit today', align: 'right', render: (r) => <span className="text-[var(--profit)]">+${money(r.profitToday)}</span> },
                  { key: 'share', header: 'Your share', align: 'right', render: (r) => `$${money(r.share)}` },
                  { key: 'joined', header: 'Joined', align: 'right' },
                ]}
              />
            </div>
          </DataCard>

          <div className="space-y-6">
            <DataCard title="Earnings breakdown">
              <div className="space-y-2.5">
                <StatInline label="First-deposit bonuses (5%)" value="$1,804.00" tone="gold" />
                <StatInline label="Profit share (0.1% lifetime)" value="$608.60" />
                <StatInline label="Paid out" value="−$2,004.00" />
                <div className="my-2 border-t border-[var(--border)]" />
                <StatInline label="Available" value="$408.60" tone="profit" />
                <StatInline label="Pending (hold)" value="$204.00" tone="gold" />
              </div>
            </DataCard>

            <DataCard title="Payout requests">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--fg)]">$400.00 · TRC20</p>
                    <Label className="mt-0.5">Requested Sep 12</Label>
                  </div>
                  <StatusPill tone="green">Paid</StatusPill>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--fg)]">$204.00 · TRC20</p>
                    <Label className="mt-0.5">Requested Sep 14</Label>
                  </div>
                  <StatusPill tone="gold">In review</StatusPill>
                </div>
              </div>
            </DataCard>

            <DataCard title="Ministry note">
              <p className="text-[12px] leading-[1.6] text-[var(--muted)]">
                Your earnings come from the platform's profit, never from your flock's principal. Share the invitation
                with shepherds' discretion — every member chooses their own plan.
              </p>
            </DataCard>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">
          Design preview · data is illustrative
        </p>
      </main>
    </div>
  );
}
