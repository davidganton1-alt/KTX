"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "@/components/Reveal";
import { Verse } from "@/components/Verse";
import { GlowCard } from "@/components/GlowCard";

const promises = [
  { g: "✦", t: "Stewardship", d: "Your seed is a trust. The AI guards it." },
  { g: "◈", t: "Clarity", d: "Every day's profit is shown in plain sight." },
  { g: "↗", t: "Integrity", d: "Withdraw your harvest anytime. No locks." },
];

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pastorParam = searchParams.get("pastor");
  const refParam = searchParams.get("ref");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pastor, setPastor] = useState("");
  const [refCode, setRefCode] = useState(refParam || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const leftRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: leftRef, offset: ["start start", "end end"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.8], [40, -40]);
  const y3 = useTransform(scrollYProgress, [0.5, 1], [60, -20]);

  useEffect(() => {
    if (pastorParam) setPastor(pastorParam);
    if (refParam) setRefCode(refParam);
  }, [pastorParam, refParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, string> = { name, email, password };
      if (pastor.trim()) body.pastor = pastor.trim();
      if (refCode.trim()) body.refCode = refCode.trim();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/console");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Network error.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
      {/* ── LEFT: CINEMATIC NARRATIVE ── */}
      <div ref={leftRef} className="relative hidden overflow-hidden lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center px-12 xl:px-20">
          {/* ambient orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-20 h-96 w-96 rounded-full blur-[120px] opacity-20" style={{ background: "var(--gold)" }} />
            <div className="absolute -right-20 bottom-32 h-80 w-80 rounded-full blur-[100px] opacity-15" style={{ background: "var(--cyan)" }} />
          </div>

          {/* opening */}
          <motion.div style={{ y: y1 }} className="relative z-10">
            <p className="eyebrow">Your stewardship begins</p>
            <h1 className="section-title mt-3 text-5xl xl:text-6xl">
              Plant with <span className="gradient-text">intention</span>.
              <br />
              Harvest with <span className="gradient-text">peace</span>.
            </h1>
          </motion.div>

          {/* verse */}
          <motion.div style={{ y: y2 }} className="relative z-10 mt-12">
            <Verse variant="today" />
          </motion.div>

          {/* promises */}
          <motion.div style={{ y: y3 }} className="relative z-10 mt-12 grid gap-4 md:grid-cols-3">
            {promises.map((p) => (
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
          {/* mobile heading (hidden on desktop) */}
          <div className="mb-8 text-center lg:hidden">
            <p className="eyebrow">Join KingdomTradeX</p>
            <h1 className="section-title mt-2 text-3xl">
              Claim your <span className="gradient-text">$50 gift</span>
            </h1>
          </div>

          {/* pastor invite banner */}
          {pastorParam && (
            <Reveal variant="up">
              <div className="mb-4 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-4 text-center">
                <p className="text-sm">
                  <span className="text-[var(--gold)]">✝</span> You were invited by <span className="font-semibold text-[var(--gold)]">{pastorParam}</span>
                </p>
              </div>
            </Reveal>
          )}

          {/* member refCode banner */}
          {refParam && (
            <Reveal variant="up">
              <div className="mb-4 rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/[0.06] p-4 text-center">
                <p className="text-sm">
                  <span className="text-[var(--cyan)]">✦</span> Invited by a member. They earn <span className="font-semibold text-[var(--cyan)]">$25</span> when you fund your first plan.
                </p>
              </div>
            </Reveal>
          )}

          {/* form card */}
          <GlowCard className="p-6 md:p-8">
            <div className="mb-6">
              <p className="eyebrow">Begin your journey</p>
              <h2 className="section-title mt-2 text-2xl md:text-3xl">
                Start with <span className="gradient-text">$50 free</span>
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">No deposit needed. The AI trades your gift, and you keep the profit.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  placeholder="John Smith"
                />
              </div>

              {/* email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  placeholder="john@example.com"
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
                  minLength={8}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  placeholder="8+ characters"
                />
              </div>

              {/* pastor */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Referred by (pastor name, optional)
                </label>
                <input
                  type="text"
                  value={pastor}
                  onChange={(e) => setPastor(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  placeholder="Pastor Daniel"
                />
              </div>

              {/* hidden refCode */}
              {refCode && <input type="hidden" name="refCode" value={refCode} />}

              {/* error */}
              {error && (
                <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 text-center text-sm text-loss">{error}</div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Claim my $50"}
              </button>
            </form>

            {/* trust line */}
            <p className="mt-5 text-center text-xs text-[var(--muted)]">
              🔒 No spam. No hidden fees. Your data stays private.
            </p>

            {/* signin link */}
            <p className="mt-4 text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <a href="/login" className="text-[var(--gold)] hover:underline">
                Sign in
              </a>
            </p>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
