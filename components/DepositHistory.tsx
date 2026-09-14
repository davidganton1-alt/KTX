'use client';

import { useCallback, useEffect, useState } from 'react';

type DepositRow = {
  id: string;
  amount: number;
  pay_amount: number | null;
  currency: string;
  status: string;
  tier: string | null;
  createdAt: number;
  confirmedAt: number | null;
};

const badge: Record<string, string> = {
  waiting: 'border-[var(--border)] text-[var(--muted)]',
  confirming: 'border-[var(--gold)]/40 text-[var(--gold)]',
  processing_split: 'border-[var(--gold)]/40 text-[var(--gold)]',
  confirmed: 'border-[#34D399]/40 text-[#34D399]',
  sending: 'border-[#34D399]/40 text-[#34D399]',
  finished: 'border-[#34D399]/40 text-[#34D399]',
  partially_paid: 'border-orange-400/40 text-orange-400',
  failed: 'border-[#F87171]/40 text-[#F87171]',
  expired: 'border-[#F87171]/40 text-[#F87171]',
};

const tierBadge: Record<string, string> = {
  faithful: 'text-emerald-400',
  steward: 'text-[#A855F7]',
  ambassador: 'text-[var(--gold)]',
};

export function DepositHistory() {
  const [rows, setRows] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/deposits/history', { credentials: 'include' });
      if (!res.ok) { setRows([]); return; }
      const data = await res.json();
      setRows(data.deposits || []);
    } catch {
      /* keep last list */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // refresh whenever a deposit changes elsewhere on the page
    window.addEventListener('ktx:deposits-changed', load);
    return () => window.removeEventListener('ktx:deposits-changed', load);
  }, [load]);

  if (loading) return null;
  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
      <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Crypto Deposits</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Amount</th>
              <th className="px-2 py-2">Paid (USDT)</th>
              <th className="px-2 py-2">Tier</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-b border-[var(--border)]">
                <td className="px-2 py-2 text-[var(--muted)]">
                  {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-2 py-2 font-bold text-[var(--fg)]">${d.amount.toLocaleString('en-US')}</td>
                <td className="px-2 py-2 text-[var(--muted)]">{d.pay_amount != null ? d.pay_amount.toFixed(2) : '—'}</td>
                <td className={`px-2 py-2 font-bold capitalize ${tierBadge[d.tier || ''] || 'text-[var(--muted)]'}`}>
                  {d.tier || '—'}
                </td>
                <td className="px-2 py-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${badge[d.status] || badge.waiting}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
