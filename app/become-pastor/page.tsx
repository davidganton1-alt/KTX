"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export default function BecomePastorPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ministry, setMinistry] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/pastors/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, phone, ministry, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Application failed");
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Reveal as="main" variant="up" className="container-wide flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-xl">
        <div className="card p-8">
          <div className="mb-6 text-center">
            <p className="eyebrow">Serve the flock</p>
            <h1 className="mt-2 text-3xl font-bold">
              List as a <span className="gradient-text">pastor</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Pastors who walk with this work can refer members and share in the fruit of their
              growth. Apply below; the admin reviews every application before a pastor goes live.
            </p>
          </div>

          {ok ? (
            <div className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--card)] p-6 text-center">
              <h2 className="text-xl font-semibold text-[var(--gold)]">Application received</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Thank you. The admin will review your application and approve it if you are a fit to
                shepherd this community. You will then appear on the pastors list and can refer
                members.
              </p>
              <Link href="/team" className="btn-primary mt-5 inline-flex">
                Back to the team
              </Link>
            </div>
          ) : (
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
              />
              <input
                value={ministry}
                onChange={(e) => setMinistry(e.target.value)}
                placeholder="Ministry (e.g. Prayer & Discernment)"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share briefly how you would shepherd this community"
                rows={4}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
              />
              {error && <p className="text-sm text-loss">{error}</p>}
              <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? "Submitting…" : "Submit application"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--gold)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          &ldquo;Shepherd the flock of God among you.&rdquo; — 1 Peter 5:2
        </p>
      </div>
    </Reveal>
  );
}
