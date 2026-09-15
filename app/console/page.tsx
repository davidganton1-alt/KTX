'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, type NavSection } from '@/components/design-system/Sidebar';
import { PageHeader } from '@/components/design-system/PageHeader';
import { StatCard, StatInline } from '@/components/design-system/StatCard';
import { DataCard } from '@/components/design-system/DataCard';
import { DataTable, StatusPill } from '@/components/design-system/DataTable';
import { Button } from '@/components/design-system/Button';
import { Label, Num } from '@/components/design-system/Typography';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DepositModal } from '@/components/DepositModal';
import { ProfitWithdrawModal } from '@/components/ProfitWithdrawModal';
import { PrincipalWithdrawModal } from '@/components/PrincipalWithdrawModal';
import { ReferralWithdrawModal } from '@/components/ReferralWithdrawModal';
import { TradingAgreementModal } from '@/components/TradingAgreementModal';
import { ReviewInvitationModal } from '@/components/ReviewInvitationModal';
import { ShareGate } from '@/components/ShareGate';
import { SOCIAL_URLS } from '@/lib/social';
import { SpotlightTour } from '@/components/SpotlightTour';

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TOUR_STEPS = [
  { id: 'tour-balance', title: 'Your Portfolio', desc: 'This is your total balance, including your principal and accrued profit. Watch it grow daily.' },
  { id: 'tour-actions', title: 'Quick Actions', desc: 'Deposit funds to activate your plan, or withdraw your profit instantly. No locks, no friction.' },
  { id: 'tour-engine', title: 'Live AI Engine', desc: 'This is your trading desk. The AI executes trades in real-time with strict risk guardrails.' },
];

const SECTIONS: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4' },
      { id: 'wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'earnings', label: 'Earnings', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { id: 'engine', label: 'AI Engine', icon: 'M9 3v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { id: 'referrals', label: 'Referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
      { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066' },
    ],
  },
];

