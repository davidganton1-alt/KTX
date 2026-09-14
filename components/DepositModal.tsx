'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

type Step = 'input' | 'payment' | 'success';

type PaymentData = {
  deposit_id: string;
  payment_id: string;
  deposit_address: string;
  pay_amount: number;
  amount: number;
  currency: string;
  tier: string;
  referral_rate: number;
  status: string;
};

const DONE = ['confirming', 'confirmed', 'sending', 'processing_split', 'finished'];

function tierFor(amount: number): { id: string; label: string; cls: string } | null {
  if (amount >= 5000 && amount <= 15000) return { id: 'ambassador', label: 'Ambassador', cls: 'text-[var(--gold)]' };
  if (amount >= 1000) return { id: 'steward', label: 'Steward', cls: 'text-[var(--accent,#A855F7)]' };
  if (amount >= 100) return { id: 'faithful', label: 'Faithful', cls: 'text-emerald-400' };
  return null;
}

const statusLabel: Record<string, string> = {
  waiting: 'Waiting for payment',
  confirming: 'Confirming on blockchain',
  confirmed: 'Confirmed',
  sending: 'Arriving in custody',
  partially_paid: 'Partially paid',
  finished: 'Completed',
  failed: 'Failed',
  expired: 'Expired',
  processing_split: 'Crediting your plan',
};

export function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('input');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [status, setStatus] = useState('waiting');
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!open) {
      // reset after close animation
      const t = setTimeout(() => {
        setStep('input'); setAmount(''); setError(''); setPayment(null); setStatus('waiting'); setCopied(false); setLoading(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const refreshHistory = useCallback(() => {
    window.dispatchEvent(new Event('ktx:deposits-changed'));
  }, []);

  // polling while on the payment step
  useEffect(() => {
    if (step !== 'payment' || !payment) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/deposits/status?paymentId=${encodeURIComponent(payment.payment_id)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setStatus(data.status);
        if (DONE.includes(data.status)) {
          setStep('success');
          refreshHistory();
          if (data.status === 'finished' || data.status === 'confirmed') {
            setTimeout(() => onClose(), 2600);
          }
        }
      } catch {
        /* transient poll errors are ignored; next tick retries */
      }
    };
    tick();
    pollRef.current = setInterval(tick, 5000);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, payment, onClose, refreshHistory]);

  async function handleCreate() {
    setError('');
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 100) { setError('Minimum deposit is $100.'); return; }
    if (amt > 15000) { setError('Maximum deposit is $15,000.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/deposits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Could not start the deposit. Try again.');
        return;
      }
      setPayment(data);
      setStatus(data.status || 'waiting');
      setStep('payment');
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  function copyAddress() {
    if (!payment?.deposit_address) return;
    navigator.clipboard.writeText(payment.deposit_address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const tier = tierFor(Number(amount) || 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Deposit funds"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-[var(--muted)] transition hover:text-[var(--fg)]"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* ── STEP 1: amount ── */}
            {step === 'input' && (
              <div>
                <h3 className="text-lg font-bold text-[var(--fg)]">Deposit Funds</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Pay in USDT (TRC20). Your plan activates as soon as the network confirms.
                </p>
                <div className="mt-5">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={100}
                    max={15000}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                    autoFocus
                  />
                  <div className="mt-3 flex gap-2">
                    {[100, 500, 1000, 5000].map((a) => (
                      <button
                        key={a}
                        onClick={() => setAmount(String(a))}
                        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
                      >
                        ${a.toLocaleString('en-US')}
                      </button>
                    ))}
                  </div>
                  {Number(amount) > 0 && (
                    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-4 text-sm">
                      {tier ? (
                        <p className="text-[var(--muted)]">
                          Tier: <b className={tier.cls}>{tier.label}</b>{' '}
                          <span className="text-xs">
                            ({tier.id === 'ambassador' ? '0.75%' : tier.id === 'steward' ? '0.50%' : '0.25%'} daily target)
                          </span>
                        </p>
                      ) : (
                        <p className="text-[var(--loss,#F87171)]">
                          {Number(amount) > 15000
                            ? 'Maximum deposit is $15,000.'
                            : 'Minimum deposit is $100 (Faithful tier).'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {error && <p className="mt-3 text-sm text-[var(--loss,#F87171)]">{error}</p>}
                <button
                  onClick={handleCreate}
                  disabled={loading || !tier}
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-40"
                >
                  {loading ? 'Generating address…' : 'Continue to payment'}
                </button>
              </div>
            )}

            {/* ── STEP 2: pay ── */}
            {step === 'payment' && payment && (
              <div className="text-center">
                <h3 className="text-lg font-bold text-[var(--fg)]">Send USDT (TRC20)</h3>

                {/* network warning banner */}
                <div className="mt-4 rounded-xl border border-[#F87171]/50 bg-[#F87171]/10 p-4 text-left">
                  <p className="flex items-start gap-2 text-sm font-bold text-[#F87171]">
                    <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                    <span>
                      Send ONLY USDT on the TRC20 (TRON) network. Sending ERC20 or BEP20 will
                      result in permanent loss of funds.
                    </span>
                  </p>
                </div>

                <div className="mt-5 flex justify-center rounded-2xl bg-white p-4">
                  <QRCodeSVG value={payment.deposit_address} size={200} level="M" includeMargin={false} />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Send exactly
                </p>
                <p className="text-2xl font-extrabold tabular-nums text-[var(--fg)]">
                  {payment.pay_amount} USDT
                </p>
                <p className="text-xs text-[var(--muted)]">≈ ${payment.amount.toLocaleString('en-US')} USD · {tierFor(payment.amount)?.label} tier</p>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                  <code className="min-w-0 flex-1 truncate text-left font-mono text-xs text-[var(--fg)]" title={payment.deposit_address}>
                    {payment.deposit_address}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="shrink-0 rounded-lg border border-[var(--gold)]/40 px-3 py-1.5 text-xs font-bold text-[var(--gold)] transition hover:bg-[var(--gold)]/10"
                  >
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gold)] opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--gold)]" />
                  </span>
                  <span className="text-[var(--muted)]">{statusLabel[status] || status}… checking every 5s</span>
                </div>

                <button
                  onClick={onClose}
                  className="mt-5 w-full rounded-xl border border-[var(--border)] py-2.5 text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
                >
                  Close (payment keeps tracking)
                </button>
              </div>
            )}

            {/* ── STEP 3: success ── */}
            {step === 'success' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#34D399]/15"
                >
                  <svg className="h-10 w-10 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="mt-5 text-xl font-bold text-[var(--fg)]">Payment detected</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {statusLabel[status]} — your plan activates as soon as the deposit is confirmed.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
