'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, type NavSection } from '@/components/design-system/Sidebar';
import { PageHeader } from '@/components/design-system/PageHeader';
import { StatCard, StatInline } from '@/components/design-system/StatCard';
import { DataCard } from '@/components/design-system/DataCard';
import { DataTable, StatusPill } from '@/components/design-system/DataTable';
import { Button } from '@/components/design-system/Button';

import { ThemeToggle } from '@/components/ThemeToggle';
import { TradingAgreementModal } from '@/components/TradingAgreementModal';
import { ShareGate } from '@/components/ShareGate';
import { ReviewInvitationModal } from '@/components/ReviewInvitationModal';
import { SOCIAL_URLS } from '@/lib/social';
import { SpotlightTour } from '@/components/SpotlightTour';
import { DepositModal } from '@/components/DepositModal';
import { ProfitWithdrawModal } from '@/components/ProfitWithdrawModal';
import { PrincipalWithdrawModal } from '@/components/PrincipalWithdrawModal';
import { ReferralWithdrawModal } from '@/components/ReferralWithdrawModal';

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => (ms ? new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const TOUR_STEPS = [
  { id: 'tour-balance', title: 'Your Portfolio', desc: 'This is your total balance, including your principal and accrued profit. Watch it grow daily.' },
  { id: 'tour-actions', title: 'Quick Actions', desc: 'Deposit funds to activate your plan, or withdraw your profit instantly. No locks, no friction.' },
  { id: 'tour-engine', title: 'Live AI Engine', desc: 'This is your trading desk. The AI executes trades in real-time with strict risk guardrails. You can watch every move.' },
  { id: 'tour-sidebar', title: 'Command Center', desc: 'Access your wallet, referrals, security, and settings from here. Everything you need is one click away.' },
];

const SECTIONS: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4' },
      { id: 'wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'earnings', label: 'Earnings', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { id: 'engine', label: 'AI Engine', icon: 'M9 3v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { id: 'referrals', label: 'Referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
      { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ],
  },
];

const TIER_LABELS: Record<string, string> = { none: 'Unranked', faithful: 'Faithful', steward: 'Steward', ambassador: 'Ambassador' };

// Placeholder per product decision — real telemetry deferred (user's Phase-3 plans).
const ENGINE_STATS = { winRate: '71.4%', openPositions: '14', todayPnl: '+$1,240', drawdown: '-4.2%' };
const ENGINE_FILLS = [
  { id: 'x1', time: '14:22', symbol: 'BTC', side: 'BUY', qty: 0.014, pnl: 12.4 },
  { id: 'x2', time: '13:58', symbol: 'NVDA', side: 'SELL', qty: 3.2, pnl: 8.1 },
  { id: 'x3', time: '12:31', symbol: 'ETH', side: 'BUY', qty: 0.22, pnl: -3.2 },
  { id: 'x4', time: '11:05', symbol: 'XAU', side: 'BUY', qty: 1.1, pnl: 5.9 },
  { id: 'x5', time: '09:44', symbol: 'AAPL', side: 'SELL', qty: 6.0, pnl: 4.3 },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-[var(--gold)]' : 'border border-[var(--border)] bg-[var(--card)]'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  );
}

const statusTone = (st: string) =>
  st === 'completed' || st === 'finished' || st === 'confirmed' || st === 'paid' || st === 'approved' ? 'green' :
  st === 'failed' || st === 'rejected' || st === 'cancelled' ? 'red' :
  st === 'pending_approval' || st === 'awaiting_engine_transfer' || st === 'processing' || st === 'in_review' ? 'cyan' : 'gold';

export default function ConsolePage() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [wallet, setWallet] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [refBalance, setRefBalance] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [actionMsg, setActionMsg] = useState('');

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showProfitWithdraw, setShowProfitWithdraw] = useState(false);
  const [showPrincipalWithdraw, setShowPrincipalWithdraw] = useState(false);
  const [showReferralWithdraw, setShowReferralWithdraw] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTrigger, setReviewTrigger] = useState<'firstWithdrawal' | 'activeUser30Days' | 'thirdWithdrawal'>('firstWithdrawal');
  const [showWithdrawShare, setShowWithdrawShare] = useState(false);
  const [pendingReviewAfterShare, setPendingReviewAfterShare] = useState(false);

  const loadDeposits = useCallback(async () => {
    try {
      const res = await fetch('/api/deposits/history', { credentials: 'include', cache: 'no-store' });
      if (res.ok) { const d = await res.json(); setDeposits(d.deposits || []); }
    } catch {}
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [wRes, meRes, rRes, rbRes] = await Promise.all([
        fetch('/api/wallet/state', { cache: 'no-store' }),
        fetch('/api/auth/me', { cache: 'no-store' }),
        fetch('/api/user/referral', { cache: 'no-store' }),
        fetch('/api/referral/balance', { credentials: 'include', cache: 'no-store' }),
      ]);
      if (wRes.status === 401) { router.push('/login'); return; }
      if (wRes.ok) setWallet(await wRes.json());
      const meData = meRes.ok ? await meRes.json() : null;
      if (meData) setMe(meData);
      if (rRes.ok) setReferral(await rRes.json());
      if (rbRes.ok) setRefBalance(await rbRes.json());
      if (meData?.role && !meData.hasSignedAgreement) setShowAgreement(true);
    } catch {}
  }, [router]);

  const loadWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/state', { cache: 'no-store' });
      if (res.ok) setWallet(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
    loadDeposits();
  }, [loadData, loadDeposits]);

  // refresh funds surfaces when a crypto deposit confirms elsewhere
  useEffect(() => {
    const h = () => { loadWallet(); loadDeposits(); };
    window.addEventListener('ktx:deposits-changed', h);
    return () => window.removeEventListener('ktx:deposits-changed', h);
  }, [loadWallet, loadDeposits]);

  useEffect(() => {
    const handleNext = () => setTourStep((s) => s + 1);
    window.addEventListener('tour-next', handleNext);
    return () => window.removeEventListener('tour-next', handleNext);
  }, []);

  async function completeTour() {
    setTourStep(0);
    try { await fetch('/api/user/tour', { method: 'POST' }); } catch {}
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (!wallet) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>;

  const tier = wallet.tier || 'none';
  const deposited = Number(wallet.deposited || 0);
  const availableProfit = Number(wallet.availableProfit || 0);
  const accumulatedProfit = Number(wallet.accumulatedProfit || 0);
  const platformCredit = Number(wallet.platformCredit || 0);
  const dailyRate = Number(wallet.tierRate ?? wallet.dailyRate ?? 0);
  const todayTarget = (deposited + platformCredit) * dailyRate;

  const txnRows = [
    ...deposits.map((d: any) => ({ id: `d-${d.id}`, date: d.createdAt, type: 'Deposit', amount: Number(d.amount), status: d.status, kind: 'in' })),
    ...(wallet.withdrawals ?? []).map((w: any, i: number) => ({ id: `w-${i}-${w.requestedAt ?? i}`, date: w.requestedAt ?? w.date ?? 0, type: `Withdrawal${w.type === 'deposit' || w.currency === 'usdt_principal' ? ' (principal)' : ''}`, amount: -Number(w.amount), status: w.status, kind: 'out' })),
  ].sort((a, b) => (b.date || 0) - (a.date || 0));

  // last-7-days profit from the real profitHistory ledger
  const profitWeek = (() => {
    const hist = (wallet.profitHistory ?? []).map((p: any) => ({ t: Date.parse(p.date), amt: Number(p.profit || 0) }));
    const days: { day: string; amt: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const hit = hist.find((h: any) => h.t === d.getTime());
      days.push({ day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amt: hit?.amt ?? 0 });
    }
    return days;
  })();
  const thisWeek = +profitWeek.reduce((s, d) => s + d.amt, 0).toFixed(2);

  const withdrawalRows = (wallet.withdrawals ?? []).map((x: any, i: number) => ({
    id: `wd-${i}`, date: x.requestedAt ?? x.date ?? 0,
    type: x.type === 'deposit' || x.currency === 'usdt_principal' ? 'Principal' : 'Profit',
    amount: Number(x.amount),
    network: String(x.currency ?? '').replace(/^usdt/, '').toUpperCase() || 'TRC20',
    status: x.status,
  }));

  const commissionRows = (refBalance?.earnings ?? []).map((e: any) => ({
    id: e.id,
    date: Date.parse(e.earned_at || e.available_at),
    member: (e.notes ?? '').includes(' from ') ? String(e.notes).split(' from ').slice(1).join(' from ') : '—',
    type: e.earning_type === 'principal' ? 'First-deposit bonus' : 'Profit share',
    amount: Number(e.amount),
    status: new Date(e.available_at) > new Date() ? 'hold' : 'available',
  }));

  const go = (t: string) => { setTab(t); setSidebarOpen(false); };

  const sidebar = <Sidebar brand="KingdomTradeX" brandSub="Member" sections={SECTIONS} active={tab} onSelect={go} footer={<ThemeToggle />} />;

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans">
      {/* SIDEBAR (desktop) */}
      <div id="tour-sidebar" className="hidden lg:block">{sidebar}</div>

      {/* SIDEBAR (mobile drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}

      {/* MAIN */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)]/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="px-2" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </Button>
            <span className="text-[14px] font-medium text-[var(--fg)] lg:hidden">KTX Console</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.05em] ${tier === 'steward' ? 'border-[var(--cyan)]/40 text-[var(--cyan)]' : tier === 'none' ? 'border-[var(--border)] text-[var(--muted)]' : 'border-[var(--gold)]/40 text-[var(--gold)]'}`}>{TIER_LABELS[tier]}</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <div key={tab} className="ds-fade-in mx-auto max-w-[1200px]">

            {/* ═══ DASHBOARD (preview DashboardTab) ═══ */}
            {tab === 'dashboard' && (
              <>
                <PageHeader
                  crumbs={['Member', 'Dashboard']}
                  id="tour-actions"
                  title={`Welcome back, ${wallet.name || 'Member'}`}
                  description={`${cap(tier)} plan · active since ${wallet.depositAt ? fmtDate(Date.parse(wallet.depositAt)) : '—'} · hold ends ${wallet.depositAt ? new Date(new Date(wallet.depositAt).setMonth(new Date(wallet.depositAt).getMonth() + (wallet.holdMonths || 6))).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}`}
                  actions={
                    <>
                      <Button variant="secondary" onClick={() => setShowProfitWithdraw(true)} disabled={availableProfit <= 0}>Withdraw profit</Button>
                      <Button variant="primary" onClick={() => setShowDepositModal(true)}>Deposit</Button>
                    </>
                  }
                />

                <div id="tour-balance" className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard label="Principal" value={`$${money(deposited)}`} context="Active investments" onClick={() => go('wallet')} />
                  <StatCard label="Available profit" value={`$${money(availableProfit)}`} tone="profit" context="Ready to withdraw" onClick={() => setShowProfitWithdraw(true)} />
                  <StatCard label="Today's target" value={`+$${money(todayTarget)}`} tone="profit" context={`${(dailyRate * 100).toFixed(2)}% daily`} />
                  <StatCard label="Platform credit" value={platformCredit > 0 ? `$${money(platformCredit)}` : 'Locked'} tone="gold" context={wallet.freeCreditUnlocked ? 'Earns profit · not withdrawable' : 'Deposit to unlock $50 credit'} />
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <DataCard title="Recent transactions" className="lg:col-span-2" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable rows={txnRows.slice(0, 10)} pageSize={5} emptyText="No transactions yet." columns={[
                        { key: 'date', header: 'Date', width: '110px', render: (r: any) => fmtDate(r.date) },
                        { key: 'type', header: 'Description' },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className={r.kind === 'in' ? 'text-[var(--profit)]' : ''}>{r.kind === 'in' ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</StatusPill> },
                      ]} />
                    </div>
                  </DataCard>

                  <DataCard title="Account status">
                    <div className="space-y-2.5">
                      <StatInline label="Plan" value={TIER_LABELS[tier]} tone="gold" />
                      <StatInline label="Holding period" value={`${wallet.holdMonths || 6} months`} />
                      <StatInline label="Early exit fee" value="50%" tone="gold" />
                      <StatInline label="Pastor" value={wallet.pastorName || '—'} />
                      <div className="my-2 border-t border-[var(--border)]" />
                      <StatInline label="Referral bonus earned" value={`$${money(Number(wallet.referralBonusEarned ?? 0))}`} tone="profit" />
                    </div>
                    <div className="mt-4 border-t border-[var(--border)] pt-3">
                      <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setShowAgreement(true)}>View Trading Agreement</Button>
                    </div>
                  </DataCard>
                </div>
              </>
            )}

            {/* ═══ WALLET (preview WalletTab) ═══ */}
            {tab === 'wallet' && (
              <>
                <PageHeader crumbs={['Member', 'Wallet']} title="Wallet & Funds" description="USDT (TRC20) deposits and payouts. One address, any network — we warn you before anything irreversible."
                  actions={<Button variant="primary" onClick={() => setShowDepositModal(true)}>Deposit</Button>} />
                {actionMsg && <div className="mt-6 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-5 py-3 text-center text-[13px] text-[var(--gold)]">{actionMsg}</div>}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <StatCard label="Principal" value={`$${money(deposited)}`} context="Invested in your plan" />
                  <StatCard label="Profit available" value={`$${money(availableProfit)}`} tone="profit" context="Withdraws instantly, no approval" onClick={() => setShowProfitWithdraw(true)} />
                  <StatCard label="Platform credit" value={platformCredit > 0 ? `$${money(platformCredit)}` : 'Locked'} tone="gold" context="Not withdrawable" />
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <DataCard title="Deposit" subtitle="Generates a personal TRC20 address + QR" interactive onClick={() => setShowDepositModal(true)}>
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 500, 1000, 5000].map((a) => (
                        <Button key={a} variant="secondary" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowDepositModal(true); }}>${a.toLocaleString('en-US')}</Button>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-3">
                      <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--muted)]">Amount in USD</div>
                      <Button variant="primary" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowDepositModal(true); }}>Get address</Button>
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
                        <Button variant="primary" size="sm" disabled={availableProfit <= 0} onClick={() => setShowProfitWithdraw(true)}>Withdraw ${money(availableProfit)}</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div>
                          <p className="text-[14px] font-medium text-[var(--fg)]">Principal</p>
                          <p className="text-[12px] text-[var(--muted)]">Admin review 12–24h · 50% fee inside your {wallet.holdMonths || 6}-month hold — profit is never touched</p>
                        </div>
                        <Button variant="secondary" size="sm" disabled={deposited <= 0} onClick={() => setShowPrincipalWithdraw(true)}>Request</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div>
                          <p className="text-[14px] font-medium text-[var(--fg)]">Referral earnings</p>
                          <p className="text-[12px] text-[var(--muted)]">Admin review · unlocks after 7-day hold</p>
                        </div>
                        <Button variant="secondary" size="sm" disabled={Number(refBalance?.availableBalance || 0) <= 0} onClick={() => setShowReferralWithdraw(true)}>Request ${money(Number(refBalance?.availableBalance || 0))}</Button>
                      </div>
                    </div>
                  </DataCard>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <DataCard title="Deposit history" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable rows={deposits} pageSize={5} emptyText="No deposit history." columns={[
                        { key: 'createdAt', header: 'Date', render: (r: any) => fmtDate(r.createdAt) },
                        { key: 'amount', header: 'USD', align: 'right', render: (r: any) => `$${money(Number(r.amount))}` },
                        { key: 'pay_amount', header: 'Paid (USDT)', align: 'right', render: (r: any) => (r.pay_amount != null ? money(Number(r.pay_amount)) : '—') },
                        { key: 'tier', header: 'Tier', render: (r: any) => (r.tier ? cap(r.tier) : '—') },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</StatusPill> },
                      ]} />
                    </div>
                  </DataCard>
                  <DataCard title="All transactions" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable rows={txnRows} pageSize={5} emptyText="No transactions yet." columns={[
                        { key: 'date', header: 'Date', width: '110px', render: (r: any) => fmtDate(r.date) },
                        { key: 'type', header: 'Description' },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className={r.kind === 'in' ? 'text-[var(--profit)]' : ''}>{r.kind === 'in' ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</StatusPill> },
                      ]} />
                    </div>
                  </DataCard>
                </div>
              </>
            )}

            {/* ═══ EARNINGS (preview EarningsTab, real data) ═══ */}
            {tab === 'earnings' && (
              <>
                <PageHeader crumbs={['Member', 'Earnings']} title="Earnings" description="Your profit ledger and the daily rhythm behind it." actions={<Button variant="primary" disabled={availableProfit <= 0} onClick={() => setShowProfitWithdraw(true)}>Withdraw profit</Button>} />
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard label="Lifetime" value={`$${money(accumulatedProfit)}`} />
                  <StatCard label="Available" value={`$${money(availableProfit)}`} tone="profit" />
                  <StatCard label="This week" value={`+$${money(thisWeek)}`} tone="profit" />
                  <StatCard label="Daily rate" value={dailyRate ? `${(dailyRate * 100).toFixed(2)}%` : '—'} context={dailyRate ? `$${money(todayTarget)} / day at current principal` : 'Deposit to activate your plan'} />
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <DataCard title="Last 7 days" className="lg:col-span-2">
                    <div className="flex h-40 items-end gap-3">
                      {profitWeek.map((d) => {
                        const max = Math.max(1, ...profitWeek.map((x) => x.amt));
                        return (
                          <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                            <span className="text-[10px] tabular-nums text-[var(--muted)]">{d.amt.toFixed(0)}</span>
                            <div className={`w-full rounded-t-md transition-all ${d.amt > 0 ? 'bg-gradient-to-t from-[var(--gold)]/40 to-[var(--gold)]' : 'bg-[var(--card)]'}`} style={{ height: `${(d.amt / max) * 110}px`, minHeight: 4 }} />
                            <span className="text-[10px] text-[var(--muted)]">{d.day.split(' ')[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </DataCard>
                  <DataCard title="How profit is computed">
                    <div className="space-y-2.5">
                      <StatInline label="Principal" value={`$${money(deposited)}`} />
                      <StatInline label="Platform credit" value={`+$${money(platformCredit)}`} tone="gold" />
                      <StatInline label="Basis" value={`$${money(deposited + platformCredit)}`} />
                      <StatInline label={`Rate (${TIER_LABELS[tier]})`} value={dailyRate ? `${(dailyRate * 100).toFixed(2)}% / day` : '—'} tone="profit" />
                      <StatInline label="Daily target" value={`$${money(todayTarget)}`} tone="profit" />
                    </div>
                    <p className="mt-3 text-[11px] leading-[1.6] text-[var(--muted)]">Targets, not promises. Actual daily returns vary with the market; the hold never touches your harvest.</p>
                  </DataCard>
                </div>
                <div className="mt-6">
                  <DataCard title="Withdrawal history" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable rows={withdrawalRows} pageSize={5} emptyText="No withdrawals yet." columns={[
                        { key: 'date', header: 'Date', render: (r: any) => fmtDate(r.date) },
                        { key: 'type', header: 'Type' },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => `$${money(r.amount)}` },
                        { key: 'network', header: 'Network', align: 'right' },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</StatusPill> },
                      ]} />
                    </div>
                  </DataCard>
                </div>
              </>
            )}

            {/* ═══ AI ENGINE (preview EngineTab — static placeholder by product decision) ═══ */}
            {tab === 'engine' && (
              <div id="tour-engine">
                <PageHeader crumbs={['Member', 'AI Engine']} title="AI Engine" description="Live execution on your allocated desk. Every fill is published to your ledger." />
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard label="Win rate (30d)" value={ENGINE_STATS.winRate} tone="profit" context="Across the engine" />
                  <StatCard label="Open positions" value={ENGINE_STATS.openPositions} context="On your desk" />
                  <StatCard label="Today's P&L" value={ENGINE_STATS.todayPnl} tone="profit" context="Across all tiers" />
                  <StatCard label="Max drawdown" value={ENGINE_STATS.drawdown} context="Guardrail: 8%" />
                </div>
                <div className="mt-6">
                  <DataCard title="Today's fills" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable rows={ENGINE_FILLS} pageSize={5} columns={[
                        { key: 'time', header: 'Time', width: '70px' },
                        { key: 'symbol', header: 'Asset' },
                        { key: 'side', header: 'Side', render: (r: any) => <span className={r.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--gold)]'}>{r.side}</span> },
                        { key: 'qty', header: 'Qty', align: 'right' },
                        { key: 'pnl', header: 'P&L', align: 'right', render: (r: any) => <span className={r.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[#F87171]'}>{r.pnl >= 0 ? '+' : '−'}${money(Math.abs(r.pnl))}</span> },
                      ]} />
                    </div>
                  </DataCard>
                </div>
              </div>
            )}

            {/* ═══ REFERRALS (preview ReferralsTab, real data) ═══ */}
            {tab === 'referrals' && (
              <>
                <PageHeader crumbs={['Member', 'Referrals']} title="Referrals" description="2.5% of each friend's first deposit, plus 0.1% of their profit forever. Funds unlock after a 7-day hold."
                  actions={<Button variant="primary" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referral?.code ?? ''}`); setActionMsg('Link copied!'); setTimeout(() => setActionMsg(''), 2000); } catch {} }}>Copy invite link</Button>} />
                {actionMsg && <div className="mt-6 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-5 py-3 text-center text-[13px] text-[var(--gold)]">{actionMsg}</div>}
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard label="Total earned" value={`$${money(Number(refBalance?.totalEarned ?? 0))}`} tone="gold" />
                  <StatCard label="Available" value={`$${money(Number(refBalance?.availableBalance ?? 0))}`} tone="profit" />
                  <StatCard label="Pending hold" value={`$${money(Number(refBalance?.pendingBalance ?? 0))}`} tone="gold" />
                  <StatCard label="Invited" value={`${referral?.referrals?.length ?? 0} members`} context={`${(referral?.referrals ?? []).filter((m: any) => m.funded).length} funded`} />
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <DataCard title="Invite link" className="lg:col-span-2">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-[13px] text-[var(--gold)]">
                      {typeof window !== 'undefined' ? window.location.origin : 'kingdomtradex.com'}/register?ref={referral?.code ?? '—'}
                    </div>
                    <div className="mt-4 space-y-3 text-[12px] text-[var(--muted)]">
                      <p>· They join under your link → you earn on their first deposit and their daily profit.</p>
                      <p>· No cost to them. You never see or touch their funds.</p>
                      <p>· Referral payouts are reviewed within 24h after the 7-day hold.</p>
                    </div>
                  </DataCard>
                  <DataCard title="Your referrals" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable rows={(referral?.referrals ?? []).map((m: any) => ({ id: m.id, name: m.name, funded: m.funded ? 1 : 0, joined: m.joinedAt }))} pageSize={5} emptyText="No referrals yet — share your link." columns={[
                        { key: 'name', header: 'Member' },
                        { key: 'funded', header: 'Status', align: 'right', render: (r: any) => (r.funded ? <StatusPill tone="green">Funded</StatusPill> : <StatusPill tone="muted">Invited</StatusPill>) },
                        { key: 'joined', header: 'Joined', align: 'right', render: (r: any) => fmtDate(r.joined).split(',').slice(0, 2).join(',') },
                      ]} />
                    </div>
                  </DataCard>
                </div>
                <div className="mt-6">
                  <DataCard title="Earnings detail" padded={false} actions={<Button variant="primary" size="sm" disabled={Number(refBalance?.availableBalance ?? 0) <= 0} onClick={() => setShowReferralWithdraw(true)}>Request payout</Button>}>
                    <div className="px-2 pb-2">
                      <DataTable rows={commissionRows} pageSize={5} emptyText="No referral earnings yet." columns={[
                        { key: 'date', header: 'Date', width: '86px', render: (r: any) => (r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—') },
                        { key: 'member', header: 'Source' },
                        { key: 'type', header: 'Type' },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className="text-[var(--gold)]">+${money(r.amount)}</span> },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => (r.status === 'hold' ? <StatusPill tone="gold">Hold</StatusPill> : <StatusPill tone="green">Available</StatusPill>) },
                      ]} />
                    </div>
                  </DataCard>
                </div>
              </>
            )}

            {/* ═══ SETTINGS (preview SettingsTab, real data) ═══ */}
            {tab === 'settings' && (
              <>
                <PageHeader crumbs={['Member', 'Settings']} title="Settings" description="Profile, security and payout preferences." />
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <DataCard title="Profile">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
                      <div>
                        <p className="text-[14px] font-medium text-[var(--fg)]">{me?.name ?? wallet.name ?? 'Member'}</p>
                        <p className="text-[12px] text-[var(--muted)]">{wallet.email ?? '—'}{wallet.emailVerified ? ' · verified' : ''}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      <StatInline label="Member since" value={wallet.depositAt ? fmtDate(Date.parse(wallet.depositAt)) : '—'} />
                      <StatInline label="Pastor" value={wallet.pastorName || '—'} />
                      <StatInline label="Referral code" value={referral?.code ?? '—'} />
                      <StatInline label="Current tier" value={TIER_LABELS[tier]} tone="gold" />
                    </div>
                  </DataCard>
                  <DataCard title="Security & preferences">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Two-factor authentication</p><p className="text-[12px] text-[var(--muted)]">{wallet.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}</p></div><Toggle on={!!wallet.twoFactorEnabled} /></div>
                      <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Trading Agreement</p><p className="text-[12px] text-[var(--muted)]">{me?.hasSignedAgreement ? 'Signed' : 'Signature required'}</p></div><Button variant="secondary" size="sm" onClick={() => setShowAgreement(true)}>View</Button></div>
                      <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Trustpilot review</p><p className="text-[12px] text-[var(--muted)]">Share your experience</p></div><Button variant="ghost" size="sm" onClick={() => { setReviewTrigger('activeUser30Days'); setShowReviewModal(true); }}>Leave review</Button></div>
                      <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Theme</p><p className="text-[12px] text-[var(--muted)]">Night · Daylight</p></div><ThemeToggle /></div>
                      <div className="flex items-center justify-between"><div><p className="text-[14px] text-[var(--fg)]">Session</p><p className="text-[12px] text-[var(--muted)]">Sign out of this device</p></div><Button variant="danger" size="sm" onClick={handleLogout}>Sign out</Button></div>
                    </div>
                  </DataCard>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* TOUR */}
      <SpotlightTour steps={TOUR_STEPS} activeStep={tourStep} onComplete={completeTour} />

      {/* MODALS (all preserved) */}
      {showAgreement && (
        <TradingAgreementModal
          userName={me?.name}
          onAgree={() => {
            setShowAgreement(false);
            setMe((m: any) => (m ? { ...m, hasSignedAgreement: true } : m));
          }}
        />
      )}

      <ShareGate
        open={showWithdrawShare}
        title="You Made a Withdrawal"
        subtitle="Share your first profit withdrawal with the world. Choose one platform below."
        platforms={['instagram', 'facebook', 'whatsapp', 'x']}
        shareUrl={typeof window !== 'undefined' ? window.location.href : 'https://kingdomtradex.com'}
        shareText="I just withdrew profit from KingdomTradeX. Faith-driven AI trading works."
        mandatory={true}
        onShared={() => {
          setShowWithdrawShare(false);
          if (pendingReviewAfterShare) {
            setPendingReviewAfterShare(false);
            setReviewTrigger('firstWithdrawal');
            setShowReviewModal(true);
          }
        }}
        secondaryAction={{ label: 'Leave a Trustpilot review', url: SOCIAL_URLS.trustpilot }}
      />

      <ReviewInvitationModal open={showReviewModal} triggerType={reviewTrigger} onClose={() => setShowReviewModal(false)} onInvited={() => setShowReviewModal(false)} />
      <DepositModal open={showDepositModal} onClose={() => setShowDepositModal(false)} />
      <ProfitWithdrawModal open={showProfitWithdraw} onClose={() => setShowProfitWithdraw(false)} availableProfit={availableProfit} onDone={loadWallet} />
      <PrincipalWithdrawModal open={showPrincipalWithdraw} onClose={() => setShowPrincipalWithdraw(false)} principal={deposited} tier={tier} depositAt={wallet.depositAt} onDone={loadWallet} />
      <ReferralWithdrawModal open={showReferralWithdraw} availableBalance={Number(refBalance?.availableBalance ?? 0)} onClose={() => setShowReferralWithdraw(false)} onSuccess={loadData} />
    </div>
  );
}
