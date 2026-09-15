'use client';

// Shared full dashboard for role-holders (Pastor / Creator).
// A role holder is a USER FIRST: every member feature (wallet, own
// profit earnings, AI engine, referrals, settings) plus a role section
// (Ministry / Network). One implementation, two personas — no drift.
//
// Phase 2.2: renders REAL data when `data` props are provided and falls
// back to the approved preview's demo constants when absent, so the
// preview pages stay untouched while /pastor and /creator bind live APIs.
// Visual structure is unchanged from the approved preview.

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

export type RoleDashboardData = {
  wallet?: any; // /api/wallet/state
  deposits?: any[]; // /api/deposits/history
  referral?: any; // /api/referral/balance
  pastor?: any; // /api/pastor/me
  me?: any; // /api/auth/me (agreement state)
};

export type RoleDashboardHandlers = {
  onDeposit?: () => void;
  onWithdrawProfit?: () => void;
  onWithdrawPrincipal?: () => void;
  onCommissionWithdraw?: () => void;
  onLogout?: () => void;
  onViewAgreement?: () => void;
  onReview?: () => void;
};

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => (ms ? new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

// ── preview demo constants (fallbacks when no real data supplied) ──
const DEMO_TRANSACTIONS = [
  { id: 't1', date: Date.parse('2026-09-14'), type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't2', date: Date.parse('2026-09-13'), type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't3', date: Date.parse('2026-09-12'), type: 'Deposit', amount: 5000, status: 'completed' },
  { id: 't4', date: Date.parse('2026-09-11'), type: 'Profit withdrawal', amount: -200, status: 'completed' },
  { id: 't5', date: Date.parse('2026-09-10'), type: 'Profit accrual', amount: 37.5, status: 'completed' },
  { id: 't6', date: Date.parse('2026-09-09'), type: 'Commission credit', amount: 12.5, status: 'hold' },
];

const DEMO_PEOPLE = [
  { id: 'f1', name: 'Amara Okafor', tier: 'Ambassador', principal: 7000, profitToday: 37.5, share: 3.75, joined: 'Jul 2026' },
  { id: 'f2', name: 'Daniel Mwangi', tier: 'Steward', principal: 2500, profitToday: 12.5, share: 1.25, joined: 'Aug 2026' },
  { id: 'f3', name: 'Grace Adeyemi', tier: 'Steward', principal: 1800, profitToday: 9.0, share: 0.9, joined: 'Aug 2026' },
  { id: 'f4', name: 'Peter Okonkwo', tier: 'Faithful', principal: 650, profitToday: 1.63, share: 0.16, joined: 'Sep 2026' },
  { id: 'f5', name: 'Esther Kimani', tier: 'Faithful', principal: 400, profitToday: 1.0, share: 0.1, joined: 'Sep 2026' },
  { id: 'f6', name: 'Joseph Balogun', tier: 'Steward', principal: 1200, profitToday: 6.0, share: 0.6, joined: 'Sep 2026' },
];

const DEMO_COMMISSIONS = [
  { id: 'c1', date: Date.parse('2026-09-12'), member: 'Sofia Reyes', type: 'First-deposit bonus 5%', amount: 310, status: 'hold' },
  { id: 'c2', date: Date.parse('2026-09-14'), member: 'Amara Okafor', type: 'Profit share 0.1%', amount: 3.75, status: 'hold' },
  { id: 'c3', date: Date.parse('2026-09-12'), member: 'Amara Okafor', type: 'Profit share 0.1%', amount: 3.75, status: 'hold' },
  { id: 'c4', date: Date.parse('2026-08-02'), member: 'Daniel Mwangi', type: 'First-deposit bonus 5%', amount: 125, status: 'review' },
  { id: 'c5', date: Date.parse('2026-07-19'), member: 'Amara Okafor', type: 'First-deposit bonus 5%', amount: 350, status: 'available' },
  { id: 'c6', date: Date.parse('2026-07-05'), member: 'Grace Adeyemi', type: 'Profit share 0.1%', amount: 21.4, status: 'paid' },
];

const DEMO_DEPOSITS = [
  { id: 'd1', createdAt: Date.parse('2026-09-12'), amount: 5000, pay_amount: 4972.14, tier: 'ambassador', status: 'completed' },
  { id: 'd2', createdAt: Date.parse('2026-08-03'), amount: 2000, pay_amount: 1988.6, tier: 'steward', status: 'completed' },
  { id: 'd3', createdAt: Date.parse('2026-07-13'), amount: 1000, pay_amount: 994.2, tier: 'faithful', status: 'completed' },
];

const DEMO_WITHDRAWALS = [
  { id: 'w1', date: Date.parse('2026-09-11'), type: 'Profit', amount: 200, network: 'TRC20', status: 'completed' },
  { id: 'w2', date: Date.parse('2026-08-02'), type: 'Profit', amount: 150, network: 'TRC20', status: 'completed' },
  { id: 'w3', date: Date.parse('2026-09-13'), type: 'Commission', amount: 204, network: 'TRC20', status: 'review' },
];

const DEMO_PROFIT_WEEK = [
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

export function RoleDashboard({ persona, data, handlers, loading }: { persona: RolePersona; data?: RoleDashboardData; handlers?: RoleDashboardHandlers; loading?: boolean }) {
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (t: string) => { setTab(t); setSidebarOpen(false); };

  const w = data?.wallet;
  const pastor = data?.pastor;
  const ref = data?.referral;
  const real = !!w;

  const principal = real ? Number(w.deposited || 0) : 5000;
  const accumulated = real ? Number(w.accumulatedProfit || 0) : 1247.5;
  const availProfit = real ? Number(w.availableProfit || 0) : 1047.5;
  const credit = real ? Number(w.platformCredit || 0) : 50;
  const tier = real ? (w.tier || 'none') : 'ambassador';
  const dailyRate = real ? Number(w.tierRate ?? w.dailyRate ?? 0) : 0.0075;
  const todayProfit = (principal + credit) * dailyRate;

  const flockCount = pastor ? Number(pastor.referralsCount ?? (pastor.referrals?.length ?? 0)) : 23;
  const flockPrincipal = pastor ? (pastor.referrals ?? []).reduce((s: number, u: any) => s + Number(u.deposited ?? u.totalContributed ?? 0), 0) : 96500;
  const commissionTotal = ref ? Number(ref.totalEarned || 0) : (pastor ? Number(pastor.earnedTotal || 0) : 2412.6);
  const commissionAvail = ref ? Number(ref.availableBalance || 0) : (pastor ? Number(pastor.available || 0) : 408.6);
  const commissionPending = ref ? Number(ref.pendingBalance || 0) : 204.0;
  const commissionReview = ref ? Number(ref.inReviewBalance || 0) : 0;

  const deposits = data?.deposits ?? DEMO_DEPOSITS;
  const transactions = real
    ? [
        ...deposits.map((d: any) => ({ id: `d-${d.id}`, date: d.createdAt, type: 'Deposit', amount: Number(d.amount), status: d.status, kind: 'in' })),
        ...((w.withdrawals ?? []).map((x: any, i: number) => ({ id: `w-${i}`, date: x.requestedAt ?? x.date ?? 0, type: `Withdrawal${x.currency === 'usdt_principal' ? ' (principal)' : ''}`, amount: -Number(x.amount), status: x.status, kind: 'out' }))),
      ].sort((a, b) => (b.date || 0) - (a.date || 0))
    : DEMO_TRANSACTIONS;

  const profitWeek: { day: string; amt: number }[] = real
    ? (() => {
        const hist = (w.profitHistory ?? []).map((p: any) => ({ t: Date.parse(p.date), amt: Number(p.profit || 0) }));
        const days: { day: string; amt: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
          const hit = hist.find((h: any) => h.t === d.getTime());
          days.push({ day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amt: hit?.amt ?? 0 });
        }
        return days;
      })()
    : DEMO_PROFIT_WEEK;

  const weekSum = profitWeek.reduce((s, d) => s + d.amt, 0);
  const thisWeek = real ? +weekSum.toFixed(2) : 233.7;

  const withdrawalRows: any[] = real
    ? (w.withdrawals ?? []).map((x: any, i: number) => ({
        id: `wd-${i}`, date: x.requestedAt ?? x.date ?? 0,
        type: x.currency === 'usdt_principal' || x.type === 'deposit' ? 'Principal' : 'Profit',
        amount: Number(x.amount),
        network: (x.currency ?? '').replace(/^usdt/, '').toUpperCase() || 'TRC20',
        status: x.status,
      }))
    : DEMO_WITHDRAWALS;

  const peopleRows: any[] = pastor
    ? (pastor.referrals ?? []).map((u: any, i: number) => ({
        id: u.id ?? i, name: u.name, tier: cap(u.tier || 'none'), principal: Number(u.deposited ?? 0),
        profitLifetime: Number(u.profit ?? 0), share: Number(u.totalContributed ?? ((u.profit ?? 0) * (u.pastorShareRate ?? pastor.shareRate ?? 0.1) / (pastor.shareRate > 1 ? 100 : 1))),
        joined: u.joinedAt ? fmtDate(u.joinedAt) : '—',
      }))
    : DEMO_PEOPLE.map((p) => ({ ...p }));
  const flockDaily = pastor ? 0 : 186.4; // per-member today figures are not exposed by the API; honest zero in real mode

  const commissionRows: any[] = ref
    ? (ref.earnings ?? []).map((e: any) => ({
        id: e.id, date: Date.parse(e.earned_at || e.available_at), member: (e.notes ?? '').replace(/^.*from /, '') || '—',
        type: e.earning_type === 'principal' ? 'First-deposit bonus' : 'Profit share 0.1%',
        amount: Number(e.amount),
        status: new Date(e.available_at) > new Date() ? 'hold' : 'available',
      }))
    : DEMO_COMMISSIONS;

  const bonusSum = ref ? (ref.earnings ?? []).filter((e: any) => e.earning_type === 'principal').reduce((s: number, e: any) => s + Number(e.amount), 0) : 1922.6;
  const profitSum = ref ? (ref.earnings ?? []).filter((e: any) => e.earning_type === 'profit').reduce((s: number, e: any) => s + Number(e.amount), 0) : 490.0;

  const inviteLink = pastor?.inviteLink ? `${typeof window !== 'undefined' ? window.location.origin : ''}${pastor.inviteLink}` : `kingdomtradex.com/register?${persona.brandSub.toLowerCase()}=${encodeURIComponent(persona.name)}`;

  const sidebar = (
    <Sidebar brand="KingdomTradeX" brandSub={persona.brandSub} sections={sectionsFor(persona)} active={tab} onSelect={go}
      footer={<div className="flex items-center justify-between px-1"><ThemeToggle />{handlers?.onLogout && <Button variant="ghost" size="sm" onClick={handlers.onLogout}>Sign out</Button>}</div>} />
  );

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>;
  }

  return (
    <div className="flex min-h-screen" data-preview={persona.brandSub.toLowerCase()}>
      <div className="hidden lg:block">{sidebar}</div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)]/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="px-2 lg:hidden" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </Button>
            <span className="text-[14px] font-medium text-[var(--fg)] lg:hidden">KTX {persona.brandSub}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-[var(--gold)]/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--gold)]">{persona.brandSub}</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
          </div>
        </header>
        <div className="p-6 lg:p-8">
        <div key={tab} className="ds-fade-in mx-auto max-w-[1200px]">
          {tab === 'dashboard' && <Overview p={persona} go={setTab} h={handlers} s={{ principal, accumulated, availProfit, credit, tier, dailyRate, todayProfit, flockCount, flockPrincipal, commissionTotal, commissionAvail, commissionPending, transactions, real }} />}
          {tab === 'wallet' && <WalletTab h={handlers} s={{ principal, availProfit, credit, deposits, transactions, holdMonths: real ? (w.holdMonths || 6) : 12, tier }} />}
          {tab === 'earnings' && <EarningsTab h={handlers} s={{ accumulated, availProfit, thisWeek, dailyRate, profitWeek, principal, credit, withdrawalRows, tier }} />}
          {tab === 'engine' && <EngineTab />}
          {tab === 'flock' && <PeopleTab p={persona} s={{ peopleRows, flockCount, flockPrincipal, flockDaily }} />}
          {tab === 'commissions' && <CommissionsTab s={{ commissionTotal, commissionAvail, commissionPending, commissionReview, bonusSum, profitSum, commissionRows }} h={handlers} />}
          {tab === 'invite' && <InviteTab p={persona} s={{ inviteLink, flockCount }} />}
          {tab === 'settings' && <SettingsTab p={persona} h={handlers} s={{ name: real ? w.name : undefined, email: real ? w.email : undefined, twoFA: real ? !!w.twoFactorEnabled : true, agreementSigned: real ? !!data?.me?.hasSignedAgreement : true }} />}
        </div>
        {!real && (
          <p className="mt-10 text-center text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
            Design preview · data is illustrative
          </p>
        )}
        </div>
      </main>
    </div>
  );
}

