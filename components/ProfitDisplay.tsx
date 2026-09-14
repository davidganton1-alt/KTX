'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProfitWithdrawModal } from '@/components/ProfitWithdrawModal';

type ProfitState = {
  accumulatedProfit: number;
  availableProfit: number;
  platformCredit: number;
  lastProfitAccrualAt: string | null;
  tierRate: number | null;
};

export function ProfitDisplay() {
  const [state, setState] = useState<ProfitState | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [accruing, setAccruing] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/state', { cache: 'no-store', credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setState({
        accumulatedProfit: Number(data.accumulatedProfit || 0),
        availableProfit: Number(data.availableProfit || 0),
        platformCredit: Number(data.platformCredit || 0),
        lastProfitAccrualAt: data.lastProfitAccrualAt || null,
        tierRate: data.tierRate != null ? Number(data.tierRate) : null,
      });
    } catch {
      /* keep last values */
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('ktx:deposits-changed', load);
    return () => window.removeEventListener('ktx:deposits-changed', load);
  }, [load]);

  async function accrueNow() {
    if (accruing) return;
    setAccruing(true);
    setMsg('');
    try {
      const res = await fetch('/api/profit/accrue', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.result?.profitEarned > 0) {
        setMsg(`+${data.result.profitEarned.toFixed(4)} profit accrued`);
      } else if (data.result?.error) {
        setMsg(data.result.error);
      } else {
        setMsg('Already up to date for today.');
      }
      load();
    } catch (e: any) {
      setMsg(e.message || 'Accrual failed.');
    } finally {
      setAccruing(false);
    }
  }

  if (!state) return null;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--fg)]">Profit Earnings</h3>
        {state.tierRate != null && (
          <span className="rounded-full border border-[#34D399]/40 px-3 py-1 text-xs font-bold text-[#34D399]">
            {(state.tierRate * 100).toFixed(2)}% / day
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Daily returns accrue on your principal plus platform credit.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-4">
          <p className="text-xs text-[var(--muted)]">Accumulated Profit</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[var(--fg)]">
            ${state.accumulatedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </p>
        </div>
        <div className="rounded-xl border border-[#34D399]/25 bg-[#34D399]/10 p-4">
          <p className="text-xs text-[var(--muted)]">Available to Withdraw</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#34D399]">
            ${state.availableProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-4">
          <p className="text-xs text-[var(--muted)]">Platform Credit</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[var(--gold)]">
            ${state.platformCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[10px] text-[var(--muted)]">earns profit · not withdrawable</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowWithdraw(true)}
          disabled={state.availableProfit <= 0}
          className="rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-40"
        >
          Withdraw Profit
        </button>
        <button
          onClick={accrueNow}
          disabled={accruing}
          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-bold text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-40"
          title="Runs the daily accrual for your account now"
        >
          {accruing ? 'Accruing…' : 'Accrue Now'}
        </button>
        {state.lastProfitAccrualAt && (
          <span className="text-xs text-[var(--muted)]">last accrual: {fmtDate(state.lastProfitAccrualAt)}</span>
        )}
      </div>
      {msg && <p className="mt-3 text-xs text-[var(--gold)]">{msg}</p>}

      <ProfitWithdrawModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        availableProfit={state.availableProfit}
        onDone={load}
      />
    </div>
  );
}
