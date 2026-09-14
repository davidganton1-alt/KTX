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
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { ProEngine } from '@/components/ProEngine';
import { TierComparison } from '@/components/TierComparison';
import { PortfolioChart } from '@/components/PortfolioChart';
import { TradingAgreementModal } from '@/components/TradingAgreementModal';
import { ShareGate } from '@/components/ShareGate';
import { ReviewInvitationModal } from '@/components/ReviewInvitationModal';
import { SOCIAL_URLS } from '@/lib/social';
import { SpotlightTour } from '@/components/SpotlightTour';
import { DepositModal } from '@/components/DepositModal';
import { DepositHistory } from '@/components/DepositHistory';
import { ProfitDisplay } from '@/components/ProfitDisplay';
import { ProfitWithdrawModal } from '@/components/ProfitWithdrawModal';
import { ReferralDisplay } from '@/components/ReferralDisplay';
import { PrincipalWithdrawModal } from '@/components/PrincipalWithdrawModal';

const fmt = (p: number) => (p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
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
    heading: 'Portfolio',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4' },
      { id: 'wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'earnings', label: 'Earnings', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { id: 'engine', label: 'AI Engine', icon: 'M9 3v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { id: 'markets', label: 'Markets', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    ],
  },
  {
    heading: 'Account',
    items: [
      { id: 'referrals', label: 'Referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
      { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
      { id: 'support', label: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
      { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ],
  },
];

const TIER_LABELS: Record<string, string> = { none: 'Unranked', faithful: 'Faithful', steward: 'Steward', ambassador: 'Ambassador' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
  const [showTierModal, setShowTierModal] = useState(false);
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
  const nextTier = tier === 'none' ? 'faithful' : tier === 'faithful' ? 'steward' : tier === 'steward' ? 'ambassador' : null;
  const tierThresholds: Record<string, number> = { none: 0, faithful: 100, steward: 1000, ambassador: 5000 };
  const progress = nextTier ? Math.min(100, (deposited / tierThresholds[nextTier]) * 100) : 100;

  const txnRows = [
    ...(deposits.map((d: any) => ({ id: `d-${d.id}`, date: d.createdAt, type: 'Deposit', amount: Number(d.amount), status: d.status, kind: 'in' }))),
    ...(wallet.withdrawals ?? []).map((w: any, i: number) => ({ id: `w-${i}-${w.date ?? i}`, date: w.date, type: `Withdrawal${w.currency === 'usdt_principal' ? ' (principal)' : ''}`, amount: Number(w.amount), status: w.status, kind: 'out' })),
  ].sort((a, b) => (b.date || 0) - (a.date || 0));

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
                  crumbs={['Member', 'Overview']}
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
                  <StatCard label="Total balance" value={<>$<AnimatedNumber value={wallet.balance} /></>} context="Principal + credit + profit" />
                  <StatCard label="Withdrawable profit" value={<>$<AnimatedNumber value={availableProfit} /></>} tone="profit" context={`Target: ${(dailyRate * 100).toFixed(2)}% / day`} onClick={() => setShowProfitWithdraw(true)} />
                  <StatCard label="Deposited principal" value={<>$<AnimatedNumber value={deposited} /></>} context={`Hold: ${wallet.holdMonths || 6} months`} onClick={() => go('wallet')} />
                  <StatCard label="Platform credit" value={platformCredit > 0 ? '$50.00' : 'Locked'} tone="gold" context={wallet.freeCreditUnlocked ? 'Earns profit · not withdrawable' : 'Deposit to unlock $50 free credit'} />
                </div>
                <div id="tour-actions" className="mt-4 grid gap-4 md:grid-cols-3">
                  <StatCard label="Fund your plan" value="Deposit USDT" context="TRC20 · QR in seconds" onClick={() => setShowDepositModal(true)} />
                  <StatCard label="Live terminal" value="AI Engine" context="Real-time fills on your desk" onClick={() => go('engine')} />
                  <StatCard label="Grow your tier" value="Compare plans" context="Higher tier, higher daily rate" onClick={() => setShowTierModal(true)} />
                </div>
                {nextTier && (
                  <DataCard title={`Progress to ${TIER_LABELS[nextTier]}`}>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-[12px] text-[var(--muted)]">Deposit more to unlock the next daily rate</span>
                      <span className="text-[12px] tabular-nums text-[var(--muted)]">${fmt(deposited)} / ${fmt(tierThresholds[nextTier])}</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-[var(--card)]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-amber-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </DataCard>
                )}
                {nextTier && <div className="mt-6" />}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <PortfolioChart deposited={deposited} profit={Number(wallet.profit ?? 0)} freeCredit={wallet.freeCreditUnlocked ? 50 : 0} />
                  </div>
                  <DataCard title="Your plan">
                    <div className="space-y-2.5">
                      <StatInline label="Tier" value={TIER_LABELS[tier]} tone="gold" />
                      <StatInline label="Daily target" value={tier !== 'none' ? `${(dailyRate * 100).toFixed(2)}%` : '—'} tone="profit" />
                      <StatInline label="Holding period" value={`${wallet.holdMonths || 6} months`} />
                      <StatInline label="Pastor" value={wallet.pastorName || '—'} />
                      <div className="my-2 border-t border-[var(--border)]" />
                      <StatInline label="Referral bonus earned" value={`$${fmt(Number(wallet.referralBonusEarned ?? 0))}`} tone="gold" />
                    </div>
                    <div className="mt-4 border-t border-[var(--border)] pt-3">
                      <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setShowAgreement(true)}>View Trading Agreement</Button>
                    </div>
                  </DataCard>
                </div>
                <div id="tour-engine" className="mt-6">
                  <ProEngine initialSymbol="BTC" />
                </div>
              </>
            )}

            {/* ═══ WALLET ═══ */}
            {tab === 'wallet' && (
              <>
                <PageHeader crumbs={['Member', 'Wallet']} title="Wallet & Funds" description="Deposits, principal withdrawals and your full transaction ledger."
                  actions={<>
                    <Button variant="secondary" onClick={() => setShowPrincipalWithdraw(true)} disabled={deposited <= 0}>Withdraw principal</Button>
                    <Button variant="primary" onClick={() => setShowDepositModal(true)}>Deposit with Crypto</Button>
                  </>} />
                {actionMsg && <div className="mt-6 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-5 py-3 text-center text-[13px] text-[var(--gold)]">{actionMsg}</div>}
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <StatCard label="Principal" value={`$${money(deposited)}`} context="Invested in your plan" />
                  <StatCard label="Profit available" value={`$${money(availableProfit)}`} tone="profit" context="Automatic payout · no approval" onClick={() => setShowProfitWithdraw(true)} />
                  <StatCard label="Platform credit" value={wallet.freeCreditUnlocked ? '$50.00' : 'Locked'} tone="gold" context={wallet.freeCreditUnlocked ? 'Not withdrawable' : 'Unlocks with your first deposit'} />
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <DataCard title="Deposit" subtitle="Pay in USDT (TRC20) from any wallet. Plan activates on network confirmation and the $50 credit unlocks on your first deposit." interactive>
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 500, 1000, 5000].map((a) => <Button key={a} variant="secondary" size="sm" onClick={() => setShowDepositModal(true)}>${a.toLocaleString('en-US')}</Button>)}
                    </div>
                    <Button variant="primary" className="mt-3 w-full" onClick={() => setShowDepositModal(true)}>Deposit with Crypto (USDT TRC20)</Button>
                    <p className="mt-3 text-[12px] text-[var(--muted)]">Min $100 · Max $15,000 · Faithful $100+ · Steward $1,000+ · Ambassador $5,000+</p>
                  </DataCard>
                  <DataCard title="Withdraw" interactive>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div>
                          <p className="text-[14px] font-medium text-[var(--fg)]">Profit</p>
                          <p className="text-[12px] text-[var(--muted)]">Automatic payout · no fee · minutes</p>
                        </div>
                        <Button variant="primary" size="sm" onClick={() => setShowProfitWithdraw(true)} disabled={availableProfit <= 0}>Withdraw ${money(availableProfit)}</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div>
                          <p className="text-[14px] font-medium text-[var(--fg)]">Principal</p>
                          <p className="text-[12px] text-[var(--muted)]">Admin review 12–24h · 50% fee inside your {wallet.holdMonths || 6}-month holding period — profit is never touched</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setShowPrincipalWithdraw(true)} disabled={deposited <= 0}>Request</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div>
                          <p className="text-[14px] font-medium text-[var(--fg)]">Referral earnings</p>
                          <p className="text-[12px] text-[var(--muted)]">Admin review · unlocks after 7-day hold</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => go('referrals')}>Go to Referrals</Button>
                      </div>
                    </div>
                  </DataCard>
                </div>
                <div className="mt-6">
                  <DataCard title="All transactions" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable
                        rows={txnRows}
                        pageSize={8}
                        emptyText="No transactions yet."
                        columns={[
                          { key: 'date', header: 'Date', width: '110px', render: (r: any) => fmtDate(r.date || 0) },
                          { key: 'type', header: 'Description' },
                          { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => <span className={r.kind === 'in' ? 'text-[var(--profit)]' : ''}>{r.kind === 'in' ? '+' : '−'}${money(Math.abs(r.amount))}</span> },
                          { key: 'status', header: 'Status', align: 'right', render: (r: any) => (
                            <StatusPill tone={r.status === 'completed' || r.status === 'finished' || r.status === 'confirmed' ? 'green' : r.status === 'failed' || r.status === 'rejected' || r.status === 'cancelled' ? 'red' : r.status === 'pending_approval' || r.status === 'awaiting_engine_transfer' || r.status === 'processing' ? 'cyan' : 'gold'}>{cap(String(r.status).replace(/_/g, ' '))}</StatusPill>
                          ) },
                        ]}
                      />
                    </div>
                  </DataCard>
                </div>
                <div className="mt-6">
                  <DepositHistory />
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
              <>
                <PageHeader crumbs={['Member', 'AI Engine']} title="AI Engine" description="Live terminal — real-time execution on your allocated desk." />
                <div className="mt-6">
                  <ProEngine initialSymbol="BTC" />
                </div>
              </>
            )}

            {/* ═══ MARKETS ═══ */}
            {tab === 'markets' && (
              <>
                <PageHeader crumbs={['Member', 'Markets']} title="Markets" description="Live prices across every asset class the engine trades." />
                <div className="mt-6"><MarketsGrid /></div>
              </>
            )}

            {/* ═══ REFERRALS ═══ */}
            {tab === 'referrals' && (
              <>
                <PageHeader crumbs={['Member', 'Referrals']} title="Referrals" description="2.5% of each friend's first deposit, plus 0.1% of their profit for life. Funds unlock after a 7-day hold." />
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard label="Total referrals" value={referral?.referrals?.length ?? 0} />
                  <StatCard label="Bonus earned" value={`$${fmt(referral?.bonusEarned ?? 0)}`} tone="profit" />
                  <StatCard label="Referral count" value={wallet.memberReferralsCount ?? 0} context="Members funded through you" />
                  <div className="ds-card rounded-xl px-5 py-4">
                    <Label>Your code</Label>
                    <div className="mt-2"><Num className="font-mono text-[var(--gold)]">{referral?.code ?? '—'}</Num></div>
                    <p className="mt-1 text-[12px] text-[var(--muted)]">kingdomtradex.com/register?ref=…</p>
                  </div>
                </div>
                <div className="mt-6">
                  <DataCard title="Invite link">
                    <div className="flex gap-2">
                      <input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referral?.code ?? ''}`}
                        onFocus={(e) => e.target.select()}
                        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-[13px] text-[var(--gold)] outline-none" />
                      <Button variant="primary" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referral?.code}`); setActionMsg('Link copied!'); setTimeout(() => setActionMsg(''), 2000); } catch {} }}>Copy</Button>
                    </div>
                    {actionMsg && <p className="mt-2 text-[12px] text-[var(--gold)]">{actionMsg}</p>}
                  </DataCard>
                </div>
                <div className="mt-6">
                  <ReferralDisplay />
                </div>
              </>
            )}

            {/* ═══ SECURITY ═══ */}
            {tab === 'security' && (
              <>
                <PageHeader crumbs={['Member', 'Security']} title="Security" description="Protect your account." />
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <DataCard title="Verified" subtitle="Identity signals on your account">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Email verification</p><p className="text-[12px] text-[var(--muted)]">{wallet.email}</p></div>
                        <StatusPill tone="green">Verified</StatusPill>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Two-factor authentication</p><p className="text-[12px] text-[var(--muted)]">Add an extra layer of security</p></div>
                        <Button variant="secondary" size="sm">{wallet.twoFactorEnabled ? 'Enabled' : 'Enable'}</Button>
                      </div>
                    </div>
                  </DataCard>
                  <DataCard title="Agreements">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Trading Agreement</p><p className="text-[12px] text-[var(--muted)]">{me?.hasSignedAgreement ? 'Signed' : 'Signature required'}</p></div>
                        <Button variant="secondary" size="sm" onClick={() => setShowAgreement(true)}>View</Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Trustpilot review</p><p className="text-[12px] text-[var(--muted)]">Share your experience</p></div>
                        <Button variant="ghost" size="sm" onClick={() => { setReviewTrigger('activeUser30Days'); setShowReviewModal(true); }}>Leave review</Button>
                      </div>
                    </div>
                  </DataCard>
                </div>
              </>
            )}

            {/* ═══ SUPPORT ═══ */}
            {tab === 'support' && (
              <>
                <PageHeader crumbs={['Member', 'Support']} title="Support" description="Our team is here for you." />
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <DataCard title="Help Center" subtitle="Answers to common questions" interactive>
                    <Button variant="secondary" className="w-full" onClick={() => { window.location.href = '/help-center'; }}>Open Help Center</Button>
                  </DataCard>
                  <DataCard title="Email Support" subtitle="support@kingdomtradex.com" interactive>
                    <Button variant="secondary" className="w-full" onClick={() => { window.location.href = 'mailto:support@kingdomtradex.com'; }}>Write to us</Button>
                  </DataCard>
                </div>
              </>
            )}

            {/* ═══ SETTINGS ═══ */}
            {tab === 'settings' && (
              <>
                <PageHeader crumbs={['Member', 'Settings']} title="Settings" description="Profile and preferences." />
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <DataCard title="Profile">
                    <div className="space-y-2.5">
                      <StatInline label="Display name" value={me?.name ?? wallet.name ?? '—'} />
                      <StatInline label="Email" value={wallet.email ?? '—'} />
                      <StatInline label="Current tier" value={TIER_LABELS[tier]} tone="gold" />
                      <StatInline label="Member since" value={wallet.depositAt ? fmtDate(wallet.depositAt) : '—'} />
                    </div>
                  </DataCard>
                  <DataCard title="Preferences">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
                        <div><p className="text-[14px] font-medium text-[var(--fg)]">Theme</p><p className="text-[12px] text-[var(--muted)]">Toggle below in the sidebar footer</p></div>
                        <ThemeToggle />
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

      {/* MODALS (all preserved) */}
      <TierComparison currentTier={wallet.tier} deposited={deposited} isOpen={showTierModal} onClose={() => setShowTierModal(false)} />

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

function MarketsGrid() {
  const [assets, setAssets] = useState<any[]>([]);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/markets', { cache: 'no-store' });
        if (res.ok) { const d = await res.json(); setAssets(d.assets || []); }
      } catch {}
    }
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  if (assets.length === 0) return <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {assets.map((a) => {
        const up = a.change24h >= 0;
        return (
          <div key={a.id} className="ds-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[var(--fg)]">{a.symbol}</p>
              <span className={`text-[12px] tabular-nums ${up ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}`}>{up ? '+' : ''}{a.change24h.toFixed(1)}%</span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--muted)]">{a.name}</p>
            <p className="mt-2 text-[16px] font-medium tabular-nums text-[var(--fg)]">${fmt(a.price)}</p>
          </div>
        );
      })}
    </div>
  );
}
