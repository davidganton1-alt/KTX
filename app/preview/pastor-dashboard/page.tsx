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
  { id: 'f6', name: 'Joseph Balogun', tier: 'Steward', principal: 1200, profitToday: 6.0, share: 0.6, joined: 'Sep 2026' },
];

const EARN_ROWS = [
  { id: 'e1', date: 'Sep 14', member: 'Amara Okafor', type: 'Profit share', amount: 3.75, status: 'hold' },
  { id: 'e2', date: 'Sep 13', member: 'Amara Okafor', type: 'Profit share', amount: 3.75, status: 'hold' },
  { id: 'e3', date: 'Sep 12', member: 'Sofia Reyes', type: 'First deposit 5%', amount: 310, status: 'hold' },
  { id: 'e4', date: 'Aug 02', member: 'Daniel Mwangi', type: 'First deposit 5%', amount: 125, status: 'available' },
  { id: 'e5', date: 'Jul 19', member: 'Amara Okafor', type: 'First deposit 5%', amount: 350, status: 'available' },
];

function Pill({ tone, children }: { tone: 'green' | 'gold' | 'red' | 'cyan' | 'muted'; children: React.ReactNode }) {
  return <StatusPill tone={tone}>{children}</StatusPill>;
}

export default function PastorDashboardPreview() {
  const [tab, setTab] = useState('dashboard');
  return (
    <div className="flex min-h-screen" data-preview="pastor">
      <Sidebar brand="KingdomTradeX" brandSub="Pastor" sections={SECTIONS} active={tab} onSelect={setTab} footer={<ThemeToggle />} />
      <main className="min-w-0 flex-1 p-8">
        <div key={tab} className="ds-fade-in mx-auto max-w-[1200px]">
          {tab === 'dashboard' && <DashboardTab go={setTab} />}
          {tab === 'flock' && <FlockTab />}
          {tab === 'earnings' && <EarningsTab />}
          {tab === 'invite' && <InviteTab />}
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
      <PageHeader crumbs={['Pastor', 'Dashboard']} title="Pastor Sarah Lin" description="Shepherd's Gate Fellowship · 23 members · first-deposit share 5%"
        actions={<button onClick={() => go('invite')} className="rounded-lg border border-[var(--border)] px-4 py-2 text-[14px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--gold)]">Copy invite link</button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Flock size" value="23 members" context="4 joined this month" onClick={() => go('flock')} />
        <StatCard label="Principal under care" value={`$${money(96500)}`} context="23 active plans" />
        <StatCard label="Lifetime earnings" value={`$${money(2412.6)}`} tone="gold" onClick={() => go('earnings')} />
        <StatCard label="Available" value={`$${money(408.6)}`} tone="profit" context="$204.00 pending hold" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="New this week" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={FLOCK.slice(3)} pageSize={4} columns={[
              { key: 'name', header: 'Member' },
              { key: 'tier', header: 'Plan' },
              { key: 'principal', header: 'Principal', align: 'right', render: (r) => `$${money(r.principal)}` },
              { key: 'joined', header: 'Joined', align: 'right' },
            ]} />
          </div>
        </DataCard>
        <div className="space-y-6">
          <DataCard title="This month">
            <div className="space-y-2.5">
              <StatInline label="Profit share earned" value="$214.30" tone="profit" />
              <StatInline label="Deposit bonuses" value="$620.00" tone="gold" />
              <StatInline label="Paid out" value="−$204.00" />
              <StatInline label="Available" value="$408.60" tone="profit" />
            </div>
          </DataCard>
          <DataCard title="Ministry note">
            <p className="text-[12px] leading-[1.6] text-[var(--muted)]">
              Your earnings come from platform profit, never from your flock's principal. Every member chooses their own plan freely.
            </p>
          </DataCard>
        </div>
      </div>
    </>
  );
}

function FlockTab() {
  return (
    <>
      <PageHeader crumbs={['Pastor', 'Flock']} title="Flock" description="Members who joined with your invitation. Their balances are theirs — you see activity, not access." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Members" value="23" />
        <StatCard label="Total principal" value={`$${money(96500)}`} />
        <StatCard label="Profit shared to you (30d)" value="$214.30" tone="profit" />
      </div>
      <div className="mt-6">
        <DataCard title="All members" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={FLOCK} pageSize={6} columns={[
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

function EarningsTab() {
  return (
    <>
      <PageHeader crumbs={['Pastor', 'Earnings']} title="Earnings" description="5% first-deposit bonuses and a lifetime 0.1% of your flock's daily profit. Payouts need admin review after the 7-day hold."
        actions={<button className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[14px] font-semibold text-black">Request payout</button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Lifetime" value={`$${money(2412.6)}`} />
        <StatCard label="Available" value="$408.60" tone="profit" />
        <StatCard label="Pending (hold)" value="$204.00" tone="gold" context="Unlocks Sep 19" />
        <StatCard label="Paid out" value="$1,796.00" context="4 payouts" />
      </div>
      <div className="mt-6">
        <DataCard title="Earnings ledger" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={EARN_ROWS} pageSize={6} columns={[
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

function InviteTab() {
  return (
    <>
      <PageHeader crumbs={['Pastor', 'Invite']} title="Invite" description="Your link opens registration pre-filled with your name."
        actions={<button className="rounded-lg bg-[var(--gold)] px-4 py-2 text-[14px] font-semibold text-black">Copy link</button>} />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Your pastor link">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-[13px] text-[var(--gold)]">
            kingdomtradex.com/register?pastor=Sarah+Lin
          </div>
          <p className="mt-3 text-[12px] leading-[1.6] text-[var(--muted)]">
            Anyone joining with your link joins your flock on their first deposit. You're notified when they fund a plan.
          </p>
        </DataCard>
        <DataCard title="Track record">
          <div className="space-y-2.5">
            <StatInline label="Link visits" value="312" />
            <StatInline label="Signups" value="29" />
            <StatInline label="Funded plans" value="23" tone="profit" />
            <StatInline label="Conversion" value="7.4%" />
          </div>
        </DataCard>
      </div>
      <div className="mt-6">
        <DataCard title="Welcome materials">
          <div className="grid gap-3 sm:grid-cols-3">
            {['Printable card', 'WhatsApp intro', 'Sunday slides'].map((t) => (
              <button key={t} className="rounded-lg border border-[var(--border)] px-4 py-3 text-[13px] text-[var(--muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]">{t} ↓</button>
            ))}
          </div>
        </DataCard>
      </div>
    </>
  );
}

function SettingsTab() {
  return (
    <>
      <PageHeader crumbs={['Pastor', 'Settings']} title="Settings" description="Your ministry profile as members see it." />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Ministry profile">
          <div className="space-y-2.5">
            <StatInline label="Display name" value="Sarah Lin" />
            <StatInline label="Ministry" value="Shepherd's Gate Fellowship" />
            <StatInline label="First deposit share" value="5%" tone="gold" />
            <StatInline label="Profit share" value="0.1% lifetime" tone="profit" />
          </div>
        </DataCard>
        <DataCard title="Payout preferences">
          <div className="space-y-3 text-[14px]">
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <span className="text-[var(--fg)]">Default network</span>
              <span className="text-[12px] text-[var(--muted)]">USDT · TRC20</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <span className="text-[var(--fg)]">Notify on new member</span>
              <span className="text-[12px] text-[var(--profit)]">On</span>
            </div>
          </div>
        </DataCard>
      </div>
    </>
  );
}
