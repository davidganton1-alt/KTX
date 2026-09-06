"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Verse } from "@/components/Verse";
import { GlowCard } from "@/components/GlowCard";

const PROMISES = [
  { g: "✦", t: "Secure", d: "Your session is encrypted and protected." },
  { g: "◈", t: "Seamless", d: "Return to your dashboard in one click." },
  { g: "↗", t: "Stewardship", d: "The harvest awaits your return." },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        setError(data?.error || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Fetch user profile to determine role-aware redirect
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const meData = await meRes.json().catch(() => null);

      // 3. Role-aware redirect
      if (meData?.role === "admin") {
        router.push("/admin");
      } else if (meData?.isPastor) {
        router.push("/pastor");
      } else {
        router.push("/console");
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
      {/* ── LEFT: CINEMATIC NARRATIVE ── */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full blur-[120px] opacity-20" style={{ background: "var(--gold)" }} />
          <div className="absolute -right-20 bottom-32 h-80 w-80 rounded-full blur-[100px] opacity-15" style={{ background: "var(--cyan)" }} />
        </div>

        <div className="sticky top-0 flex h-screen flex-col justify-center px-12 xl:px-20">
          <motion.div 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <p className="eyebrow">Welcome back, steward</p>
            <h1 className="section-title mt-3 text-5xl xl:text-6xl">
              The harvest <span className="gradient-text">awaits</span>.
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-12"
          >
            <Verse variant="today" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-12 grid gap-4 md:grid-cols-3"
          >
            {PROMISES.map((p) => (
              <div key={p.t} className="card p-4">
                <span className="icon-chip">{p.g}</span>
                <p className="mt-3 font-semibold">{p.t}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{p.d}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT: STICKY FORM ── */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10 lg:sticky lg:top-0 lg:h-screen lg:px-12">
        <div className="w-full max-w-md">
          {/* mobile heading */}
          <div className="mb-8 text-center lg:hidden">
            <p className="eyebrow">Welcome back</p>
            <h1 className="section-title mt-2 text-3xl">
              The harvest <span className="gradient-text">awaits</span>.
            </h1>
          </div>

          <GlowCard className="p-6 md:p-8">
            <div className="mb-6">
              <p className="eyebrow">Sign in</p>
              <h2 className="section-title mt-2 text-2xl md:text-3xl">
                Access your <span className="gradient-text">console</span>
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Enter your credentials to continue your stewardship.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  placeholder="you@example.com"
                />
              </div>

              {/* password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  placeholder="••••••••"
                />
              </div>

              {/* error */}
              {error && (
                <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 text-center text-sm text-loss">
                  {error}
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* trust line */}
            <p className="mt-5 text-center text-xs text-[var(--muted)]">
              🔒 Secure, encrypted, and private.
            </p>

            {/* sign up link */}
            <p className="mt-4 text-center text-sm text-[var(--muted)]">
              New here?{" "}
              <a href="/register" className="text-[var(--gold)] hover:underline">
                Create an account
              </a>
            </p>
          </GlowCard>
        </div>
      </div>
    </main>
  );
}
