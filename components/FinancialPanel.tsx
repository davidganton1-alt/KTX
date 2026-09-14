'use client';

import { useCallback, useEffect, useState } from 'react';

type Wallet = {
  wallet_type: string;
  balance: number;
  total_received: number;
  total_sent: number;
  last_transaction_at: string | null;
};

type Withdrawal = {
  id: string;
  user_id: string;
  amount: string | number;
  net_amount: string | number;
  network: string;
  destination_address: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
  profiles: { name: string | null; email: string } | null;
};

// Admin treasury cockpit: 5 platform wallets, alerts, principal approvals,
// and the Engine->Hot ledger transfer recorded after the company's manual
// XMR->USDT conversion.
export function FinancialPanel() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [pending, setPending] = useState<Withdrawal[]>([]);
  const [awaiting, setAwaiting] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [xferAmount, setXferAmount] = useState('');
  const [xferBusy, setXferBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [wRes, pRes] = await Promise.all([
        fetch('/api/wallets/balances', { credentials: 'include' }),
        fetch('/api/admin/principal-approvals', { credentials: 'include' }),
      ]);
      if (wRes.ok) setWallets(((await wRes.json()).wallets || []) as Wallet[]);
      if (pRes.ok) {
        const rows = ((await pRes.json()).withdrawals || []) as Withdrawal[];
        setPending(rows.filter((r) => r.status === 'pending_approval'));
        setAwaiting(rows.filter((r) => r.status === 'awaiting_engine_transfer'));
      }
    } catch {
      /* keep last values */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  async function handleAction(id: string, action: 'approve' | 'reject' | 'mark_paid') {
    setBusyId(id);
    setError('');
    setMsg('');
    try {
      const res = await fetch('/api/admin/principal-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ withdrawal_id: id, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `${action} failed`);
        return;
      }
      setMsg(data.message || 'Done');
      load();
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleTransfer() {
    setXferBusy(true);
    setError('');
    setMsg('');
    try {
      const res = await fetch('/api/admin/engine-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: Number(xferAmount) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || 'Transfer failed');
        return;
      }
      setMsg(`Moved $${Number(xferAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} Engine → Hot.`);
      setXferAmount('');
      load();
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setXferBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-[var(--muted)]">Loading financial data…</p>;

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const bal = (t: string) => Number(wallets.find((w) => w.wallet_type === t)?.balance || 0);

  const Card = ({ w }: { w: Wallet }) => (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">{w.wallet_type}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--fg)]">${fmt(Number(w.balance))}</p>
      <p className="mt-1 text-[10px] text-[var(--muted)]">in ${fmt(Number(w.total_received))} · out ${fmt(Number(w.total_sent))}</p>
    </div>
  );

  const Row = ({ w, kind }: { w: Withdrawal; kind: 'pending' | 'awaiting' }) => (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--fg)]">
            {w.profiles?.name || 'Unknown'} ({w.profiles?.email || w.user_id})
          </p>
          <p className="text-xs text-[var(--muted)]">{new Date(w.created_at).toLocaleString()}</p>
          {w.admin_notes && <p className="mt-1 text-xs italic text-[var(--muted)]">{w.admin_notes}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold tabular-nums text-[var(--fg)]">${fmt(Number(w.amount))}</p>
          <p className="text-sm text-[#34D399]">Net ${fmt(Number(w.net_amount))}</p>
          <p className="text-xs uppercase text-[var(--muted)]">{w.network}</p>
        </div>
      </div>
      <p className="mb-3 break-all rounded-lg bg-[var(--card)] px-3 py-1.5 font-mono text-xs text-[var(--muted)]">
        {w.destination_address}
      </p>
      {kind === 'pending' ? (
        <div className="flex gap-2">
          <button onClick={() => handleAction(w.id, 'approve')} disabled={busyId === w.id}
            className="flex-1 rounded-lg bg-[#34D399] px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50">
            {busyId === w.id ? 'Processing…' : 'Approve (reserve from Hot)'}
          </button>
          <button onClick={() => handleAction(w.id, 'reject')} disabled={busyId === w.id}
            className="flex-1 rounded-lg border border-[#F87171]/40 px-4 py-2 text-sm font-bold text-[#F87171] transition hover:bg-[#F87171]/10 disabled:opacity-50">
            Reject (return principal)
          </button>
        </div>
      ) : (
        <button onClick={() => handleAction(w.id, 'mark_paid')} disabled={busyId === w.id}
          className="w-full rounded-lg bg-[var(--gold)] px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50">
          {busyId === w.id ? 'Processing…' : "Mark Paid (transfer done in custody)"}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Platform Wallets (USDT)</h3>
        <div className="grid gap-4 md:grid-cols-5">
          {wallets.map((w) => <Card key={w.wallet_type} w={w} />)}
        </div>
      </div>

      {(bal('hot') < 1000 || bal('referral') < 500 || awaiting.length > 0) && (
        <div>
          <h3 className="mb-3 text-lg font-bold text-[var(--fg)]">Alerts</h3>
          <div className="space-y-2">
            {bal('hot') < 1000 && (
              <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3">
                <p className="text-sm font-bold text-[var(--gold)]">⚠ Hot Wallet low (${fmt(bal('hot'))})</p>
                <p className="text-xs text-[var(--muted)]">Below $1,000 — consider an Engine→Hot transfer to cover payouts.</p>
              </div>
            )}
            {bal('referral') < 500 && (
              <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3">
                <p className="text-sm font-bold text-[var(--gold)]">⚠ Referral Wallet low (${fmt(bal('referral'))})</p>
                <p className="text-xs text-[var(--muted)]">Below $500 — top up from Hot via a transfer.</p>
              </div>
            )}
            {awaiting.length > 0 && (
              <div className="rounded-lg border border-[#22D3EE]/40 bg-[#22D3EE]/10 p-3">
                <p className="text-sm font-bold text-[#22D3EE]">ℹ {awaiting.length} withdrawal(s) awaiting custody</p>
                <p className="text-xs text-[var(--muted)]">
                  Reserved ${fmt(awaiting.reduce((s, w) => s + Number(w.net_amount), 0))} from Hot — convert XMR→USDT in the
                  Engine wallet, send to the Hot wallet address, then record it below and mark each request paid.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="rounded-lg border border-[#F87171]/40 bg-[#F87171]/10 p-3 text-sm text-[#F87171]">{error}</p>}
      {msg && <p className="rounded-lg border border-[#34D399]/40 bg-[#34D399]/10 p-3 text-sm text-[#34D399]">{msg}</p>}

      <div>
        <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Pending Principal Withdrawals</h3>
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No pending principal withdrawal requests.</p>
        ) : (
          <div className="space-y-4">{pending.map((w) => <Row key={w.id} w={w} kind="pending" />)}</div>
        )}
      </div>

      {awaiting.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Approved — Awaiting Engine→Hot Transfer</h3>
          <div className="space-y-4">{awaiting.map((w) => <Row key={w.id} w={w} kind="awaiting" />)}</div>
        </div>
      )}

      <div>
        <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Record Engine→Hot Transfer</h3>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
          <p className="text-sm text-[var(--muted)]">
            After you convert XMR from the (external, self-custodied) Engine wallet into USDT and fund the Hot wallet,
            record the amount here so the internal ledgers match custody. Engine balance: <b className="text-[var(--fg)]">${fmt(bal('engine'))}</b> · Hot: <b className="text-[var(--fg)]">${fmt(bal('hot'))}</b>
          </p>
          <div className="mt-4 flex gap-3">
            <input type="number" inputMode="decimal" min={0.01} max={bal('engine')} value={xferAmount}
              onChange={(e) => setXferAmount(e.target.value)} placeholder="Amount moved in custody (USDT)"
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
            <button onClick={handleTransfer} disabled={xferBusy || !xferAmount || Number(xferAmount) <= 0}
              className="rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-40">
              {xferBusy ? 'Moving…' : 'Record Transfer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
