'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RESEARCH_URL = 'https://github.com/davidganton1-alt/KTX';
const LAUNCH_DATE = new Date('2026-10-08T00:00:00Z');

export default function WaitlistClient() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.className;
    root.classList.remove('theme-day');
    root.classList.add('theme-night');
    return () => {
      root.className = prev;
    };
  }, []);

  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((d) => setCount(d.count || 0))
      .catch(() => setCount(1242));
  }, []);

  useEffect(() => {
    if (count === 0) return;
    const duration = 1800;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.floor(eased * count));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count]);

  useEffect(() => {
    const update = () => {
      const distance = LAUNCH_DATE.getTime() - Date.now();
      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        setCount((c) => c + 1);
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = 'Something big is coming. I just secured my spot on the KingdomTradeX waitlist.';

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]" style={{ background: 'var(--gold)' }} />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--purple)' }} />
        <div className="absolute bottom-0 -right-40 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--cyan)' }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--gold)' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--gold)' }} />
          </span>
          Something Big Is Coming
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
        >
          Faith Driven Trading.
          <br />
          <span
            style={{
              backgroundImage: 'linear-gradient(120deg, var(--gold), var(--purple))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Kingdom Level Precision.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg md:text-xl"
          style={{ color: 'var(--muted)' }}
        >
          We are building an AI trading engine rooted in biblical stewardship and disciplined risk management. Doors open soon. Be first in line.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 max-w-xl rounded-2xl border px-6 py-4"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <p className="text-sm italic" style={{ color: 'var(--fg)' }}>
            "Whoever can be trusted with very little can also be trusted with much."
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
            Luke 16:10
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex gap-3 md:gap-5"
        >
          {timeUnits.map((u) => (
            <div
              key={u.label}
              className="flex w-20 flex-col items-center rounded-2xl border py-4 md:w-24"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <span className="text-3xl font-extrabold tabular-nums md:text-4xl" style={{ color: 'var(--fg)' }}>
                {String(u.value).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                {u.label}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 w-full max-w-md"
        >
          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-xl border px-5 py-4 text-sm outline-none transition focus:border-[var(--gold)]"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)', color: 'var(--fg)' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-xl px-7 py-4 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
                style={{ backgroundColor: 'var(--gold)' }}
              >
                {status === 'loading' ? 'Securing Spot...' : 'Secure My Spot'}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border px-6 py-6" style={{ borderColor: 'var(--profit)', backgroundColor: 'var(--card)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--profit)' }}>
                You are on the list.
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                {message}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border px-4 py-2 text-xs font-bold transition hover:border-[var(--gold)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
                >
                  Share on X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border px-4 py-2 text-xs font-bold transition hover:border-[var(--gold)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
                >
                  Share on Facebook
                </a>
              </div>
            </div>
          )}
          {status === 'error' && (
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--loss)' }}>
              {message}
            </p>
          )}
          {status !== 'success' && (
            <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
              Join free. No spam ever. Trading involves real risk and profits are not guaranteed.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 flex items-center gap-3"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: 'var(--profit)' }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--profit)' }} />
          </span>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            <span className="text-lg font-extrabold tabular-nums" style={{ color: 'var(--fg)' }}>
              {displayCount.toLocaleString()}
            </span>{' '}
            stewards have already secured their spot
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-12 w-full max-w-xl rounded-2xl border p-6"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
            Transparent By Design
          </p>
          <h3 className="mt-2 text-xl font-bold" style={{ color: 'var(--fg)' }}>
            Read Our Trading Research
          </h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Explore the AI methodology, market analysis, and risk frameworks behind KingdomTradeX. We publish our approach openly so you can evaluate it before you commit.
          </p>
          <a
            href={RESEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
            style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View Research on GitHub
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--muted)' }}
        >
          <span>MSB Licensed</span>
          <span>LLC Registered</span>
          <span>SOC 2 Infrastructure</span>
          <span>Non-Custodial</span>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t px-6 py-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Trading involves real risk and profits are never guaranteed. Target rates are illustrations, not promises.
        </p>
        <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
          © {new Date().getFullYear()} KingdomTradeX. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
