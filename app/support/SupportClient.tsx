"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionIcon } from "@/components/SectionIcon";
import { GlowCard } from "@/components/GlowCard";

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Failed to send. Please try again.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main className="container-wide pb-24 pt-14">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="help" size={56} /></div>
        <p className="eyebrow">We&rsquo;re here for you</p>
        <h1 className="section-title mt-2 text-4xl md:text-6xl">How can we <span className="gradient-text">help?</span></h1>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Reach out with any question about your account, deposits, withdrawals, or the platform. Our team responds within 24 hours.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Contact Form */}
        <div>
          {sent ? (
            <GlowCard className="p-10 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-profit/20 text-3xl text-profit">✓</div>
              <h2 className="text-xl font-semibold text-profit">Message received</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Thank you for reaching out. Our support team will review your message and respond to <b className="text-[var(--fg)]">{email}</b> within 24 hours.
              </p>
              <button onClick={() => { setSent(false); setEmail(""); setSubject(""); setMessage(""); }}
                className="btn-ghost mt-6 inline-flex">Send another message</button>
            </GlowCard>
          ) : (
            <GlowCard className="p-6 md:p-8">
              <p className="eyebrow">Send a message</p>
              <h2 className="section-title mt-2 text-2xl">Contact <span className="gradient-text">our team</span></h2>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Your Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Subject</label>
                  <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                    placeholder="How can we help?" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Message</label>
                  <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                    placeholder="Describe your question or issue in detail..." />
                </div>
                {error && <p className="text-sm text-loss">{error}</p>}
                <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </GlowCard>
          )}
        </div>

        {/* Side info */}
        <div className="space-y-5">
          <GlowCard className="p-6">
            <h3 className="font-bold text-[var(--fg)]">📖 Check the FAQ first</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">Most questions are answered instantly in our Help Center.</p>
            <Link href="/help-center" className="mt-3 inline-block text-sm text-[var(--gold)] hover:underline">Browse FAQs →</Link>
          </GlowCard>

          <GlowCard className="p-6">
            <h3 className="font-bold text-[var(--fg)]">⏱ Response time</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">We aim to respond to all messages within 24 hours. Ambassador members receive priority support.</p>
          </GlowCard>

          <GlowCard className="p-6">
            <h3 className="font-bold text-[var(--fg)]">🔒 Security reminder</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              We will <b className="text-loss">never</b> ask for your password or seed phrase. Only trust this official website.
            </p>
          </GlowCard>
        </div>
      </div>
    </main>
  );
}
