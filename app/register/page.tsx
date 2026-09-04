"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" />}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pastor, setPastor] = useState("");
  const [refCode, setRefCode] = useState("");
  const [invitedByPastor, setInvitedByPastor] = useState(false);
  const [invitedByMember, setInvitedByMember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prefill from invite links: ?pastor=<name> (pastor invite) or ?ref=<code>
  // (member invite).
  useEffect(() => {
    const p = params.get("pastor");
    if (p) {
      setPastor(p);
      setInvitedByPastor(true);
    }
    const r = params.get("ref");
    if (r) {
      setRefCode(r);
      setInvitedByMember(true);
    }
  }, [params]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          pastor: pastor.trim() || undefined,
          refCode: refCode.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      router.push("/console");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Reveal as="main" variant="right" className="container-wide flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="logo-glow">
              <Logo size={96} />
            </div>
            <h1 className="mt-4 text-3xl font-bold">
              Get your <span className="gradient-text">$50 free credit</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Create your KingdomTradeX account. We&rsquo;ll add $50 to start, fund a
              tier anytime to unlock AI trading and daily profit.
            </p>
          </div>
          {(invitedByPastor || invitedByMember) && (
            <div className="mb-4 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-3 text-center text-sm">
              {invitedByPastor && (
                <p>
                  ✝ You were invited by <span className="font-semibold text-[var(--gold)]">{pastor}</span>. You
                  will join their flock automatically.
                </p>
              )}
              {invitedByMember && (
                <p className={invitedByPastor ? "mt-1" : ""}>
                  ✦ You were invited by a member. They earn a $25 bonus when you fund your first plan.
                </p>
              )}
            </div>
          )}
          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />
            <input
              value={pastor}
              onChange={(e) => setPastor(e.target.value)}
              placeholder="Referred by (pastor name, optional)"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />
            {error && <p className="text-sm text-loss">{error}</p>}
            <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--gold)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          &ldquo;Be faithful with the little things, and you will be trusted with much.&rdquo; Luke 16:10
        </p>
      </div>
    </Reveal>
  );
}
