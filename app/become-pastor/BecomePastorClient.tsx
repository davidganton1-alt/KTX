"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MemberEmblem } from "@/components/MemberEmblem";
import { GlowCard } from "@/components/GlowCard";

const STEPS = [
  { n: "I", t: "Apply", d: "Share your name, ministry, and how you would shepherd this community." },
  { n: "II", t: "Review", d: "The admin reviews every application personally before a pastor goes live." },
  { n: "III", t: "Approved", d: "You appear on the pastors list and receive your referral link." },
  { n: "IV", t: "Refer & share", d: "Shepherd members to the platform and share in the fruit of their growth." },
];

export default function BecomePastorPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ministry, setMinistry] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/pastors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, ministry, message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(data?.error || "Submission failed. Please try again."); setLoading(false); return; }
      setOk(true);
    } catch (err: any) {
      setError(err.message || "Network error.");
    }
    setLoading(false);
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
      {/* ── LEFT: the calling ── */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full opacity-20 blur-[130px]" style={{ background: "var(--gold)" }} />
          <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full opacity-15 blur-[110px]" style={{ background: "var(--purple)" }} />
        </div>
        <div className="sticky top-0 flex h-screen flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-5">
            <MemberEmblem name="Pastor Samuel Adeyemi" className="h-16 w-16" />
            <div>
              <p className="eyebrow">Serve the flock</p>
              <h1 className="section-title mt-1 text-4xl xl:text-5xl">Shepherd the <span className="gradient-text">flock of God</span></h1>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-sm italic leading-relaxed text-[var(--muted)]" style={{ fontFamily: "Georgia, serif" }}>
            "Feed the flock of God which is among you, taking the oversight thereof, not by constraint, but willingly; not for filthy lucre, but of a ready mind."
            <span className="eyebrow mt-2 block not-italic">1 Peter 5:2</span>
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.12 }}>
                <GlowCard className="h-full p-5">
                  <p className="text-lg font-bold text-[var(--gold)]">{s.n}</p>
                  <p className="mt-1 font-semibold">{s.t}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{s.d}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: the application ── */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <MemberEmblem name="Pastor Samuel Adeyemi" className="mx-auto h-14 w-14" />
            <h1 className="section-title mt-3 text-3xl">List as a <span className="gradient-text">pastor</span></h1>
          </div>

          {ok ? (
            <GlowCard className="p-8 text-center">
              <p className="text-3xl text-[var(--gold)]">✝</p>
              <h2 className="mt-3 text-xl font-semibold text-[var(--gold)]">Application received</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Thank you. The admin will review your application and approve it if you are a fit to shepherd this community. You will then appear on the pastors list and can refer members.
              </p>
              <Link href="/team" className="btn-primary mt-5 inline-flex">Back to the team</Link>
            </GlowCard>
          ) : (
            <GlowCard className="p-6 md:p-8">
              <p className="eyebrow">Application</p>
              <h2 className="section-title mt-2 text-2xl">Walk with <span className="gradient-text">this work</span></h2>
              <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20" />
                <input value={ministry} onChange={(e) => setMinistry(e.target.value)} placeholder="Ministry (e.g. Prayer & Discernment)"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20" />
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share briefly how you would shepherd this community" rows={4}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20" />
                {error && <p className="text-sm text-loss">{error}</p>}
                <button disabled={loading} className="btn-gold w-full disabled:opacity-60">
                  {loading ? "Submitting…" : "Submit application"}
                </button>
              </form>
              <p className="mt-5 text-center text-sm text-[var(--muted)]">
                Already have an account? <Link href="/login" className="text-[var(--gold)] hover:underline">Sign in</Link>
              </p>
            </GlowCard>
          )}
        </div>
      </div>
    </main>
  );
}
