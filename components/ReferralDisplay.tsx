'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Earning = {
  id: string;
  earning_type: 'principal' | 'profit';
  amount: number;
  earned_at: string;
  available_at: string;
  notes: string | null;
};

type BalanceData = {
  totalEarned: number;
  availableBalance: number;
  pendingBalance: number;
  inReviewBalance: number;
  principalCount: number;
  profitCount: number;
  earnings: Earning[];
};

export function ReferralDisplay() {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/referral/balance', { cache: 'no-store', credentials: 'include' });
      if (!res.ok) return;
      setData(await res.json());
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

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
        <p className="text-sm text-[var(--muted)]">Loading referral earnings…</p>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const daysUntil = (iso: string) =>
    Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
          <p className="text-sm text-[var(--muted)]">Total Referral Earned</p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-[var(--fg)]">${fmt(data?.totalEarned ?? 0)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {data?.principalCount ?? 0} principal bonus · {data?.profitCount ?? 0} profit shares
          </p>
        </div>
        <div className="rounded-xl border border-[#34D399]/30 bg-[#34D399]/10 p-6">
          <p className="text-sm text-[var(--muted)]">Available to Withdraw</p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-[#34D399]">${fmt(data?.availableBalance ?? 0)}</p>
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={(data?.availableBalance ?? 0) <= 0}
            className="mt-3 rounded-lg bg-gradient-to-r from-[var(--gold)] to-amber-500 px-4 py-1.5 text-xs font-bold text-black transition hover:brightness-110 disabled:opacity-40"
          >
            Withdraw Referral Earnings
          </button>
          {(data?.inReviewBalance ?? 0) > 0 && (
            <p className="mt-2 text-xs text-[var(--muted)]">${fmt(data!.inReviewBalance)} in review</p>
          )}
        </div>
        <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-6">
          <p className="text-sm text-[var(--muted)]">Pending (7-day hold)</p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-[var(--gold)]">${fmt(data?.pendingBalance ?? 0)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Unlocks automatically 7 days after each earning.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
        <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Referral Earnings History</h3>
        {!data?.earnings?.length ? (
          <p className="text-sm text-[var(--muted)]">
            No referral earnings yet. Share your invite link — you earn 2.5% of each referral's first deposit and a
            share of their daily profit, forever.
          </p>
        ) : (
          <div className="space-y-2">
            {data.earnings.slice(0, 20).map((e) => {
              const ready = new Date(e.available_at) <= new Date();
              return (
                <div key={e.id} className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--fg)]">
                      ${fmt(Number(e.amount))} · {e.earning_type === 'principal' ? 'First-deposit bonus' : 'Profit share'}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(e.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {e.notes ? ` · ${e.notes}` : ''}
                    </p>
                  </div>
                  {ready ? (
                    <span className="shrink-0 rounded-full border border-[#34D399]/40 px-2 py-0.5 text-[10px] font-bold uppercase text-[#34D399]">Available</span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-[var(--gold)]/40 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--gold)]">
                      {daysUntil(e.available_at)}d hold
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ReferralWithdrawModal
        open={showWithdraw}
        availableBalance={data?.availableBalance ?? 0}
        onClose={() => setShowWithdraw(false)}
        onSuccess={load}
      />
    </div>
  );
}

function ReferralWithdrawModal({
  open,
  availableBalance,
  onClose,
  onSuccess,
}: {
  open: boolean;
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<'trc20' | 'bep20' | 'erc20'>('trc20');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleWithdraw() {
    setError('');
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setError('Enter a valid amount.'); return; }
    if (amt > availableBalance) { setError(`Amount exceeds available balance ($${availableBalance.toFixed(2)}).`); return; }
    if (!address.trim()) { setError('Enter your wallet address.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/referral/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: amt, network, address: address.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Withdrawal failed.'); return; }
      setSuccess(true);
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setSuccess(false); setAmount(''); setAddress(''); setError('');
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-6 shadow-2xl"
            role="dialog" aria-modal="true" aria-label="Withdraw referral earnings"
          >
            {success ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)]/15 text-3xl">⏳</div>
                <h3 className="mt-4 text-lg font-bold text-[var(--fg)]">Request submitted</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Referral withdrawals are reviewed by an admin (12–24h). You'll see the status update here and in your
                  notifications once it's processed.
                </p>
                <button onClick={close} className="mt-5 w-full rounded-xl bg-[var(--gold)] py-2.5 text-sm font-bold text-black transition hover:brightness-110">
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-[var(--fg)]">Withdraw Referral Earnings</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Available: <b className="text-[#34D399]">${availableBalance.toFixed(2)}</b> · sent after admin approval.
                </p>

                <div className="mt-5">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Network</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['trc20', 'bep20', 'erc20'] as const).map((n) => (
                      <button key={n} onClick={() => setNetwork(n)}
                        className={`rounded-xl border p-3 text-center transition ${network === n ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
                        <p className="text-xs font-bold">{n.toUpperCase()}</p>
                        <p className="mt-1 text-[10px] opacity-80">{n === 'trc20' ? '~$1 fee' : n === 'bep20' ? '~$0.30 fee' : '~$3-8 fee'}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Amount (USD)</label>
                  <div className="flex gap-3">
                    <input type="number" inputMode="decimal" min={0.01} max={availableBalance} value={amount}
                      onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)]" />
                    <button onClick={() => setAmount(String(Math.floor(availableBalance * 100) / 100))}
                      className="rounded-xl border border-[var(--border)] px-4 text-xs font-bold text-[var(--gold)] hover:bg-[var(--gold)]/10">MAX</button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Your {network.toUpperCase()} USDT address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder={network === 'trc20' ? 'T…' : '0x…'}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)]" />
                </div>

                {error && <p className="mt-3 text-sm text-[#F87171]">{error}</p>}

                <button onClick={handleWithdraw} disabled={loading || !address.trim() || !amount}
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-40">
                  {loading ? 'Submitting…' : 'Request Withdrawal'}
                </button>
                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  Admin approval required (12–24h). Network fees are deducted at payout.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
