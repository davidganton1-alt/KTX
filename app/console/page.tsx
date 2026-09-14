'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, type NavSection } from '@/components/design-system/Sidebar';
import { PageHeader } from '@/components/design-system/PageHeader';
import { StatCard, StatInline } from '@/components/design-system/StatCard';
import { DataCard } from '@/components/design-system/DataCard';
import { DataTable, StatusPill } from '@/components/design-system/DataTable';
import { Button } from '@/components/design-system/Button';
import { Label, Num } from '@/components/design-system/Typography';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TradingAgreementModal } from '@/components/TradingAgreementModal';
import { ShareGate } from '@/components/ShareGate';
import { ReviewInvitationModal } from '@/components/ReviewInvitationModal';
import { SOCIAL_URLS } from '@/lib/social';
import { SpotlightTour } from '@/components/SpotlightTour';
import { DepositModal } from '@/components/DepositModal';
import { ProfitDisplay } from '@/components/ProfitDisplay';
import { ProfitWithdrawModal } from '@/components/ProfitWithdrawModal';
import { ReferralDisplay } from '@/components/ReferralDisplay';
import { PrincipalWithdrawModal } from '@/components/PrincipalWithdrawModal';

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

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
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Static engine summary — placeholder per design direction; live data lands in a later phase.
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

