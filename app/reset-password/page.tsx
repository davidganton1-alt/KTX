"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/GlowCard";
import { passwordIssues, passwordStrengthLabel } from "@/lib/passwordPolicy";

// Phase I: redeem the emailed reset link. Token arrives via ?token=…; a
// missing token shows an "invalid link" state instead of a dead form.
function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const strength = passwordStrengthLabel(password);
  const issues = passwordIssues(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Reset failed. Please request a new link.");
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <GlowCard className="p-6 md:p-8 text-center">
        <h2 className="section-title text-xl text-loss">Invalid reset link</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          This link is missing its security token. Please request a new password reset.
        </p>
        <Link href="/forgot-password" className="btn-gold mt-6 inline-block w-full text-center">
          Request new link
        </Link>
      </GlowCard>
    );
  }

  return (
    <GlowCard className="p-6 md:p-8">
      {done ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-2xl">
            ✓
          </div>
          <p className="text-sm text-[var(--fg)]">
            Password updated. Taking you back to sign in…
          </p>
          <Link href="/login" className="btn-gold inline-block w-full text-center">
            Sign in now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                New password
              </label>
              <button type="button" onClick={() => setShowPw((v) => !v)} className="text-[11px] text-[var(--gold)] hover:underline">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
              placeholder="••••••••"
            />
            {/* strength meter */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1.5">
                  {(["weak", "fair", "strong"] as const).map((tier, i) => (
                    <span
                      key={tier}
                      className="h-1 flex-1 rounded-full"
                      style={{
                        background:
                          ["weak", "fair", "strong"].indexOf(strength) >= i
                            ? strength === "weak"
                              ? "var(--loss, #F87171)"
                              : strength === "fair"
                                ? "var(--warning, #FBBF24)"
                                : "var(--success, #34D399)"
                            : "var(--border)",
                      }}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                  {strength === "weak" ? "Weak" : strength === "fair" ? "Fair" : "Strong"}
                  {issues.length > 0 && ` — needs ${issues.join(", ")}`}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Confirm new password
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 text-center text-sm text-loss">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || issues.length > 0} className="btn-gold w-full disabled:opacity-60">
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-xs text-[var(--muted)]">
        Must be 8+ characters with an uppercase letter, a lowercase letter, and a number.
      </p>
    </GlowCard>
  );
}

export default function ResetPasswordPage() {
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
            Choose a new <span className="gradient-text">password</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Pick something strong you haven't used here before.
          </p>
        </div>
        <Suspense fallback={<div className="h-40" />}>
          <ResetForm />
        </Suspense>
      </motion.div>
    </main>
  );
}
