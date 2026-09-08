'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WaitlistClient() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(1242);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/waitlist').then(r => r.json()).then(d => setCount(d.count)).catch(() => {});
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 34);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) { clearInterval(timer); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
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
        setCount(c => c + 1);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const faqs = [
    { q: 'When does the platform officially launch?', a: 'We are opening the doors to our first cohort of stewards in exactly 30 days. Waitlist members receive 48 hours of exclusive early access before the public launch.' },
    { q: 'Is my capital protected?', a: 'All trading involves risk. Our AI engine employs strict risk filtering and stop-loss guardrails, but profits are never guaranteed. You trade at your own risk.' },
    { q: 'How does the Pastor program work?', a: 'Approved pastors can invite their community and earn a configurable share of the trading profits their flock generates, creating a sustainable income stream for their ministry.' },
  ];

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = 'I just joined the KingdomTradeX waitlist. AI trading meets biblical stewardship. Secure your spot:';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="text-xl font-bold tracking-tight">KTX <span className="text-[var(--gold)]">KingdomTradeX</span></Link>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--fg)]">Login</Link>
          <Link href="/plans" className="text-sm text-[var(--gold)] hover:brightness-110">View Plans</Link>
        </div>
      </nav>

      <section className="relative px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
          Early Access Open
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Steward Your Wealth with <span className="text-[var(--gold)]">Divine Precision</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10">
          Join the exclusive early access list for KingdomTradeX. Where disciplined algorithmic trading meets biblical stewardship. Secure your spot before the public launch.
        </p>

        <div className="flex justify-center gap-4 md:gap-8 mb-12">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-2xl md:text-3xl font-bold tabular-nums text-[var(--fg)]">
                {value}
              </div>
              <span className="mt-2 text-xs uppercase tracking-widest text-[var(--muted)]">{unit}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] text-[var(--fg)] outline-none focus:border-[var(--gold)] transition"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 rounded-lg bg-[var(--gold)] text-black font-bold hover:brightness-110 transition disabled:opacity-50"
            >
              {status === 'loading' ? 'Securing...' : 'Secure My Spot'}
            </button>
          </div>
          {message && (
            <p className={`mt-3 text-sm font-medium ${status === 'success' ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}`}>
              {message}
            </p>
          )}
        </form>

        <p className="text-sm text-[var(--muted)]">
          Join <span className="font-bold text-[var(--fg)]">{count.toLocaleString()}</span> faithful stewards already waiting.
        </p>

        {status === 'success' && (
          <div className="mt-8 flex justify-center gap-4">
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm hover:border-[var(--gold)] transition">Share on X</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm hover:border-[var(--gold)] transition">Share on Facebook</a>
          </div>
        )}
      </section>

      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-[var(--bg-soft)] transition"
              >
                {faq.q}
                <span className="text-[var(--gold)]">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-[var(--muted)] text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-8 text-center text-sm text-[var(--muted)]">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/privacy" className="hover:text-[var(--fg)]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[var(--fg)]">Terms of Service</Link>
          <Link href="/team" className="hover:text-[var(--fg)]">About Us</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} KingdomTradeX. All rights reserved.</p>
      </footer>
    </div>
  );
}
