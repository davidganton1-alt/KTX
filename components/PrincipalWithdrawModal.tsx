'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function PrincipalWithdrawModal({
  open,
  onClose,
  principal,
  tier,
  depositAt,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  principal: number;
  tier: string;
  depositAt: string | null;
  onDone?: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<'trc20' | 'bep20' | 'erc20'>('trc20');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  // holding window per tier (6/9/12 months from first deposit)
  const holdingMonths = tier === 'ambassador' ? 12 : tier === 'steward' ? 9 : 6;
  const depositDate = depositAt ? new Date(depositAt) : null;
  const holdingEndDate = depositDate ? new Date(depositDate.getTime()) : null;
  if (holdingEndDate) holdingEndDate.setMonth(holdingEndDate.getMonth() + holdingMonths);
  const inHoldingPeriod = !!(holdingEndDate && new Date() < holdingEndDate);
  const daysUntilHoldEnd = holdingEndDate
    ? Math.max(0, Math.ceil((holdingEndDate.getTime() - Date.now()) / 86400000))
    : 0;

  function reset() {
    setAmount('');
    setAddress('');
    setError('');
    setResult(null);
    setLoading(false);
  }

  function close() {
    reset();
    onClose();
  }

  async function handleWithdraw() {
    setError('');
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setError('Enter a valid amount.'); return; }
    if (amt > principal) { setError(`Amount exceeds principal ($${principal.toFixed(2)}).`); return; }
    if (!address.trim()) { setError('Enter your wallet address.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw-principal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: amt, network, address: address.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Withdrawal failed.'); return; }
      setResult(data);
      onDone?.();
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  const previewFee = inHoldingPeriod ? 0.5 : 0;

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
            role="dialog" aria-modal="true" aria-label="Withdraw principal"
          >
            <button onClick={close} className="absolute right-4 top-4 text-[var(--muted)] transition hover:text-[var(--fg)]" aria-label="Close">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {result ? (
              <div className="py-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)]/15 text-3xl">⏳</div>
                <h3 className="mt-4 text-lg font-bold text-[var(--fg)]">Request submitted</h3>
                <div className="mx-auto mt-4 max-w-xs space-y-1 text-left text-sm text-[var(--muted)]">
                  <p>Amount: <b className="text-[var(--fg)]">${Number(result.amount).toFixed(2)}</b></p>
                  <p>Early exit fee: <b className="text-[var(--fg)]">{result.fee}%</b></p>
                  <p>You receive: <b className="text-[#34D399]">${Number(result.net_amount).toFixed(2)}</b></p>
                  <p>Status: <b className="text-[var(--fg)]">awaiting admin approval (12-24h)</b></p>
                </div>
                <button onClick={close} className="mt-5 w-full rounded-xl bg-[var(--gold)] py-2.5 text-sm font-bold text-black transition hover:brightness-110">
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-[var(--fg)]">Withdraw Principal</h3>

                {inHoldingPeriod ? (
                  <div className="mt-4 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-4">
                    <p className="text-sm font-bold text-[var(--gold)]">⚠ Early withdrawal</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {daysUntilHoldEnd} days left in your {holdingMonths}-month holding period. Leaving early keeps a
                      50% fee — you would receive 50% of what you request. Your daily profit is never affected.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-[#34D399]/40 bg-[#34D399]/10 p-4">
                    <p className="text-sm font-bold text-[#34D399]">✓ Holding period complete</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Full principal returns, no fee.</p>
                  </div>
                )}

                <div className="mt-5">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Amount (USD)</label>
                  <div className="flex gap-3">
                    <input type="number" inputMode="decimal" min={0.01} max={principal} value={amount}
                      onChange={(e) => setAmount(e.target.value)} placeholder={`Max: ${principal.toFixed(2)}`}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)]" />
                    <button onClick={() => setAmount(String(Math.floor(principal * 100) / 100))}
                      className="rounded-xl border border-[var(--border)] px-4 text-xs font-bold text-[var(--gold)] hover:bg-[var(--gold)]/10">MAX</button>
                  </div>
                  {amount && Number(amount) > 0 && (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Fee: ${(Number(amount) * previewFee).toFixed(2)} · You receive: ${(Number(amount) * (1 - previewFee)).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Network</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['trc20', 'bep20', 'erc20'] as const).map((net) => (
                      <button key={net} onClick={() => setNetwork(net)}
                        className={`rounded-xl border p-3 text-center transition ${network === net ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
                        <p className="text-xs font-bold">{net.toUpperCase()}</p>
                        <p className="mt-1 text-[10px] opacity-80">{net === 'trc20' ? '~$1 fee' : net === 'bep20' ? '~$0.30 fee' : '~$3-8 fee'}</p>
                      </button>
                    ))}
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
                  Admin approval within 12-24h. Funds arrive from the Hot Wallet.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
