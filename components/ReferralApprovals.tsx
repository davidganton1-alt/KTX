'use client';

import { useCallback, useEffect, useState } from 'react';

type Withdrawal = {
  id: string;
  user_id: string;
  amount: string | number;
  network: string;
  destination_address: string;
  status: string;
  created_at: string;
  profiles: { name: string | null; email: string } | null;
};

// Admin: approve/reject referral withdrawal requests (funds move here).
export function ReferralApprovals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/referral-approvals', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch {
      /* keep last list */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setError('');
    setBusyId(id);
    try {
      const res = await fetch('/api/admin/referral-approvals', {
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
      load();
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-sm text-[var(--muted)]">Loading referral approvals…</p>;

  return (
    <div className="space-y-4">
      {error && <p className="rounded-xl border border-[#F87171]/40 bg-[#F87171]/10 p-3 text-sm text-[#F87171]">{error}</p>}
      {withdrawals.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No pending referral withdrawals.</p>
      ) : (
        withdrawals.map((w) => (
          <div key={w.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--fg)]">
                  {w.profiles?.name || 'Unknown'} ({w.profiles?.email || w.user_id})
                </p>
                <p className="text-xs text-[var(--muted)]">{new Date(w.created_at).toLocaleString()}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-extrabold tabular-nums text-[var(--fg)]">${Number(w.amount).toFixed(2)}</p>
                <p className="text-xs uppercase text-[var(--muted)]">{w.network}</p>
              </div>
            </div>
            <p className="mb-4 break-all rounded-lg bg-[var(--card)] px-3 py-2 font-mono text-xs text-[var(--muted)]">
              {w.destination_address}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(w.id, 'approve')}
                disabled={busyId === w.id}
                className="flex-1 rounded-lg bg-[#34D399] px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {busyId === w.id ? 'Processing…' : 'Approve & Send'}
              </button>
              <button
                onClick={() => handleAction(w.id, 'reject')}
                disabled={busyId === w.id}
                className="flex-1 rounded-lg border border-[#F87171]/40 px-4 py-2 text-sm font-bold text-[#F87171] transition hover:bg-[#F87171]/10 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