export default function ConsolePage() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [wallet, setWallet] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [actionMsg, setActionMsg] = useState('');

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showProfitWithdraw, setShowProfitWithdraw] = useState(false);
  const [showPrincipalWithdraw, setShowPrincipalWithdraw] = useState(false);
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
      const [wRes, meRes, rRes] = await Promise.all([
        fetch('/api/wallet/state', { cache: 'no-store' }),
        fetch('/api/auth/me', { cache: 'no-store' }),
        fetch('/api/user/referral', { cache: 'no-store' }),
      ]);
      if (wRes.ok) setWallet(await wRes.json());
      const meData = meRes.ok ? await meRes.json() : null;
      if (meData) setMe(meData);
      if (rRes.ok) setReferral(await rRes.json());
      if (meData?.role && !meData.hasSignedAgreement) setShowAgreement(true);
    } catch {}
  }, []);

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
  const platformCredit = Number(wallet.platformCredit ?? (wallet.freeCreditUnlocked ? 50 : 0));
  const dailyRate = Number(wallet.tierRate ?? wallet.dailyRate ?? 0);
  const todayTarget = (deposited + platformCredit) * dailyRate;

  const txnRows = [
    ...deposits.map((d: any) => ({ id: `d-${d.id}`, date: d.createdAt, type: 'Deposit', amount: Number(d.amount), status: d.status, kind: 'in' })),
    ...(wallet.withdrawals ?? []).map((w: any, i: number) => ({ id: `w-${i}-${w.date ?? i}`, date: w.date, type: `Withdrawal${w.currency === 'usdt_principal' ? ' (principal)' : ''}`, amount: Number(w.amount), status: w.status, kind: 'out' })),
  ].sort((a, b) => (b.date || 0) - (a.date || 0));

  const statusTone = (s: string) =>
    s === 'completed' || s === 'finished' || s === 'confirmed' ? 'green'
      : s === 'failed' || s === 'rejected' || s === 'cancelled' ? 'red'
      : s === 'pending_approval' || s === 'awaiting_engine_transfer' || s === 'processing' ? 'cyan'
      : 'gold';

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
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[var(--muted)] lg:hidden" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="text-[14px] font-medium text-[var(--fg)] lg:hidden">KTX Console</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.05em] ${tier === 'ambassador' || tier === 'faithful' ? 'border-[var(--gold)]/40 text-[var(--gold)]' : tier === 'steward' ? 'border-[var(--cyan)]/40 text-[var(--cyan)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>{TIER_LABELS[tier]}</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <div key={tab} className="ds-fade-in mx-auto max-w-[1200px]">

            {/* ═══ DASHBOARD ═══ */}
            {tab === 'dashboard' && (
              <>
                <PageHeader
                  crumbs={['Member', 'Dashboard']}
                  id="tour-actions"
                  title={`Welcome back, ${wallet.name || 'Member'}`}
                  description={`${cap(tier)} plan · $${money(deposited)} principal · ${tier !== 'none' ? `${(dailyRate * 100).toFixed(2)}% daily target` : 'deposit to activate your plan'}`}
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
                      <DataTable
                        rows={txnRows}
                        pageSize={5}
                        emptyText="No transactions yet."
                        columns={[
                          { key: 'date', header: 'Date', width: '110px', render: (r: any) => fmtDate(r.date || 0) },
                          { key: 'type', header: 'Description' },
                          { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className={r.kind === 'in' ? 'text-[var(--profit)]' : ''}>{r.kind === 'in' ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
                          { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</StatusPill> },
                        ]}
                      />
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

            {/* ═══ WALLET ═══ */}
            {tab === 'wallet' && (
              <>
                <PageHeader crumbs={['Member', 'Wallet']} title="Wallet & Funds" description="Deposits, withdrawals and your full ledger. USDT (TRC20) payouts to any wallet."
                  actions={<Button variant="primary" onClick={() => setShowDepositModal(true)}>Deposit</Button>} />
                {actionMsg && <div className="mt-6 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-5 py-3 text-center text-[13px] text-[var(--gold)]">{actionMsg}</div>}

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <DataCard title="Deposit funds" subtitle="TRC20 · QR in seconds" interactive onClick={() => setShowDepositModal(true)}>
                    <p className="text-[12px] leading-[1.6] text-[var(--muted)]">Add USDT to grow your plan. The $50 platform credit unlocks on your first deposit.</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {[100, 500, 1000, 5000].map((a) => <Button key={a} variant="secondary" size="sm">${a.toLocaleString('en-US')}</Button>)}
                    </div>
                    <Button variant="primary" className="mt-3 w-full">Make a Deposit</Button>
                  </DataCard>

                  <DataCard title="Withdraw profit" subtitle="Automatic · no approval" interactive onClick={() => setShowProfitWithdraw(true)}>
                    <p className="mt-1"><Num className="text-[var(--profit)]">${money(availableProfit)}</Num></p>
                    <Label>Available</Label>
                    <Button variant="primary" className="mt-4 w-full" disabled={availableProfit <= 0}>Withdraw Profit</Button>
                  </DataCard>

                  <DataCard title="Withdraw principal" subtitle="Admin review 12–24h" interactive onClick={() => setShowPrincipalWithdraw(true)}>
                    <p className="mt-1"><Num>${money(deposited)}</Num></p>
                    <Label>Principal</Label>
                    <p className="mt-2 text-[11px] leading-[1.6] text-[var(--muted)]">50% fee inside your {wallet.holdMonths || 6}-month holding period. Profit is never touched.</p>
                    <Button variant="secondary" className="mt-4 w-full" disabled={deposited <= 0}>Request Withdrawal</Button>
                  </DataCard>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <DataCard title="Deposit history" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable
                        rows={deposits.map((d: any) => ({ ...d, dateMs: d.createdAt }))}
                        pageSize={5}
                        emptyText="No deposit history."
                        columns={[
                          { key: 'dateMs', header: 'Date', render: (r: any) => fmtDate(r.dateMs || 0) },
                          { key: 'amount', header: 'USD Amount', align: 'right', render: (r: any) => `$${money(r.amount)}` },
                          { key: 'pay_amount', header: 'Paid (Crypto)', align: 'right', render: (r: any) => (r.pay_amount != null ? `${money(Number(r.pay_amount))} USDT` : '—') },
                          { key: 'tier', header: 'Tier', render: (r: any) => (r.tier ? cap(r.tier) : '—') },
                          { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</StatusPill> },
                        ]}
                      />
                    </div>
                  </DataCard>
                  <DataCard title="All transactions" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable
                        rows={txnRows}
                        pageSize={5}
                        emptyText="No transactions yet."
                        columns={[
                          { key: 'date', header: 'Date', width: '110px', render: (r: any) => fmtDate(r.date || 0) },
                          { key: 'type', header: 'Description' },
                          { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className={r.kind === 'in' ? 'text-[var(--profit)]' : ''}>{r.kind === 'in' ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
                          { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={statusTone(r.status)}>{cap(String(r.status).replace(/_/g, ' '))}</StatusPill> },
                        ]}
                      />
                    </div>
                  </DataCard>
                </div>
              </>
            )}

            {/* ═══ EARNINGS ═══ */}
            {tab === 'earnings' && (
              <>
                <PageHeader crumbs={['Member', 'Earnings']} title="Profit Earnings" description="Your daily accruals, lifetime profit and withdrawal history." />
                <div className="mt-6">
                  <ProfitDisplay />
                </div>
              </>
            )}

            {/* ═══ AI ENGINE ═══ */}
            {tab === 'engine' && (
              <div id="tour-engine">
                <PageHeader crumbs={['Member', 'AI Engine']} title="AI Trading Engine" description="Automated algorithmic trading performance." />
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard label="Win Rate" value={ENGINE_STATS.winRate} tone="profit" context="Last 30 days" />
                  <StatCard label="Open Positions" value={ENGINE_STATS.openPositions} context="Across your desk" />
                  <StatCard label="Today's P&L" value={ENGINE_STATS.todayPnl} tone="profit" context="Across all tiers" />
                  <StatCard label="Max Drawdown" value={ENGINE_STATS.drawdown} context="Guardrail active" />
                </div>
                <div className="mt-6">
                  <DataCard title="Recent engine fills" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable
                        rows={ENGINE_FILLS}
                        columns={[
                          { key: 'time', header: 'Time', width: '70px' },
                          { key: 'symbol', header: 'Asset' },
                          { key: 'side', header: 'Side', render: (r: any) => <span className={r.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--gold)]'}>{r.side}</span> },
                          { key: 'qty', header: 'Quantity', align: 'right' },
                          { key: 'pnl', header: 'P&L', align: 'right', render: (r: any) => <span className={r.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[#F87171]'}>{r.pnl >= 0 ? '+' : '−'}${money(Math.abs(r.pnl))}</span> },
                        ]}
                      />
                    </div>
                  </DataCard>
                </div>
              </div>
            )}

            {/* ═══ REFERRALS ═══ */}
            {tab === 'referrals' && (
              <>
                <PageHeader crumbs={['Member', 'Referrals']} title="Referral Network" description="Invite friends and earn 2.5% on their first deposit + 0.1% lifetime profit share."
                  actions={<Button variant="primary" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referral?.code ?? ''}`); setActionMsg('Link copied!'); setTimeout(() => setActionMsg(''), 2000); } catch {} }}>Copy invite link</Button>} />
                {actionMsg && <div className="mt-6 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-5 py-3 text-center text-[13px] text-[var(--gold)]">{actionMsg}</div>}
                <div className="mt-6">
                  <ReferralDisplay />
                </div>
              </>
            )}

            {/* ═══ SETTINGS ═══ */}
            {tab === 'settings' && (
              <>
                <PageHeader crumbs={['Member', 'Settings']} title="Account Settings" description="Profile, security and preferences." />
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <DataCard title="Profile">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
                      <div>
                        <p className="text-[14px] font-medium text-[var(--fg)]">{me?.name ?? wallet.name ?? 'Member'}</p>
                        <p className="text-[12px] text-[var(--muted)]">{wallet.email ?? '—'}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      <StatInline label="Current tier" value={TIER_LABELS[tier]} tone="gold" />
                      <StatInline label="Member since" value={wallet.depositAt ? fmtDate(wallet.depositAt) : '—'} />
                      <StatInline label="Email verified" value={wallet.emailVerified ? 'Yes' : 'No'} />
                    </div>
                  </DataCard>
                  <DataCard title="Security & agreements">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Two-factor authentication</p><p className="text-[12px] text-[var(--muted)]">{wallet.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}</p></div>
                        <Toggle on={!!wallet.twoFactorEnabled} />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Trading Agreement</p><p className="text-[12px] text-[var(--muted)]">{me?.hasSignedAgreement ? 'Signed' : 'Signature required'}</p></div>
                        <Button variant="secondary" size="sm" onClick={() => setShowAgreement(true)}>View</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Trustpilot review</p><p className="text-[12px] text-[var(--muted)]">Share your experience</p></div>
                        <Button variant="ghost" size="sm" onClick={() => { setReviewTrigger('activeUser30Days'); setShowReviewModal(true); }}>Leave review</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Session</p><p className="text-[12px] text-[var(--muted)]">Sign out of this device</p></div>
                        <Button variant="danger" size="sm" onClick={handleLogout}>Sign out</Button>
                      </div>
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

      {/* MODALS (preserved) */}
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
    </div>
  );
}