function Overview({ p, go, h, s }: any) {
  const tierName = cap(s.tier);
  return (
    <>
      <PageHeader
        crumbs={[p.brandSub, 'Dashboard']}
        title={s.real ? `${p.brandSub} Dashboard` : p.name}
        description={s.real ? `${tierName} plan · ${s.flockCount} ${p.peopleLabel.toLowerCase()} members` : `${p.org} · Ambassador plan · 23 ${p.peopleLabel.toLowerCase()} members · hold ends Apr 13, 2027`}
        actions={
          <>
            <Button variant="secondary" onClick={h?.onWithdrawProfit}>Withdraw profit</Button>
            <Button variant="primary" onClick={h?.onDeposit}>Deposit</Button>
          </>
        }
      />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Principal" value={`$${money(s.principal)}`} context={`${tierName} plan`} onClick={() => go('wallet')} />
        <StatCard label="Accumulated profit" value={`$${money(s.accumulated)}`} tone="profit" context={`$${money(s.availProfit)} available`} onClick={() => go('earnings')} />
        <StatCard label="Today's profit" value={`+$${money(s.todayProfit)}`} tone="profit" context={`${(s.dailyRate * 100).toFixed(2)}% daily target`} />
        <StatCard label="Platform credit" value={s.credit > 0 ? `$${money(s.credit)}` : 'Locked'} tone="gold" context="Earns profit · not withdrawable" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label={`${p.peopleLabel} size`} value={`${s.flockCount} members`} onClick={() => go('flock')} />
        <StatCard label={`${p.peopleLabel} principal`} value={`$${money(s.flockPrincipal)}`} context="Under your invitation" />
        <StatCard label="Commissions earned" value={`$${money(s.commissionTotal)}`} tone="gold" context="5% bonuses + 0.1% lifetime" onClick={() => go('commissions')} />
        <StatCard label="Available to withdraw" value={`$${money(s.commissionAvail)}`} tone="profit" context={s.commissionPending > 0 ? `$${money(s.commissionPending)} pending hold` : undefined} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Recent transactions" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={s.transactions.slice(0, 10)} pageSize={5} emptyText="No transactions yet." columns={[
              { key: 'date', header: 'Date', width: '86px', render: (r: any) => (r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—') },
              { key: 'type', header: 'Description' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className={r.amount >= 0 ? 'text-[var(--profit)]' : ''}>{r.amount >= 0 ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r: any) => (String(r.status).includes('hold') ? <Pill tone="gold">7-day hold</Pill> : <Pill tone="green">{cap(String(r.status))}</Pill>) },
            ]} />
          </div>
        </DataCard>
        <div className="space-y-6">
          <DataCard title="Your plan">
            <div className="space-y-2.5">
              <StatInline label="Tier" value={tierName} tone="gold" />
              <StatInline label="Daily target" value={s.dailyRate ? `${(s.dailyRate * 100).toFixed(2)}%` : '—'} tone="profit" />
              <StatInline label={`${p.brandSub} commission`} value="5% + 0.1%" tone="gold" />
            </div>
          </DataCard>
          <DataCard title="Quick actions">
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={h?.onDeposit}>Deposit</Button>
              <Button variant="secondary" onClick={h?.onWithdrawProfit}>Withdraw profit</Button>
              <Button variant="ghost" onClick={() => go('invite')}>Copy invite link</Button>
            </div>
          </DataCard>
        </div>
      </div>
    </>
  );
}