export default function ConsolePage() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [referral, setReferral] = useState<any>(null);
  const [refCode, setRefCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showDeposit, setShowDeposit] = useState(false);
  const [showProfitWithdraw, setShowProfitWithdraw] = useState(false);
  const [showPrincipalWithdraw, setShowPrincipalWithdraw] = useState(false);
  const [showReferralWithdraw, setShowReferralWithdraw] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewTrigger, setReviewTrigger] = useState<'firstWithdrawal' | 'activeUser30Days' | 'thirdWithdrawal'>('firstWithdrawal');
  const [tourStep, setTourStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showWithdrawShare, setShowWithdrawShare] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [wRes, dRes, rRes, meRes, rcRes] = await Promise.all([
        fetch('/api/wallet/state', { credentials: 'include' }),
        fetch('/api/deposits/history', { credentials: 'include' }),
        fetch('/api/referral/balance', { credentials: 'include' }),
        fetch('/api/auth/me', { credentials: 'include' }),
        fetch('/api/user/referral', { credentials: 'include' }),
      ]);
      if (wRes.status === 401 || meRes.status === 401) { router.push('/login'); return; }
      if (wRes.ok) setWallet(await wRes.json());
      if (dRes.ok) setDeposits((await dRes.json()).deposits || []);
      if (rRes.ok) setReferral(await rRes.json());
      if (rcRes.ok) setRefCode(await rcRes.json());
      if (meRes.ok) {
        const meData = await meRes.json();
        setMe(meData);
        // Auto-open agreement when unsigned (preserved gate)
        if (meData?.role && !meData.hasSignedAgreement) setShowAgreement(true);
      }
    } catch (e) {
      console.error('Load failed', e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    const onDeposits = () => loadData();
    const onNext = () => setTourStep((s) => s + 1);
    window.addEventListener('ktx:deposits-changed', onDeposits);
    window.addEventListener('tour-next', onNext);
    return () => {
      window.removeEventListener('ktx:deposits-changed', onDeposits);
      window.removeEventListener('tour-next', onNext);
    };
  }, [loadData]);

  // first profit withdrawal -> mandatory share funnel (preserved chain)
  useEffect(() => {
    const onFirst = () => setShowWithdrawShare(true);
    window.addEventListener('ktx:first-withdrawal', onFirst);
    return () => window.removeEventListener('ktx:first-withdrawal', onFirst);
  }, []);

  async function completeTour() {
    setTourStep(0);
    try { await fetch('/api/user/tour', { method: 'POST' }); } catch {}
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading || !wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  const principal = Number(wallet.deposited || 0);
  const availableProfit = Number(wallet.availableProfit || 0);
  const platformCredit = Number(wallet.platformCredit || 0);
  const tier = wallet.tier || 'faithful';
  const tierRate = Number(wallet.tierRate ?? wallet.dailyRate ?? 0);
  const todayTarget = (principal + platformCredit) * tierRate;
  const txnDate = (r: any) => r.createdAt ?? r.created_at ?? r.requestedAt ?? r.date ?? 0;

  return (
    <div className="flex min-h-screen">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar
          brand="KingdomTradeX"
          brandSub="Member"
          sections={SECTIONS}
          active={tab}
          onSelect={(id) => { setTab(id); setSidebarOpen(false); }}
          footer={<ThemeToggle />}
        />
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)]/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="px-2 lg:hidden" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <span className="text-[14px] font-medium text-[var(--fg)] lg:hidden">KTX Console</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] uppercase tracking-[0.05em] text-[var(--gold)]">{tier}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </header>

        <div key={tab} className="ds-fade-in mx-auto max-w-[1200px] p-8">
          {tab === 'dashboard' && (
            <>
              <PageHeader
                crumbs={['Member', 'Overview']}
                title={`Welcome back, ${wallet.name || 'Member'}`}
                description={`${tier.charAt(0).toUpperCase() + tier.slice(1)} plan · $${money(principal)} principal · ${(tierRate * 100).toFixed(2)}% daily target`}
                actions={
                  <div className="flex gap-3" id="tour-actions">
                    <Button variant="secondary" onClick={() => setShowProfitWithdraw(true)} disabled={availableProfit <= 0}>Withdraw Profit</Button>
                    <Button variant="primary" onClick={() => setShowDeposit(true)} id="tour-deposit-btn">Deposit</Button>
                  </div>
                }
              />

              <div className="mt-6 grid gap-4 md:grid-cols-4" id="tour-balance">
                <StatCard label="Principal" value={`$${money(principal)}`} context="Active investments" />
                <StatCard label="Accumulated profit" value={`$${money(Number(wallet.accumulatedProfit || 0))}`} tone="profit" context={`$${money(availableProfit)} available`} />
                <StatCard label="Today" value={`+$${money(todayTarget)}`} tone="profit" context={`${(tierRate * 100).toFixed(2)}% daily target`} />
                <StatCard label="Platform credit" value={platformCredit > 0 ? `$${money(platformCredit)}` : 'Locked'} tone="gold" context="Earns profit · not withdrawable" />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <DataCard title="Recent transactions" className="lg:col-span-2" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={[...deposits.map((d: any) => ({ ...d, type: 'Deposit' })), ...(wallet.withdrawals || []).map((w: any) => ({ ...w, type: w.type === 'deposit' ? 'Principal withdrawal' : w.type || 'Withdrawal' }))].sort((a: any, b: any) => new Date(txnDate(b)).getTime() - new Date(txnDate(a)).getTime()).slice(0, 10)}
                      emptyText="No transactions yet."
                      columns={[
                        { key: 'createdAt', header: 'Date', render: (r: any) => (txnDate(r) ? new Date(txnDate(r)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—') },
                        { key: 'type', header: 'Type', render: (r: any) => r.type || 'Transaction' },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => `$${money(Number(r.amount))}` },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={r.status === 'finished' || r.status === 'completed' || r.status === 'confirmed' ? 'green' : r.status === 'failed' || r.status === 'rejected' ? 'red' : 'gold'}>{r.status}</StatusPill> },
                      ]}
                    />
                  </div>
                </DataCard>

                <DataCard title="Account status">
                  <div className="space-y-4">
                    <StatInline label="Holding period" value={tier === 'ambassador' ? '12 months' : tier === 'steward' ? '9 months' : '6 months'} />
                    <StatInline label="Early exit fee" value="50%" tone="warning" />
                    <StatInline label="Plan active since" value={wallet.depositAt ? new Date(wallet.depositAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
                    <div className="pt-4 border-t border-[var(--border)]">
                      <Button variant="ghost" className="w-full justify-center" onClick={() => setShowAgreement(true)}>View trading agreement</Button>
                    </div>
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {tab === 'wallet' && (
            <>
              <PageHeader crumbs={['Member', 'Wallet']} title="Wallet & funds" description="Manage deposits, principal withdrawals, and profit withdrawals." />

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <DataCard title="Deposit funds" interactive onClick={() => setShowDeposit(true)}>
                  <p className="mb-4 text-sm text-[var(--muted)]">Add USDT via TRC20, BEP20, or ERC20 networks.</p>
                  <Button variant="primary" className="w-full">Make a deposit</Button>
                </DataCard>

                <DataCard title="Withdraw profit" interactive onClick={() => setShowProfitWithdraw(true)}>
                  <p className="mb-4 text-sm text-[var(--muted)]">Automatic · no admin approval required.</p>
                  <div className="mb-4"><Num size="hero" className="text-[var(--profit)]">${money(availableProfit)}</Num><Label>Available</Label></div>
                  <Button variant="secondary" className="w-full" disabled={availableProfit <= 0}>Withdraw profit</Button>
                </DataCard>

                <DataCard title="Withdraw principal" interactive onClick={() => setShowPrincipalWithdraw(true)}>
                  <p className="mb-4 text-sm text-[var(--muted)]">Admin approval · 50% fee before holding period.</p>
                  <div className="mb-4"><Num size="hero">${money(principal)}</Num><Label>Principal</Label></div>
                  <Button variant="secondary" className="w-full" disabled={principal <= 0}>Request withdrawal</Button>
                </DataCard>
              </div>

              <div className="mt-6">
                <DataCard title="Deposit history" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={deposits}
                      emptyText="No deposit history."
                      columns={[
                        { key: 'createdAt', header: 'Date', render: (r: any) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—') },
                        { key: 'amount', header: 'USD amount', align: 'right', render: (r: any) => `$${money(Number(r.amount))}` },
                        { key: 'pay_amount', header: 'Paid (crypto)', align: 'right', render: (r: any) => (r.pay_amount ? `${money(Number(r.pay_amount))} USDT` : '—') },
                        { key: 'tier', header: 'Tier', render: (r: any) => (r.tier ? r.tier.charAt(0).toUpperCase() + r.tier.slice(1) : '—') },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={r.status === 'finished' || r.status === 'completed' || r.status === 'confirmed' ? 'green' : r.status === 'failed' ? 'red' : 'gold'}>{r.status}</StatusPill> },
                      ]}
                    />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {tab === 'earnings' && (
            <>
              <PageHeader crumbs={['Member', 'Earnings']} title="Profit earnings" description="Your daily accruals, lifetime profit, and withdrawal history." />

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <StatCard label="Lifetime earned" value={`$${money(Number(wallet.accumulatedProfit || 0))}`} context="All-time profit" />
                <StatCard label="Available" value={`$${money(availableProfit)}`} tone="profit" context="Ready to withdraw" />
                <StatCard label="This week" value={`$${money((wallet.profitHistory || []).slice(-7).reduce((s: number, h: any) => s + Number(h.profit || 0), 0))}`} context="Last 7 days" />
                <StatCard label="Daily rate" value={`${(tierRate * 100).toFixed(2)}%`} tone="gold" context={`${tier} plan`} />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <DataCard title="Last 7 days" className="lg:col-span-2">
                  <div className="flex items-end justify-between gap-2" style={{ height: '120px' }}>
                    {(wallet.profitHistory || []).length > 0 ? (
                      (wallet.profitHistory || []).slice(-7).map((h: any, i: number) => {
                        const max = Math.max(...(wallet.profitHistory || []).slice(-7).map((x: any) => Number(x.profit || 0)), 1);
                        const pct = (Number(h.profit || 0) / max) * 100;
                        return (
                          <div key={i} className="flex flex-1 flex-col items-center gap-1">
                            <div className="w-full rounded-t bg-[var(--gold)]" style={{ height: `${pct}%`, minHeight: '2px' }} />
                            <span className="text-[10px] text-[var(--muted)]">{new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-[var(--muted)]">No profit history yet.</p>
                    )}
                  </div>
                </DataCard>

                <DataCard title="How profit is computed">
                  <div className="space-y-3 text-[13px] text-[var(--muted)]">
                    <p>Principal + platform credit = basis</p>
                    <p>$${money(principal)} + $${money(platformCredit)} = <span className="text-[var(--fg)]">$${money(principal + platformCredit)}</span></p>
                    <p>× {(tierRate * 100).toFixed(2)}% daily = <span className="text-[var(--profit)]">${money(todayTarget)}/day</span></p>
                    <p className="pt-3 border-t border-[var(--border)] text-[11px]">Profit accrues at UTC midnight. Withdrawals are automatic — no admin approval needed.</p>
                  </div>
                </DataCard>
              </div>

              <div className="mt-6">
                <DataCard title="Withdrawal history" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={(wallet.withdrawals || []).filter((w: any) => w.type === 'profit' || (!w.type && w.currency !== 'usdt_principal'))}
                      emptyText="No profit withdrawals yet."
                      columns={[
                        { key: 'createdAt', header: 'Date', render: (r: any) => (txnDate(r) ? new Date(txnDate(r)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—') },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => `$${money(Number(r.amount))}` },
                        { key: 'network', header: 'Network', render: (r: any) => (r.network || String(r.currency || '').replace(/^usdt/, '') || '—').toUpperCase() },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => <StatusPill tone={r.status === 'completed' || r.status === 'paid' ? 'green' : r.status === 'failed' || r.status === 'rejected' ? 'red' : 'gold'}>{r.status}</StatusPill> },
                      ]}
                    />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {tab === 'engine' && (
            <>
              <PageHeader crumbs={['Member', 'AI Engine']} title="AI trading engine" description="Automated algorithmic trading performance." id="tour-engine" />

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <StatCard label="Win rate" value="71.4%" context="Last 30 days" />
                <StatCard label="Open positions" value="14" context="$25,000 notional" />
                <StatCard label="Today's P&L" value="+$1,240" tone="profit" context="Across all tiers" />
                <StatCard label="Max drawdown" value="-4.2%" context="Guardrail active" />
              </div>

              <div className="mt-6">
                <DataCard title="Recent engine fills" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={[
                        { id: 'f1', time: '14:22', symbol: 'BTC', side: 'BUY', qty: 0.014, pnl: 12.4 },
                        { id: 'f2', time: '13:58', symbol: 'NVDA', side: 'SELL', qty: 3.2, pnl: 8.1 },
                        { id: 'f3', time: '12:31', symbol: 'ETH', side: 'BUY', qty: 0.22, pnl: -3.2 },
                        { id: 'f4', time: '11:05', symbol: 'XAU', side: 'BUY', qty: 1.1, pnl: 5.9 },
                        { id: 'f5', time: '09:44', symbol: 'AAPL', side: 'SELL', qty: 6.0, pnl: 4.3 },
                      ]}
                      columns={[
                        { key: 'time', header: 'Time' },
                        { key: 'symbol', header: 'Asset' },
                        { key: 'side', header: 'Side', render: (r: any) => <span className={r.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>{r.side}</span> },
                        { key: 'qty', header: 'Quantity', align: 'right' },
                        { key: 'pnl', header: 'P&L', align: 'right', render: (r: any) => <span className={r.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>{r.pnl >= 0 ? '+' : '-'}${money(Math.abs(r.pnl))}</span> },
                      ]}
                    />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {tab === 'referrals' && (
            <>
              <PageHeader crumbs={['Member', 'Referrals']} title="Referral network" description="Invite friends and earn 2.5% on their first deposit + 0.1% lifetime profit share." />

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <DataCard title="Your invite link" className="lg:col-span-2">
                  <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                    <input
                      readOnly
                      value={refCode?.link ? `${typeof window !== 'undefined' ? window.location.origin : ''}${refCode.link}` : '—'}
                      className="flex-1 bg-transparent text-[13px] text-[var(--fg)] outline-none"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(refCode?.link ? `${window.location.origin}${refCode.link}` : '');
                        setCopied(true); setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? 'Copied ✓' : 'Copy'}
                    </Button>
                  </div>
                  <p className="mt-3 text-[12px] text-[var(--muted)]">Share this link. You earn 2.5% of their first deposit + 0.1% of their daily profit for life.</p>
                </DataCard>

                <DataCard title="Referral stats">
                  <div className="space-y-3">
                    <StatInline label="Invited" value={(refCode?.referrals || []).length} />
                    <StatInline label="Funded" value={(refCode?.referrals || []).filter((m: any) => m.funded).length} />
                    <StatInline label="Lifetime earned" value={`$${money(referral?.totalEarned || 0)}`} tone="profit" />
                  </div>
                </DataCard>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <StatCard label="Total earned" value={`$${money(referral?.totalEarned || 0)}`} context="Lifetime referrals" />
                <StatCard label="Available" value={`$${money(referral?.availableBalance || 0)}`} tone="profit" context="Past 7-day hold" />
                <StatCard label="Pending" value={`$${money(referral?.pendingBalance || 0)}`} tone="gold" context="In 7-day hold" />
                <StatCard label="In review" value={`$${money(referral?.inReviewBalance || 0)}`} context="Admin processing" />
              </div>

              <div className="mt-6">
                <DataCard title="Referral earnings" padded={false} actions={
                  <Button variant="secondary" size="sm" onClick={() => setShowReferralWithdraw(true)} disabled={!referral?.availableBalance || referral.availableBalance <= 0}>
                    Request payout
                  </Button>
                }>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={referral?.earnings || []}
                      emptyText="No referral earnings yet."
                      columns={[
                        { key: 'earned_at', header: 'Date', render: (r: any) => (r.earned_at ? new Date(r.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—') },
                        { key: 'earning_type', header: 'Type', render: (r: any) => (r.earning_type === 'principal' ? 'First deposit' : 'Profit share') },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => `$${money(Number(r.amount))}` },
                        { key: 'available_at', header: 'Status', align: 'right', render: (r: any) => {
                          const isAvail = new Date(r.available_at) <= new Date();
                          return <StatusPill tone={isAvail ? 'green' : 'gold'}>{isAvail ? 'Available' : 'Hold'}</StatusPill>;
                        } },
                      ]}
                    />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {tab === 'settings' && (
            <>
              <PageHeader crumbs={['Member', 'Settings']} title="Account settings" description="Manage your profile, security, and preferences." />

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <DataCard title="Profile">
                  <div className="space-y-3">
                    <div><Label>Name</Label><p className="text-[var(--fg)]">{wallet.name || '—'}</p></div>
                    <div><Label>Email</Label><p className="text-[var(--fg)]">{wallet.email || '—'}</p></div>
                    <div><Label>Tier</Label><p className="text-[var(--fg)]">{tier.charAt(0).toUpperCase() + tier.slice(1)}</p></div>
                    <div><Label>Member since</Label><p className="text-[var(--fg)]">{wallet.depositAt ? new Date(wallet.depositAt).toLocaleDateString() : '—'}</p></div>
                  </div>
                </DataCard>

                <DataCard title="Security & agreements">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--fg)]">Two-factor authentication</span>
                      <Button variant="secondary" size="sm" disabled>{wallet.twoFactorEnabled ? 'Enabled' : 'Enable'}</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--fg)]">Trading agreement</span>
                      <Button variant="ghost" size="sm" onClick={() => setShowAgreement(true)}>View</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--fg)]">Trustpilot review</span>
                      <Button variant="ghost" size="sm" onClick={() => { setReviewTrigger('activeUser30Days'); setShowReview(true); }}>Leave review</Button>
                    </div>
                  </div>
                </DataCard>

                <DataCard title="Preferences">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--fg)]">Email notifications</span>
                      <span className="text-[12px] text-[var(--muted)]">Managed by support team</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--fg)]">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </DataCard>

                <DataCard title="Session">
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--muted)]">Sign out of your account.</p>
                    <Button variant="danger" className="w-full" onClick={handleLogout}>Sign out</Button>
                  </div>
                </DataCard>
              </div>
            </>
          )}
        </div>
      </main>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <ProfitWithdrawModal open={showProfitWithdraw} onClose={() => setShowProfitWithdraw(false)} availableProfit={availableProfit} onDone={loadData} />
      <PrincipalWithdrawModal open={showPrincipalWithdraw} onClose={() => setShowPrincipalWithdraw(false)} principal={principal} tier={tier} depositAt={wallet.depositAt} onDone={loadData} />
      <ReferralWithdrawModal open={showReferralWithdraw} onClose={() => setShowReferralWithdraw(false)} availableBalance={referral?.availableBalance || 0} onSuccess={loadData} />
      {showAgreement && <TradingAgreementModal userName={wallet.name} onAgree={() => { setShowAgreement(false); setMe((m: any) => (m ? { ...m, hasSignedAgreement: true } : m)); }} />}
      <ShareGate
        open={showWithdrawShare}
        title="You Made a Withdrawal"
        subtitle="Share your first profit withdrawal with the world. Choose one platform below."
        platforms={['instagram', 'facebook', 'whatsapp', 'x']}
        shareUrl={typeof window !== 'undefined' ? window.location.href : 'https://kingdomtradex.com'}
        shareText="I just withdrew profit from KingdomTradeX. Faith-driven AI trading works."
        mandatory={true}
        onShared={() => { setShowWithdrawShare(false); setReviewTrigger('firstWithdrawal'); setShowReview(true); }}
        secondaryAction={{ label: 'Leave a Trustpilot review', url: SOCIAL_URLS.trustpilot }}
      />
      <ReviewInvitationModal open={showReview} triggerType={reviewTrigger} onClose={() => setShowReview(false)} onInvited={() => setShowReview(false)} />
      <SpotlightTour steps={TOUR_STEPS} activeStep={tourStep} onComplete={completeTour} />
    </div>
  );
}
