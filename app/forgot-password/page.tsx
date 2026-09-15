"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/GlowCard";

// Phase I: forgot-password. Single email field; the response never reveals
// whether an account exists (same copy for hit and miss).
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <p className="eyebrow">Account recovery</p>
          <h1 className="section-title mt-2 text-3xl">
            Reset your <span className="gradient-text">password</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {sent
              ? "Check your inbox for the reset link."
              : "Enter your account email and we'll send you a secure reset link."}
          </p>
        </div>

        <GlowCard className="p-6 md:p-8">
          {sent ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-2xl">
                ✉
              </div>
              <p className="text-sm text-[var(--fg)]">
                If an account exists with that email, we've sent a reset link.
                It expires in <strong>24 hours</strong> and can be used once.
              </p>
              <p className="text-xs text-[var(--muted)]">
                Didn't receive it? Check spam, or try again in an hour.
              </p>
              <Link href="/login" className="btn-gold inline-block w-full text-center">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 text-center text-sm text-loss">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-xs text-[var(--muted)]">
            🔒 Reset links are single-use and expire in 24 hours.
          </p>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            Remembered it?{" "}
            <Link href="/login" className="text-[var(--gold)] hover:underline">
              Back to sign in
            </Link>
          </p>
        </GlowCard>
      </motion.div>
    </main>
  );
}