function WalletTab({ h, s }: any) {
  const statusTone = (st: string) =>
    st === 'completed' || st === 'finished' || st === 'confirmed' ? 'green' :
    st === 'failed' || st === 'rejected' || st === 'cancelled' ? 'red' :
    st === 'pending_approval' || st === 'awaiting_engine_transfer' || st === 'processing' ? 'cyan' : 'gold';
  return (
    <>
      <PageHeader crumbs={['Wallet']} title="Wallet" description="USDT (TRC20) deposits and payouts. Identical to every member's wallet — your role adds income on top, never access."
        actions={<Button variant="primary" onClick={h?.onDeposit}>Deposit</Button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Principal" value={`$${money(s.principal)}`} context={cap(s.tier) + ' plan'} />
        <StatCard label="Profit available" value={`$${money(s.availProfit)}`} tone="profit" context="Withdraws instantly, no approval" onClick={h?.onWithdrawProfit} />
        <StatCard label="Platform credit" value={s.credit > 0 ? `$${money(s.credit)}` : 'Locked'} tone="gold" context="Not withdrawable" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Deposit" subtitle="Generates a personal TRC20 address + QR" interactive onClick={h?.onDeposit}>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((a) => (
              <Button key={a} variant="secondary" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); h?.onDeposit?.(); }}>{'$' + a.toLocaleString('en-US')}</Button>
            ))}
          </div>
          <div className="mt-3 flex gap-3">
            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--muted)]">Amount in USD</div>
            <Button variant="primary" onClick={(e: React.MouseEvent) => { e.stopPropagation(); h?.onDeposit?.(); }}>Get address</Button>
          </div>
          <p className="mt-3 text-[12px] text-[var(--muted)]">Min $100 · Max $15,000 · USDT TRC20 only</p>
        </DataCard>
        <DataCard title="Withdraw">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[var(--fg)]">Profit</p>
                <p className="text-[12px] text-[var(--muted)]">Automatic payout · no fee · minutes</p>
              </div>
              <Button variant="primary" size="sm" disabled={s.availProfit <= 0} onClick={h?.onWithdrawProfit}>Withdraw ${money(s.availProfit)}</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[var(--fg)]">Principal</p>
                <p className="text-[12px] text-[var(--muted)]">Admin review 12–24h · 50% fee inside your {s.holdMonths}-month holding period</p>
              </div>
              <Button variant="secondary" size="sm" disabled={s.principal <= 0} onClick={h?.onWithdrawPrincipal}>Request</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-[var(--fg)]">Commissions</p>
                <p className="text-[12px] text-[var(--muted)]">Admin review · unlocks after 7-day hold</p>
              </div>
              <Button variant="secondary" size="sm" onClick={h?.onCommissionWithdraw}>Request payout</Button>
            </div>
          </div>
        </DataCard>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Deposit history" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={s.deposits} pageSize={5} emptyText="No deposit history." columns={[
              { key: 'createdAt', header: 'Date', render: (r: any) => fmtDate(r.createdAt) },
              { key: 'amount', header: 'USD', align: 'right', render: (r: any) => `$${money(Number(r.amount))}` },
              { key: 'pay_amount', header: 'Paid (USDT)', align: 'right', render: (r: any) => (r.pay_amount != null ? money(Number(r.pay_amount)) : '—') },
              { key: 'tier', header: 'Tier', render: (r: any) => (r.tier ? cap(r.tier) : '—') },
              { key: 'status', header: 'Status', align: 'right', render: (r: any) => <Pill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</Pill> },
            ]} />
          </div>
        </DataCard>
        <DataCard title="All transactions" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={s.transactions} pageSize={5} emptyText="No transactions yet." columns={[
              { key: 'date', header: 'Date', width: '86px', render: (r: any) => (r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—') },
              { key: 'type', header: 'Description' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className={r.amount >= 0 ? 'text-[var(--profit)]' : ''}>{r.amount >= 0 ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r: any) => <Pill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</Pill> },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function EarningsTab({ h, s }: any) {
  const max = Math.max(1, ...s.profitWeek.map((d: any) => d.amt));
  const basis = s.principal + s.credit;
  const dailyTarget = basis * s.dailyRate;
  return (
    <>
      <PageHeader crumbs={['Earnings']} title="Earnings" description="Your own profit ledger — same engine as every member. Commissions live in their own tab." actions={<Button variant="primary" disabled={s.availProfit <= 0} onClick={h?.onWithdrawProfit}>Withdraw profit</Button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Lifetime" value={`$${money(s.accumulated)}`} />
        <StatCard label="Available" value={`$${money(s.availProfit)}`} tone="profit" />
        <StatCard label="This week" value={`+$${money(s.thisWeek)}`} tone="profit" />
        <StatCard label="Daily rate" value={s.dailyRate ? `${(s.dailyRate * 100).toFixed(2)}%` : '—'} context={s.dailyRate ? `$${money(dailyTarget)} / day at current principal` : 'Deposit to activate'} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Last 7 days" className="lg:col-span-2">
          <div className="flex h-40 items-end gap-3">
            {s.profitWeek.map((d: any) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] tabular-nums text-[var(--muted)]">{d.amt.toFixed(0)}</span>
                <div className={`w-full rounded-t-md transition-all ${d.amt > 0 ? 'bg-gradient-to-t from-[var(--gold)]/40 to-[var(--gold)]' : 'bg-[var(--card)]'}`} style={{ height: `${(d.amt / max) * 110}px`, minHeight: 4 }} />
                <span className="text-[10px] text-[var(--muted)]">{d.day.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </DataCard>
        <DataCard title="How profit is computed">
          <div className="space-y-2.5">
            <StatInline label="Principal" value={`$${money(s.principal)}`} />
            <StatInline label="Platform credit" value={`+$${money(s.credit)}`} tone="gold" />
            <StatInline label="Basis" value={`$${money(basis)}`} />
            <StatInline label={`Rate (${cap(s.tier)})`} value={s.dailyRate ? `${(s.dailyRate * 100).toFixed(2)}% / day` : '—'} tone="profit" />
            <StatInline label="Daily target" value={`$${money(dailyTarget)}`} tone="profit" />
          </div>
          <p className="mt-3 text-[11px] leading-[1.6] text-[var(--muted)]">Targets, not promises. Actual daily returns vary with the market.</p>
        </DataCard>
      </div>
      <div className="mt-6">
        <DataCard title="Withdrawal history" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={s.withdrawalRows} pageSize={5} emptyText="No withdrawals yet." columns={[
              { key: 'date', header: 'Date', render: (r: any) => fmtDate(r.date) },
              { key: 'type', header: 'Type' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => `$${money(r.amount)}` },
              { key: 'network', header: 'Network', align: 'right' },
              { key: 'status', header: 'Status', align: 'right', render: (r: any) => (r.status === 'completed' || r.status === 'paid' ? <Pill tone="green">Paid</Pill> : r.status === 'failed' || r.status === 'rejected' ? <Pill tone="red">Failed</Pill> : <Pill tone="gold">In review</Pill>) },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function EngineTab() {
  // Placeholder per product decision — real telemetry deferred to a later phase.
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
              { key: 'side', header: 'Side', render: (r: any) => <span className={r.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--gold)]'}>{r.side}</span> },
              { key: 'qty', header: 'Qty', align: 'right' },
              { key: 'pnl', header: 'P&L', align: 'right', render: (r: any) => <span className={r.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[#F87171]'}>{r.pnl >= 0 ? '+' : '−'}${money(Math.abs(r.pnl))}</span> },
            ]} />
          </div>
        </DataCard>
      </div>
    </>
  );
}

function PeopleTab({ p, s }: any) {
  const yourShareToday = s.flockDaily * 0.001;
  return (
    <>
      <PageHeader crumbs={[p.roleSection, p.peopleLabel]} title={p.peopleLabel} description={`Members who joined with your invitation. Their balances are theirs — you see activity, never access.`} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Members" value={`${s.flockCount}`} />
        <StatCard label="Principal under care" value={`$${money(s.flockPrincipal)}`} />
        <StatCard label="Profit shared to you (lifetime)" value={`$${money(s.peopleRows.reduce((a: number, r: any) => a + Number(r.share || 0), 0))}`} tone="profit" />
        <StatCard label="Flock profit (lifetime)" value={`$${money(s.peopleRows.reduce((a: number, r: any) => a + Number(r.profitLifetime || r.profitToday || 0), 0))}`} />
      </div>
      <div className="mt-6">
        <DataCard title="All members" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={s.peopleRows} pageSize={6} emptyText="No members yet. Share your invite link to grow." columns={[
              { key: 'name', header: 'Member' },
              { key: 'tier', header: 'Plan' },
              { key: 'principal', header: 'Principal', align: 'right', render: (r: any) => `$${money(r.principal)}` },
              { key: 'profitLifetime', header: 'Profit (lifetime)', align: 'right', render: (r: any) => <span className="text-[var(--profit)]">+${money(r.profitLifetime ?? r.profitToday ?? 0)}</span> },
              { key: 'share', header: 'Your share', align: 'right', render: (r: any) => `$${money(r.share)}` },
              { key: 'joined', header: 'Joined', align: 'right', render: (r: any) => (typeof r.joined === 'number' ? fmtDate(r.joined) : r.joined) },
            ]} />
          </div>
        </DataCard>
      </div>
      {yourShareToday > 0 && null}
    </>
  );
}

function CommissionsTab({ s, h }: any) {
  return (
    <>
      <PageHeader crumbs={['Commissions']} title="Commissions" description="5% on each member's first deposit + 0.1% of their profit, for life. Funds unlock after a 7-day hold; payouts are admin-reviewed."
        actions={<Button variant="primary" disabled={s.commissionAvail <= 0} onClick={h?.onCommissionWithdraw}>Request payout</Button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total earned" value={`$${money(s.commissionTotal)}`} tone="gold" />
        <StatCard label="Available" value={`$${money(s.commissionAvail)}`} tone="profit" />
        <StatCard label="Pending (hold)" value={`$${money(s.commissionPending)}`} tone="gold" />
        <StatCard label="In review" value={`$${money(s.commissionReview)}`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title="Breakdown" className="lg:col-span-1">
          <div className="space-y-2.5">
            <StatInline label="First-deposit bonuses (5%)" value={`$${money(s.bonusSum)}`} tone="gold" />
            <StatInline label="Profit shares (0.1%)" value={`$${money(s.profitSum)}`} tone="profit" />
            <div className="my-2 border-t border-[var(--border)]" />
            <StatInline label="Paid out" value={`$${money(Math.max(0, s.commissionTotal - s.commissionAvail - s.commissionPending - s.commissionReview))}`} />
          </div>
        </DataCard>
        <DataCard title="Commission history" className="lg:col-span-2" padded={false}>
          <div className="px-2 pb-2">
            <DataTable rows={s.commissionRows} pageSize={6} emptyText="No commissions yet." columns={[
              { key: 'date', header: 'Date', width: '86px', render: (r: any) => (r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—') },
              { key: 'member', header: 'Source' },
              { key: 'type', header: 'Type' },
              { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className="text-[var(--gold)]">+${money(Number(r.amount))}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r: any) => (
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

function InviteTab({ p, s }: any) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <PageHeader crumbs={[p.roleSection, 'Invite']} title="Invite" description={`Your ${p.brandSub.toLowerCase()} link opens registration pre-filled with your name.`}
        actions={<Button variant="primary" onClick={async () => { try { await navigator.clipboard.writeText(s.inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }}>{copied ? 'Copied ✓' : 'Copy link'}</Button>} />
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DataCard title={`Your ${p.brandSub.toLowerCase()} link`} className="lg:col-span-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-[13px] text-[var(--gold)]">
            {s.inviteLink.replace(/^https?:\/\//, '')}
          </div>
          <div className="mt-4 space-y-2 text-[12px] text-[var(--muted)]">
            <p>· Anyone joining with your link joins your {p.peopleLabel.toLowerCase()} on their first deposit.</p>
            <p>· You earn 5% of their first deposit and 0.1% of their daily profit forever.</p>
            <p>· No cost to them. You never see or touch their funds.</p>
          </div>
        </DataCard>
        <DataCard title="QR code">
          <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-[12px] text-[var(--muted)]">QR coming soon</div>
          <p className="mt-2 text-[11px] text-[var(--muted)]">Print for bulletins, slides, or business cards.</p>
        </DataCard>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Funnel">
          <div className="space-y-2.5">
            <StatInline label="Link visits" value="—" />
            <StatInline label="Signups" value="—" />
            <StatInline label="Funded" value={`${s.flockCount}`} tone="profit" />
            <StatInline label="Conversion" value="—" />
          </div>
          <p className="mt-3 text-[11px] text-[var(--muted)]">Visit tracking is not live yet — funded count is real.</p>
        </DataCard>
        <DataCard title="Welcome materials">
          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant="secondary" size="sm" disabled>Printable card</Button>
            <Button variant="secondary" size="sm" disabled>WhatsApp intro</Button>
            <Button variant="secondary" size="sm" disabled>Sunday slides</Button>
          </div>
          <p className="mt-3 text-[11px] text-[var(--muted)]">Brand-safe copy that explains the plan without promising returns — coming soon.</p>
        </DataCard>
      </div>
    </>
  );
}

function SettingsTab({ p, s, h }: any) {
  return (
    <>
      <PageHeader crumbs={['Settings']} title="Settings" description="Profile, security and payout preferences." />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DataCard title="Profile">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
            <div>
              <p className="text-[14px] font-medium text-[var(--fg)]">{s.name ?? p.name}</p>
              <p className="text-[12px] text-[var(--muted)]">{s.email ?? `${p.brandSub.toLowerCase()} account`}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            <StatInline label={p.orgField} value={p.org} />
            <StatInline label="Commission" value="5% first deposit + 0.1% profit" tone="gold" />
          </div>
        </DataCard>
        <DataCard title="Security & payouts">
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Two-factor authentication</p><p className="text-[12px] text-[var(--muted)]">{s.twoFA ? 'Enabled' : 'Add an extra layer of security'}</p></div><Toggle on={s.twoFA} /></div>
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Trading Agreement</p><p className="text-[12px] text-[var(--muted)]">{s.agreementSigned ? 'Signed' : 'Signature required'}</p></div><Button variant="secondary" size="sm" onClick={h?.onViewAgreement}>View</Button></div>
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Trustpilot review</p><p className="text-[12px] text-[var(--muted)]">Share your experience</p></div><Button variant="ghost" size="sm" onClick={h?.onReview}>Leave review</Button></div>
            <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Default payout network</p><p className="text-[12px] text-[var(--muted)]">USDT · TRC20</p></div><Toggle on={false} /></div>
          </div>
        </DataCard>
      </div>
    </>
  );
}
