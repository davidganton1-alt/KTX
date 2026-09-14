'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Standalone referral/commission withdrawal request modal (admin-reviewed).
// Extracted from ReferralDisplay so preview-styled tabs can trigger it
// without mounting the legacy panel. Same API contract: POST /api/referral/withdraw.
export function ReferralWithdrawModal({
  open,
  availableBalance,
  onClose,
  onSuccess,
  title = 'Withdraw Referral Earnings',
}: {
  open: boolean;
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
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
            role="dialog" aria-modal="true" aria-label={title}
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
                <h3 className="text-lg font-bold text-[var(--fg)]">{title}</h3>
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
