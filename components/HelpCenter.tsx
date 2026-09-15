'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { DataCard } from '@/components/design-system/DataCard';
import { Button } from '@/components/design-system/Button';
import { Label } from '@/components/design-system/Typography';

type Faq = { id: string; category: string; q: string; a: string };

const CATEGORIES = [
  { id: 'start', label: 'Getting started', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'deposits', label: 'Deposits', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 'withdrawals', label: 'Withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9' },
  { id: 'profit', label: 'Profit & tiers', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { id: 'referrals', label: 'Referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'partners', label: 'Pastors & creators', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const FAQS: Faq[] = [
  { id: 'f1', category: 'start', q: 'How do I create an account?', a: 'Click "Get started", enter your name and email, verify your email, then sign the Trading Agreement from your dashboard. Your account is active immediately; your plan activates with your first deposit.' },
  { id: 'f2', category: 'start', q: 'What are the plan tiers?', a: 'Faithful ($100–$999) targets 0.25%/day with a 6-month holding period. Steward ($1,000–$4,999) targets 0.50%/day with 9 months. Ambassador ($5,000–$15,000) targets 0.75%/day with 12 months. Rates are design targets, not guarantees.' },
  { id: 'f3', category: 'start', q: 'What is platform credit?', a: 'Where offered, platform credit is a promotional balance that earns daily profit alongside your principal from day one. The credit itself is never withdrawable — only the profit it generates is yours to withdraw.' },
  { id: 'f4', category: 'deposits', q: 'How do I make a deposit?', a: 'In your dashboard open Wallet → Make a deposit, enter an amount, and send the exact USDT amount to the address and QR code shown. Your deposit is credited automatically after blockchain confirmations.' },
  { id: 'f5', category: 'deposits', q: 'Which networks are supported?', a: 'USDT on TRC20 (≈$1 fee), BEP20 (≈$0.30), and ERC20 ($3–8). Always send on the network shown on your deposit screen. Sending on the wrong network causes permanent loss of funds — double-check before sending.' },
  { id: 'f6', category: 'deposits', q: 'How long does a deposit take?', a: 'Usually minutes. Once the network confirms the transaction, our webhook credits your account automatically and you receive a confirmation email. Track status under Wallet → Deposit history.' },
  { id: 'f7', category: 'deposits', q: 'What are the deposit limits?', a: 'Minimum $100 (Faithful tier). Maximum $15,000 total per account. Deposits above the cap are rejected at creation.' },
  { id: 'f8', category: 'withdrawals', q: 'How do I withdraw profit?', a: 'Wallet → Withdraw profit. Profit withdrawals are automatic: no admin approval, no platform fee. You receive the full amount minus only the blockchain network fee shown at confirmation.' },
  { id: 'f9', category: 'withdrawals', q: 'How do I withdraw principal?', a: 'Wallet → Withdraw principal. Requests are reviewed by an admin within 12–24 hours. After your holding period ends you receive 100% of principal. Before it ends, a 50% Liquidity Provision Fee applies and you receive the remaining half plus all accrued profit.' },
  { id: 'f10', category: 'withdrawals', q: 'Why is there a 50% early-exit fee?', a: 'It is a pre-agreed liquidated damages clause: removing capital early forces the engine to unwind long-term positions at unfavorable prices and refill shared liquidity pools. Your accrued profit is never penalized and stays withdrawable throughout the hold.' },
  { id: 'f11', category: 'withdrawals', q: 'How do referral withdrawals work?', a: 'Each referral earning matures after a 7-day anti-fraud hold. Matured earnings can be requested under Referrals → Request payout; requests are reviewed by an admin within 12–24 hours.' },
  { id: 'f12', category: 'profit', q: 'When does profit accrue?', a: 'Once per day at UTC midnight, calculated as (principal + platform credit) × your tier rate, and credited to your accumulated profit ledger. You can watch it grow on your dashboard.' },
  { id: 'f13', category: 'profit', q: 'Are returns guaranteed?', a: 'No. Daily rates are design targets, not interest and not promises. Markets are volatile and losses are possible. Read the Trading Agreement & Risk Disclosure before depositing.' },
  { id: 'f14', category: 'profit', q: 'Can I upgrade my tier later?', a: 'Yes. An additional deposit that crosses a tier boundary upgrades your plan, and the holding period restarts from the upgrade date on your new total principal.' },
  { id: 'f15', category: 'referrals', q: 'How does the referral program work?', a: 'Share your invite link. You earn a one-time bonus on the referred member\'s first deposit — 5% for approved Pastors/Creators, 2.5% for members — plus 0.1% of their daily profit for as long as they hold a plan.' },
  { id: 'f16', category: 'referrals', q: 'When can I withdraw referral earnings?', a: 'Each earning is locked for 7 days (anti-fraud hold), then becomes available. Available earnings can be requested for payout and are reviewed by an admin within 12–24 hours.' },
  { id: 'f17', category: 'security', q: 'How do I keep my account safe?', a: 'Use a unique strong password, enable two-factor authentication in Settings, and watch for new sign-in alert emails. We will never ask for your password, seed phrase, or private keys — anyone who does is impersonating us.' },
  { id: 'f18', category: 'security', q: 'I forgot my password. What now?', a: 'On the login screen click "Forgot password?", enter your email, and use the secure link we send (valid 24 hours, single use). You will receive a confirmation email once the password changes.' },
  { id: 'f19', category: 'security', q: 'Where is my money held?', a: 'Operational funds sit in custodial payment infrastructure under API-controlled payouts; the trading engine\'s reserve is self-custodied by the company offline. Your withdrawals are paid from platform wallets after the checks described in each flow.' },
  { id: 'f20', category: 'partners', q: 'How do I become a Pastor or Creator?', a: 'Apply from the site with your ministry or brand details and platform handle. Applications are reviewed within about 48 hours. Approved partners get a dedicated dashboard and the 5% first-deposit commission rate.' },
  { id: 'f21', category: 'partners', q: 'How are partner commissions paid?', a: '5% of each referred member\'s first deposit (one-time) plus 0.1% of their daily profit for life. Commissions follow the same 7-day hold and admin-reviewed payout flow as member referrals.' },
  { id: 'f22', category: 'partners', q: 'How fast is support?', a: '12–24 hours, answered by a real person. For urgent account-security matters, put the word SECURITY in your message subject and you are moved to the front of the queue.' },
];

export function HelpCenter() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [ticket, setTicket] = useState('');
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const catOk = !activeCat || f.category === activeCat;
      const qOk = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, activeCat]);

  const groups = CATEGORIES.map((c) => ({ ...c, items: filtered.filter((f) => f.category === c.id) })).filter((g) => g.items.length > 0);

  async function submitSupport(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!email.trim() || !message.trim()) { setFormError('Email and message are required.'); return; }
    setFormState('loading');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), subject: subject.trim() || 'Support request', message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setFormState('error'); setFormError(data.error || 'Could not send message. Try again.'); return; }
      setTicket(String(data.ticketId || data.ticket_id || data.id || ''));
      setFormState('done');
      setMessage(''); setSubject('');
    } catch {
      setFormState('error');
      setFormError('Network error. Try again.');
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1180px] px-6 py-12 lg:py-16">
        {/* HERO */}
        <div className="mx-auto max-w-2xl text-center">
          <Label className="text-[var(--gold)]">Support</Label>
          <h1 className="mt-2 text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--fg)]">How can we help?</h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--muted)]">
            Answers on deposits, withdrawals, profit, referrals, security, and partnerships — or talk to a real person.
          </p>
          <div className="ds-card mt-8 flex items-center gap-3 rounded-xl px-5 py-4">
            <svg className="h-5 w-5 shrink-0 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: withdrawal, fee, network, referral…"
              className="w-full bg-transparent text-[15px] text-[var(--fg)] outline-none placeholder:text-[var(--muted)]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[12px] font-medium text-[var(--muted)] hover:text-[var(--fg)]">Clear</button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/trading-agreement" className="no-underline"><Button variant="secondary" size="sm">Trading agreement</Button></Link>
            <Link href="/forgot-password" className="no-underline"><Button variant="secondary" size="sm">Reset password</Button></Link>
            <Link href="/console" className="no-underline"><Button variant="secondary" size="sm">Open dashboard</Button></Link>
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCat(null)}
            className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${!activeCat ? 'bg-[var(--gold)] text-black' : 'ds-card text-[var(--muted)] hover:text-[var(--fg)]'}`}
          >
            All topics
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition ${activeCat === c.id ? 'bg-[var(--gold)] text-black' : 'ds-card text-[var(--muted)] hover:text-[var(--fg)]'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={c.icon} /></svg>
              {c.label}
            </button>
          ))}
        </div>

        {/* FAQ GROUPS */}
        <div className="mt-10 space-y-8">
          {groups.length === 0 && (
            <DataCard title="No answers found">
              <p className="text-[14px] text-[var(--muted)]">
                Nothing matches "{query}". Try a different word, or send us a message below — a real person replies within 12–24 hours.
              </p>
            </DataCard>
          )}
          {groups.map((g) => (
            <DataCard key={g.id} title={g.label} subtitle={`${g.items.length} answer${g.items.length === 1 ? '' : 's'}`}>
              <div className="divide-y divide-[var(--border)]">
                {g.items.map((f) => {
                  const isOpen = open === f.id;
                  return (
                    <div key={f.id}>
                      <button
                        onClick={() => setOpen(isOpen ? null : f.id)}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="text-[14px] font-medium text-[var(--fg)]">{f.q}</span>
                        <span className={`shrink-0 text-[18px] leading-none text-[var(--gold)] transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="pb-4 pr-8 text-[14px] leading-[1.65] text-[var(--muted)]">{f.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </DataCard>
          ))}
        </div>

        {/* CONTACT */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <DataCard title="Talk to a human" subtitle="When the answers above aren't enough">
            <div className="space-y-4 text-[14px] leading-[1.6] text-[var(--muted)]">
              <p><span className="font-medium text-[var(--fg)]">Response time:</span> 12–24 hours, every day.</p>
              <p><span className="font-medium text-[var(--fg)]">Security matters:</span> put SECURITY in the subject and you jump the queue.</p>
              <p><span className="font-medium text-[var(--fg)]">Email:</span> support@kingdomtradex.com</p>
              <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3 text-[13px]">
                We will never ask for your password, seed phrase, or private keys. Anyone who does is impersonating KingdomTradeX.
              </div>
            </div>
          </DataCard>

          <DataCard title="Send us a message">
            {formState === 'done' ? (
              <div className="space-y-3 text-[14px] leading-[1.6]">
                <p className="font-medium text-[var(--profit)]">Message received{ticket ? ` — ticket ${ticket}` : ''}.</p>
                <p className="text-[var(--muted)]">A confirmation email is on its way. We reply within 12–24 hours; reply to that email to keep the conversation in one thread.</p>
                <Button variant="secondary" size="sm" onClick={() => setFormState('idle')}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={submitSupport} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[14px] text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                </div>
                <div>
                  <Label>Subject (optional)</Label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Withdrawal question"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[14px] text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                </div>
                <div>
                  <Label>Message</Label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Tell us what's going on…"
                    className="mt-1 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[14px] text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                </div>
                {formError && <p className="text-[13px] text-[var(--loss)]">{formError}</p>}
                <Button type="submit" disabled={formState === 'loading'} className="w-full">
                  {formState === 'loading' ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            )}
          </DataCard>
        </div>

        {/* LEGAL FOOTER ROW */}
        <p className="mt-12 text-center text-[12px] text-[var(--muted)]">
          <Link href="/terms" className="text-[var(--gold)] hover:underline">Terms of Service</Link> · <Link href="/privacy" className="text-[var(--gold)] hover:underline">Privacy Policy</Link> · <Link href="/trading-agreement" className="text-[var(--gold)] hover:underline">Trading Agreement & Risk Disclosure</Link>
        </p>
      </div>
    </main>
  );
}
