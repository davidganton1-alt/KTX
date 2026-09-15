'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, type NavSection } from '@/components/design-system/Sidebar';
import { PageHeader } from '@/components/design-system/PageHeader';
import { StatCard, StatInline } from '@/components/design-system/StatCard';
import { DataCard } from '@/components/design-system/DataCard';
import { DataTable, StatusPill } from '@/components/design-system/DataTable';
import { Button } from '@/components/design-system/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdminChat } from '@/components/AdminChat';
import { TradingAgreementModal } from '@/components/TradingAgreementModal';

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SECTIONS: NavSection[] = [
  {
    heading: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4' },
      { id: 'treasury', label: 'Treasury', icon: 'M4 7h16M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M4 7l2-3h12l2 3M9 12h6' },
      { id: 'withdrawals', label: 'Withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9', badge: 0 },
      { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
      { id: 'pastors', label: 'Pastors', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', badge: 0 },
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

const WALLET_ROLES: Record<string, string> = {
  deposit: 'pass-through',
  hot: 'payouts',
  engine: 'XMR custody · manual',
  payout: 'profit withdrawals',
  referral: '7-day holds',
};

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [principalQueue, setPrincipalQueue] = useState<any[]>([]);
  const [referralQueue, setReferralQueue] = useState<any[]>([]);
  const [data, setData] = useState<any>(null); // /api/admin/data (users, pastors, apps, announcements)
  const [me, setMe] = useState<any>(null);
  const [showAgreement, setShowAgreement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [flashMsg, setFlashMsg] = useState('');
  const [transferAmt, setTransferAmt] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [newCreds, setNewCreds] = useState<{ email: string; password: string; name: string } | null>(null);

  const flash = (t: string) => { setFlashMsg(t); setTimeout(() => setFlashMsg(''), 4000); };

  const loadData = useCallback(async () => {
    try {
      const [wRes, princRes, refRes, dataRes, meRes] = await Promise.all([
        fetch('/api/wallets/balances', { credentials: 'include' }),
        fetch('/api/admin/principal-approvals', { credentials: 'include' }),
        fetch('/api/admin/referral-approvals', { credentials: 'include' }),
        fetch('/api/admin/data', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/auth/me', { credentials: 'include' }),
      ]);
      if (wRes.status === 401 || meRes.status === 401) { router.push('/login'); return; }
      if (wRes.status === 403) { router.push('/console'); return; }
      if (wRes.ok) setWallets((await wRes.json()).wallets || []);
      if (princRes.ok) setPrincipalQueue((await princRes.json()).withdrawals || []);
      if (refRes.ok) setReferralQueue((await refRes.json()).withdrawals || []);
      if (dataRes.ok) setData(await dataRes.json());
      if (meRes.ok) {
        const meData = await meRes.json();
        setMe(meData);
        if (meData?.role && !meData.hasSignedAgreement) setShowAgreement(true);
      }
    } catch (e) {
      console.error('Load failed', e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  // ── money actions (bound to the real Phase A-E admin endpoints) ──
  async function actOnWithdrawal(kind: 'principal' | 'referral', id: string, action: string) {
    const key = `${kind}-${id}-${action}`;
    setBusy(key);
    try {
      const res = await fetch(kind === 'principal' ? '/api/admin/principal-approvals' : '/api/admin/referral-approvals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ withdrawal_id: id, action }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) flash(d.error || 'Action failed.');
      else flash(action === 'approve' ? 'Approved.' : action === 'reject' ? 'Rejected — funds returned.' : action === 'mark_paid' ? 'Marked paid.' : 'Done.');
      loadData();
    } catch { flash('Network error.'); }
    setBusy(null);
  }

  async function recordTransfer() {
    const amt = Number(transferAmt);
    if (!Number.isFinite(amt) || amt <= 0) { flash('Enter a valid amount.'); return; }
    setBusy('transfer');
    try {
      const res = await fetch('/api/admin/engine-transfer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ amount: amt }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) flash(d.error || 'Transfer failed.');
      else { flash('Engine → Hot transfer recorded.'); setTransferAmt(''); }
      loadData();
    } catch { flash('Network error.'); }
    setBusy(null);
  }

  async function decidePastor(id: string, status: 'approved' | 'rejected', app?: any) {
    setBusy(`pastor-${id}`);
    try {
      const res = await fetch('/api/admin/pastor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, name: app?.name, email: app?.email }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) flash(d.error || 'Failed.');
      else if (status === 'approved' && d.pastor?.credentials) setNewCreds({ email: d.pastor.credentials.email, password: d.pastor.credentials.password, name: app?.name ?? d.pastor.name });
      else flash(`Pastor ${status}.`);
      loadData();
    } catch { flash('Network error.'); }
    setBusy(null);
  }

  async function postAnnouncement() {
    if (!annTitle.trim()) { flash('Title is required.'); return; }
    setBusy('ann-post');
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: annTitle.trim(), body: annBody.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) flash(d.error || 'Failed.');
      else { flash('Announcement published.'); setAnnTitle(''); setAnnBody(''); }
      loadData();
    } catch { flash('Network error.'); }
    setBusy(null);
  }

  async function deleteAnnouncement(id: string) {
    setBusy(`ann-del-${id}`);
    try {
      const res = await fetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) flash('Failed to delete.');
      else flash('Announcement deleted.');
      loadData();
    } catch { flash('Network error.'); }
    setBusy(null);
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-[var(--muted)]">Loading...</p></div>;
  }

  const totalCustody = wallets.reduce((s, w) => s + Number(w.balance || 0), 0);
  const hotBalance = Number(wallets.find((w) => w.wallet_type === 'hot')?.balance || 0);
  const engineBalance = Number(wallets.find((w) => w.wallet_type === 'engine')?.balance || 0);
  const referralBalance = Number(wallets.find((w) => w.wallet_type === 'referral')?.balance || 0);
  const payoutBalance = Number(wallets.find((w) => w.wallet_type === 'payout')?.balance || 0);
  const pendingCount = principalQueue.length + referralQueue.length;
  const awaitingTransfer = principalQueue.filter((w) => w.status === 'awaiting_engine_transfer');
  const users = data?.users ?? [];
  const pastors = data?.pastors ?? [];
  const applications = data?.pastorApplications ?? [];
  const announcements = data?.announcements ?? [];
  const pendingApps = applications.filter((a: any) => a.status === 'pending').length;

  const queues = [
    ...principalQueue.map((w: any) => ({ ...w, kind: 'Principal', act: 'principal' })),
    ...referralQueue.map((w: any) => ({ ...w, kind: 'Referral', act: 'referral' })),
  ];

  const sections = SECTIONS.map((s) => ({
    ...s,
    items: s.items.map((it) =>
      it.id === 'withdrawals' ? { ...it, badge: pendingCount }
      : it.id === 'pastors' ? { ...it, badge: pendingApps }
      : it),
  }));

  const sidebar = (
    <Sidebar brand="KingdomTradeX" brandSub="Control Room" sections={sections} active={tab}
      onSelect={(id) => { setTab(id); setSidebarOpen(false); }} footer={<ThemeToggle />} />
  );

  return (
    <div className="flex min-h-screen">
      {/* desktop rail */}
      <div id="tour-sidebar" className="hidden lg:block">{sidebar}</div>
      {/* mobile drawer */}
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
            <span className="text-[14px] font-medium text-[var(--fg)] lg:hidden">KTX Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] uppercase tracking-[0.05em] text-[var(--gold)]">Admin</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </header>

        <div key={tab} className="ds-fade-in mx-auto max-w-[1240px] p-8">

          {/* ═══ DASHBOARD ═══ */}
          {tab === 'dashboard' && (
            <>
              <PageHeader
                crumbs={['Admin', 'Dashboard']}
                title="Control Room"
                description={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · ${pendingCount === 0 && awaitingTransfer.length === 0 ? 'all systems nominal' : `${pendingCount} pending · ${awaitingTransfer.length} awaiting transfer`}`}
                actions={<Button variant="primary" onClick={() => setTab('treasury')}>Record Engine → Hot</Button>}
              />

              {flashMsg && <div className="mt-6 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-5 py-3 text-center text-[13px] text-[var(--gold)]">{flashMsg}</div>}

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <StatCard label="Total in custody" value={`$${money(totalCustody)}`} context="5 platform wallets · USDT" onClick={() => setTab('treasury')} />
                <StatCard label="Members" value={`${users.length}`} context={`${users.filter((u: any) => Number(u.deposited || 0) > 0).length} funded plans`} onClick={() => setTab('users')} />
                <StatCard label="AUM (principal)" value={`$${money(users.reduce((s: number, u: any) => s + Number(u.deposited || 0), 0))}`} context={`${users.filter((u: any) => Number(u.deposited || 0) > 0).length} active plans`} />
                <StatCard label="Owed today" value={`$${money(payoutBalance + referralBalance)}`} tone="gold" context="Payout + referral wallets" onClick={() => setTab('withdrawals')} />
              </div>

              {(awaitingTransfer.length > 0 || hotBalance < 1000) && (
                <div className="mt-4 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] px-5 py-3">
                  <p className="text-[12px] text-[var(--muted)]">
                    <span className="font-medium text-[var(--gold)]">Attention:</span>
                    {awaitingTransfer.length > 0 && ` ${awaitingTransfer.length} principal withdrawal${awaitingTransfer.length > 1 ? 's' : ''} await the Engine → Hot custody transfer before payout.`}
                    {awaitingTransfer.length > 0 && hotBalance < 1000 && ' '}
                    {hotBalance < 1000 && ' Hot wallet is below the $1,000 safety floor.'}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <DataCard title="Queue needing you" subtitle={`${principalQueue.length} withdrawals · ${pendingApps} pastor applications`} className="lg:col-span-2" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={queues.slice(0, 8)}
                      pageSize={4}
                      emptyText="Nothing waiting."
                      columns={[
                        { key: 'user_id', header: 'Member', render: (r: any) => r.profiles?.name || String(r.user_id).slice(0, 8) + '…' },
                        { key: 'kind', header: 'Type' },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => `$${money(Number(r.amount))}` },
                        { key: 'net_amount', header: 'Net', align: 'right', render: (r: any) => (r.net_amount != null ? `$${money(Number(r.net_amount))}` : '—') },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => (r.status === 'pending_approval' ? <StatusPill tone="gold">Review</StatusPill> : <StatusPill tone="cyan">Awaiting transfer</StatusPill>) },
                        { key: 'act', header: '', align: 'right', render: (r: any) => r.status === 'pending_approval' ? (
                          <span className="inline-flex gap-1.5">
                            <Button variant="primary" size="sm" disabled={busy === `${r.act}-${r.id}-approve`} onClick={() => actOnWithdrawal(r.act, r.id, 'approve')}>Approve</Button>
                            <Button variant="danger" size="sm" disabled={busy === `${r.act}-${r.id}-reject`} onClick={() => actOnWithdrawal(r.act, r.id, 'reject')}>Reject</Button>
                          </span>
                        ) : (
                          <Button variant="secondary" size="sm" disabled={busy === `principal-${r.id}-mark_paid`} onClick={() => actOnWithdrawal('principal', r.id, 'mark_paid')}>Mark paid</Button>
                        ) },
                      ]}
                    />
                  </div>
                </DataCard>

                <div className="space-y-6">
                  <DataCard title="Flow today">
                    <div className="space-y-2.5">
                      <StatInline label="In custody" value={`$${money(totalCustody)}`} />
                      <StatInline label="Hot wallet" value={`$${money(hotBalance)}`} tone={hotBalance < 1000 ? 'gold' : 'default'} />
                      <StatInline label="Engine (XMR)" value={`$${money(engineBalance)}`} tone="gold" />
                      <StatInline label="Payout wallet" value={`$${money(payoutBalance)}`} tone="profit" />
                      <StatInline label="Referral wallet" value={`$${money(referralBalance)}`} tone="profit" />
                    </div>
                  </DataCard>
                  <DataCard title="Live chat">
                    <p className="text-[13px] text-[var(--fg)]">Admin Chat · bottom of Live Chat tab</p>
                    <Button variant="ghost" size="sm" className="mt-1 px-0" onClick={() => setTab('chat')}>Open Live Chat →</Button>
                  </DataCard>
                </div>
              </div>
            </>
          )}

          {/* ═══ TREASURY ═══ */}
          {tab === 'treasury' && (
            <>
              <PageHeader crumbs={['Admin', 'Treasury']} title="Treasury" description="Ledger view of custody. Engine is external (XMR cold wallet) — record transfers here after they happen." />
              <div className="mt-6 grid gap-4 md:grid-cols-5">
                {wallets.map((w) => (
                  <StatCard key={w.wallet_type} label={w.wallet_type.charAt(0).toUpperCase() + w.wallet_type.slice(1)} value={`$${money(Number(w.balance || 0))}`} context={WALLET_ROLES[w.wallet_type] || '—'} tone={w.wallet_type === 'engine' ? 'gold' : 'default'} />
                ))}
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <DataCard title="Wallet ledger" className="lg:col-span-2" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable rows={wallets} columns={[
                      { key: 'wallet_type', header: 'Wallet', render: (r: any) => r.wallet_type.charAt(0).toUpperCase() + r.wallet_type.slice(1) },
                      { key: 'role', header: 'Role', render: (r: any) => <span className="text-[12px] text-[var(--muted)]">{WALLET_ROLES[r.wallet_type] || '—'}</span> },
                      { key: 'total_received', header: 'In', align: 'right', render: (r: any) => `$${money(Number(r.total_received || 0))}` },
                      { key: 'total_sent', header: 'Out', align: 'right', render: (r: any) => `$${money(Number(r.total_sent || 0))}` },
                      { key: 'balance', header: 'Balance', align: 'right', render: (r: any) => <span className="font-medium">${money(Number(r.balance || 0))}</span> },
                    ]} />
                  </div>
                </DataCard>
                <DataCard title="Record transfer" subtitle="Engine → Hot after XMR→USDT conversion" interactive>
                  <input type="number" min="0" step="0.01" value={transferAmt} onChange={(e) => setTransferAmt(e.target.value)} placeholder="Amount (USDT)"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                  <Button variant="primary" className="mt-3 w-full" disabled={busy === 'transfer' || !transferAmt} onClick={recordTransfer}>
                    {busy === 'transfer' ? 'Recording…' : 'Record transfer'}
                  </Button>
                  <p className="mt-3 text-[11px] leading-[1.6] text-[var(--muted)]">Engine: ${money(engineBalance)} · Hot: ${money(hotBalance)}. The move updates both ledgers atomically.</p>
                </DataCard>
              </div>
              {awaitingTransfer.length > 0 && (
                <div className="mt-6">
                  <DataCard title="Awaiting the custody transfer" padded={false}>
                    <div className="px-2 pb-2">
                      <DataTable rows={awaitingTransfer} columns={[
                        { key: 'user_id', header: 'Member', render: (r: any) => r.profiles?.name || String(r.user_id).slice(0, 8) + '…' },
                        { key: 'net_amount', header: 'Net', align: 'right', render: (r: any) => `$${money(Number(r.net_amount))}` },
                        { key: 'destination_address', header: 'Destination', render: (r: any) => <span className="font-mono text-[11px]">{r.destination_address}</span> },
                        { key: 'act', header: '', align: 'right', render: (r: any) => <Button variant="secondary" size="sm" disabled={busy === `principal-${r.id}-mark_paid`} onClick={() => actOnWithdrawal('principal', r.id, 'mark_paid')}>Mark paid</Button> },
                      ]} />
                    </div>
                  </DataCard>
                </div>
              )}
            </>
          )}

          {/* ═══ WITHDRAWALS ═══ */}
          {tab === 'withdrawals' && (
            <>
              <PageHeader crumbs={['Admin', 'Withdrawals']} title="Withdrawals" description="Principal and referral payouts need your approval. Profit payouts are automatic and shown here for the record." />
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <StatCard label="Pending approval" value={`${queues.filter((q) => q.status === 'pending_approval').length} requests`} tone="gold" context={`$${money(queues.filter((q) => q.status === 'pending_approval').reduce((s, q) => s + Number(q.amount || 0), 0))} total`} />
                <StatCard label="Awaiting transfer" value={`${awaitingTransfer.length}`} tone="gold" context={`$${money(awaitingTransfer.reduce((s, q) => s + Number(q.net_amount || 0), 0))}`} />
                <StatCard label="Principal queue" value={`${principalQueue.length}`} />
                <StatCard label="Referral queue" value={`${referralQueue.length}`} />
              </div>
              <div className="mt-6">
                <DataCard title="Queue" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={queues}
                      pageSize={8}
                      emptyText="No pending withdrawals."
                      columns={[
                        { key: 'user_id', header: 'Member', render: (r: any) => r.profiles?.name || String(r.user_id).slice(0, 8) + '…' },
                        { key: 'kind', header: 'Type' },
                        { key: 'amount', header: 'Amount', align: 'right', render: (r: any) => `$${money(Number(r.amount))}` },
                        { key: 'net_amount', header: 'Net', align: 'right', render: (r: any) => (r.net_amount != null ? `$${money(Number(r.net_amount))}` : '—') },
                        { key: 'fee', header: 'Fee', align: 'right', render: (r: any) => <span className="text-[12px] text-[var(--muted)]">{r.net_amount != null && Number(r.net_amount) < Number(r.amount) ? `${(100 - (Number(r.net_amount) / Number(r.amount)) * 100).toFixed(0)}% early` : '—'}</span> },
                        { key: 'created_at', header: 'Requested', align: 'right', render: (r: any) => <span className="text-[12px] text-[var(--muted)]">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span> },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => (r.status === 'pending_approval' ? <StatusPill tone="gold">Review</StatusPill> : <StatusPill tone="cyan">Transfer</StatusPill>) },
                        { key: 'act', header: '', align: 'right', render: (r: any) => r.status === 'pending_approval' ? (
                          <span className="inline-flex gap-1.5">
                            <Button variant="primary" size="sm" disabled={busy === `${r.act}-${r.id}-approve`} onClick={() => actOnWithdrawal(r.act, r.id, 'approve')}>Approve</Button>
                            <Button variant="danger" size="sm" disabled={busy === `${r.act}-${r.id}-reject`} onClick={() => actOnWithdrawal(r.act, r.id, 'reject')}>Reject</Button>
                          </span>
                        ) : (
                          <Button variant="secondary" size="sm" disabled={busy === `principal-${r.id}-mark_paid`} onClick={() => actOnWithdrawal('principal', r.id, 'mark_paid')}>Mark paid</Button>
                        ) },
                      ]}
                    />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {/* ═══ USERS ═══ */}
          {tab === 'users' && (
            <>
              <PageHeader crumbs={['Admin', 'Users']} title="Users" description={`${users.length} members · ${users.filter((u: any) => Number(u.deposited || 0) > 0).length} funded plans`}
                actions={<input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search…" className="w-56 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13px] text-[var(--fg)] outline-none focus:border-[var(--gold)]" />} />
              <div className="mt-6">
                <DataCard padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={users.filter((u: any) => !userSearch || `${u.name} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase()))}
                      pageSize={10}
                      emptyText="No members match."
                      columns={[
                        { key: 'name', header: 'Member', render: (r: any) => <span className="font-medium">{r.name}</span> },
                        { key: 'email', header: 'Email', render: (r: any) => <span className="text-[12px] text-[var(--muted)]">{r.email}</span> },
                        { key: 'tier', header: 'Plan', render: (r: any) => (r.tier && r.tier !== 'none' ? r.tier.charAt(0).toUpperCase() + r.tier.slice(1) : '—') },
                        { key: 'deposited', header: 'Principal', align: 'right', render: (r: any) => `$${money(Number(r.deposited || 0))}` },
                        { key: 'pastorName', header: 'Pastor', render: (r: any) => r.pastorName || '—' },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => (r.suspended ? <StatusPill tone="red">Suspended</StatusPill> : Number(r.deposited || 0) > 0 ? <StatusPill tone="green">Active</StatusPill> : <StatusPill tone="muted">Unfunded</StatusPill>) },
                      ]}
                    />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {/* ═══ PASTORS ═══ */}
          {tab === 'pastors' && (
            <>
              <PageHeader crumbs={['Admin', 'Pastors']} title="Pastors" description="Applications, roster and performance. Approval mints their login and flock link." />
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <StatCard label="Applications" value={`${pendingApps} pending`} tone="gold" />
                <StatCard label="Active pastors" value={`${pastors.length}`} context={`${users.filter((u: any) => u.pastorName).length} members in flocks`} />
                <StatCard label="Pastor earnings (30d)" value="—" context="Report not built yet" />
              </div>
              <div className="mt-6">
                <DataCard title="Applications" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={applications}
                      pageSize={6}
                      emptyText="No applications."
                      columns={[
                        { key: 'name', header: 'Pastor' },
                        { key: 'ministry', header: 'Ministry', render: (r: any) => r.ministry || r.church || '—' },
                        { key: 'email', header: 'Email', render: (r: any) => <span className="text-[12px] text-[var(--muted)]">{r.email}</span> },
                        { key: 'status', header: 'Status', align: 'right', render: (r: any) => (r.status === 'pending' ? <StatusPill tone="gold">Pending</StatusPill> : r.status === 'approved' ? <StatusPill tone="green">Approved</StatusPill> : <StatusPill tone="muted">{r.status}</StatusPill>) },
                        { key: 'act', header: '', align: 'right', render: (r: any) => r.status === 'pending' ? (
                          <span className="inline-flex gap-1.5">
                            <Button variant="primary" size="sm" disabled={busy === `pastor-${r.id}`} onClick={() => decidePastor(r.id, 'approved', r)}>Approve</Button>
                            <Button variant="danger" size="sm" disabled={busy === `pastor-${r.id}`} onClick={() => decidePastor(r.id, 'rejected')}>Reject</Button>
                          </span>
                        ) : <span className="text-[12px] text-[var(--muted)]">—</span> },
                      ]}
                    />
                  </div>
                </DataCard>
              </div>
              <div className="mt-6">
                <DataCard title="Roster" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable
                      rows={pastors}
                      pageSize={6}
                      emptyText="No approved pastors."
                      columns={[
                        { key: 'name', header: 'Pastor' },
                        { key: 'ministry', header: 'Ministry' },
                        { key: 'referrals', header: 'Flock', align: 'right', render: (r: any) => r.referrals ?? 0 },
                        { key: 'earnedTotal', header: 'Earned', align: 'right', render: (r: any) => `$${money(Number(r.earnedTotal ?? r.earned_total ?? 0))}` },
                        { key: 'shareRate', header: 'Share', align: 'right', render: (r: any) => `${r.shareRate ?? 5}%` },
                      ]}
                    />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {/* ═══ AI ENGINE (preview placeholder — trading happens behind the scenes) ═══ */}
          {tab === 'engine' && (
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
                      { id: 'g1', tier: 'Ambassador', desks: '—', target: '0.75%', hit: '96%', pnl: 1247.5 },
                      { id: 'g2', tier: 'Steward', desks: '—', target: '0.50%', hit: '94%', pnl: 412.8 },
                      { id: 'g3', tier: 'Faithful', desks: '—', target: '0.25%', hit: '97%', pnl: 84.1 },
                    ]} columns={[
                      { key: 'tier', header: 'Tier' },
                      { key: 'desks', header: 'Active desks', align: 'right' },
                      { key: 'target', header: 'Daily target', align: 'right' },
                      { key: 'hit', header: 'Target hit (30d)', align: 'right', render: (r: any) => <span className="text-[var(--profit)]">{r.hit}</span> },
                      { key: 'pnl', header: '30d P&L', align: 'right', render: (r: any) => `$${money(r.pnl)}` },
                    ]} />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {/* ═══ ANNOUNCEMENTS ═══ */}
          {tab === 'announcements' && (
            <>
              <PageHeader crumbs={['Admin', 'Announcements']} title="Announcements" description="Posted to every member and pastor panel." />
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <DataCard title="New announcement" className="lg:col-span-1" interactive>
                  <input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Title"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                  <textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} placeholder="Body…" rows={4}
                    className="mt-3 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                  <Button variant="primary" className="mt-3 w-full" disabled={busy === 'ann-post'} onClick={postAnnouncement}>{busy === 'ann-post' ? 'Publishing…' : 'Publish'}</Button>
                </DataCard>
                <DataCard title="Recent" className="lg:col-span-2" padded={false}>
                  <div className="px-2 pb-2">
                    <DataTable rows={announcements} pageSize={8} emptyText="No announcements yet." columns={[
                      { key: 'title', header: 'Title' },
                      { key: 'createdBy', header: 'By', align: 'right', render: (r: any) => r.createdBy || r.author || 'Admin' },
                      { key: 'createdAt', header: 'Posted', align: 'right', render: (r: any) => <span className="text-[12px] text-[var(--muted)]">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span> },
                      { key: 'act', header: '', align: 'right', render: (r: any) => <Button variant="ghost" size="sm" disabled={busy === `ann-del-${r.id}`} onClick={() => deleteAnnouncement(r.id)}>Delete</Button> },
                    ]} />
                  </div>
                </DataCard>
              </div>
            </>
          )}

          {/* ═══ LIVE CHAT (real AdminChat panel) ═══ */}
          {tab === 'chat' && (
            <>
              <PageHeader crumbs={['Admin', 'Live Chat']} title="Live Chat" description="Visitor conversations in real time." />
              <div className="mt-6">
                <AdminChat me={me} />
              </div>
            </>
          )}

        </div>
      </main>

      {/* Credentials modal (pastor approval mints login — preserved from legacy admin) */}
      {newCreds && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={() => setNewCreds(null)}>
          <div className="ds-card w-full max-w-sm rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-medium text-[var(--fg)]">Pastor account created</h3>
            <p className="mt-1 text-[12px] text-[var(--muted)]">{newCreds.name} — send these to them. This is the only time the password is shown.</p>
            <div className="mt-4 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 font-mono text-[13px] text-[var(--gold)]">
              <p>{newCreds.email}</p>
              <p>{newCreds.password}</p>
            </div>
            <Button variant="primary" className="mt-4 w-full" onClick={async () => { try { await navigator.clipboard.writeText(`${newCreds.email} / ${newCreds.password}`); } catch {} setNewCreds(null); }}>Copy & close</Button>
          </div>
        </div>
      )}

      {showAgreement && <TradingAgreementModal userName={me?.name} onAgree={() => { setShowAgreement(false); setMe((m: any) => (m ? { ...m, hasSignedAgreement: true } : m)); }} />}
    </div>
  );
}
