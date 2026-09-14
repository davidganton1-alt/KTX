'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Net = 'trc20' | 'bep20' | 'erc20';

const NETWORKS: { id: Net; label: string; fee: string; coin: string }[] = [
  { id: 'trc20', label: 'TRC20 (TRON)', fee: '~$1', coin: 'USDT' },
  { id: 'bep20', label: 'BEP20 (BSC)', fee: '~$0.30', coin: 'USDT' },
  { id: 'erc20', label: 'ERC20 (Ethereum)', fee: '~$3-8', coin: 'USDT' },
];

export function ProfitWithdrawModal({
  open,
  onClose,
  availableProfit,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  availableProfit: number;
  onDone?: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<Net>('trc20');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payoutId, setPayoutId] = useState('');

  function reset() {
    setAmount('');
    setAddress('');
    setError('');
    setPayoutId('');
    setLoading(false);
  }

  async function handleWithdraw() {
    setError('');
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setError('Enter a valid amount.'); return; }
    if (amt > availableProfit) { setError(`Amount exceeds available profit ($${availableProfit.toFixed(2)}).`); return; }
    if (amt < 1) { setError('Minimum withdrawal is $1.'); return; }
    if (!address.trim()) { setError('Enter your wallet address.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/profit/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: amt, network, address: address.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error || 'Withdrawal failed. Try again.');
        return;
      }
      setPayoutId(String(data.payout_id || data.withdrawal_id || ''));
      window.dispatchEvent(new Event('ktx:deposits-changed'));
      if (data.firstWithdrawal) window.dispatchEvent(new Event('ktx:first-withdrawal'));
      onDone?.();
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { reset(); onClose(); }}
          />
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Withdraw profit"
          >
            <button
              onClick={() => { reset(); onClose(); }}
              className="absolute right-4 top-4 text-[var(--muted)] transition hover:text-[var(--fg)]"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {payoutId ? (
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#34D399]/15">
                  <svg className="h-8 w-8 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[var(--fg)]">Withdrawal submitted</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT is on its way via {network.toUpperCase()}.
                </p>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">ref: {payoutId}</p>
                <button
                  onClick={() => { reset(); onClose(); }}
                  className="mt-5 w-full rounded-xl bg-[var(--gold)] py-2.5 text-sm font-bold text-black transition hover:brightness-110"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-[var(--fg)]">Withdraw Profit</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Available: <b className="text-[#34D399]">${availableProfit.toFixed(2)}</b> · sent automatically, no admin wait.
                </p>

                <div className="mt-5">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Network</label>
                  <div className="grid grid-cols-3 gap-2">
                    {NETWORKS.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setNetwork(n.id)}
                        className={`rounded-xl border p-3 text-center transition ${
                          network === n.id
                            ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                            : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--gold)]/40'
                        }`}
                      >
                        <p className="text-xs font-bold">{n.label}</p>
                        <p className="mt-1 text-[10px] opacity-80">fee {n.fee}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Amount (USD)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0.01}
                      max={availableProfit}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                    />
                    <button
                      onClick={() => setAmount(String(Math.floor(availableProfit * 100) / 100))}
                      className="rounded-xl border border-[var(--border)] px-4 text-xs font-bold text-[var(--gold)] transition hover:bg-[var(--gold)]/10"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Your {network.toUpperCase()} USDT address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={network === 'trc20' ? 'T…' : network === 'bep20' ? '0x…' : '0x…'}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  />
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Make sure your wallet uses the <b className="text-[var(--fg)]">{network.toUpperCase()}</b> network —
                    sending to the wrong network can lose funds permanently.
                  </p>
                </div>

                {error && <p className="mt-3 text-sm text-[#F87171]">{error}</p>}

                <button
                  onClick={handleWithdraw}
                  disabled={loading || !address.trim() || !amount || availableProfit <= 0}
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-40"
                >
                  {loading ? 'Sending…' : `Withdraw $${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
