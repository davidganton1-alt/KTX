"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Verse } from "@/components/Verse";
import { GlowCard } from "@/components/GlowCard";

type Role = "member" | "pastor";

const MEMBER_PROMISES = [
  { g: "✦", t: "Stewardship", d: "Your seed is a trust. The AI guards it." },
  { g: "◈", t: "Clarity", d: "Every day's profit is shown in plain sight." },
  { g: "↗", t: "Integrity", d: "Withdraw your harvest anytime. No locks." },
];

const PASTOR_STEPS = [
  { g: "I", t: "Apply", d: "Share your ministry and your calling." },
  { g: "II", t: "Review", d: "The admin reviews every application." },
  { g: "III", t: "Approved", d: "You join the pastors list with your link." },
  { g: "IV", t: "Share", d: "Refer members & share in the fruit." },
];

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pastorParam = searchParams.get("pastor");
  const refParam = searchParams.get("ref");
  const roleParam = searchParams.get("role");

  const [role, setRole] = useState<Role>(roleParam === "pastor" ? "pastor" : "member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pastor, setPastor] = useState("");
  const [refCode, setRefCode] = useState(refParam || "");
  const [ministry, setMinistry] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pastorOk, setPastorOk] = useState(false);
  const [applyWarning, setApplyWarning] = useState("");

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
    setApplyWarning("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      // 1) Create the account (both roles)
      const body: Record<string, string> = { name, email, password };
      if (role === "member" && pastor.trim()) body.pastor = pastor.trim();
      if (role === "member" && refCode.trim()) body.refCode = refCode.trim();

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

      // 2a) Member → straight to console
      if (role === "member") {
        router.push("/console");
        router.refresh();
        return;
      }

      // 2b) Pastor → submit application for admin review
      try {
        const applyRes = await fetch("/api/pastors/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, ministry, message }),
        });
        if (!applyRes.ok) {
          setApplyWarning("Your account was created, but the pastor application didn't go through — you can apply again anytime at /become-pastor.");
        }
      } catch {
        setApplyWarning("Your account was created, but the pastor application didn't go through — you can apply again anytime at /become-pastor.");
      }
      setPastorOk(true);
    } catch (err: any) {
      setError(err.message || "Network error.");
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
      {/* ── LEFT: reactive narrative ── */}
      <div ref={leftRef} className="relative hidden overflow-hidden lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center px-12 xl:px-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-20 h-96 w-96 rounded-full blur-[120px] opacity-20" style={{ background: role === "member" ? "var(--gold)" : "var(--purple)" }} />
            <div className="absolute -right-20 bottom-32 h-80 w-80 rounded-full blur-[100px] opacity-15" style={{ background: "var(--cyan)" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`head-${role}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
              <motion.div style={{ y: y1 }} className="relative z-10">
                <p className="eyebrow">{role === "member" ? "Your stewardship begins" : "Your calling begins"}</p>
                <h1 className="section-title mt-3 text-5xl xl:text-6xl">
                  {role === "member" ? (
                    <>Plant with <span className="gradient-text">intention</span>.<br />Harvest with <span className="gradient-text">peace</span>.</>
                  ) : (
                    <>Shepherd the <span className="gradient-text">flock of God</span>.</>
                  )}
                </h1>
              </motion.div>

              <motion.div style={{ y: y2 }} className="relative z-10 mt-12 max-w-xl">
                {role === "member" ? (
                  <Verse variant="today" />
                ) : (
                  <p className="text-sm italic leading-relaxed text-[var(--muted)]" style={{ fontFamily: "Georgia, serif" }}>
                    "Feed the flock of God which is among you, taking the oversight thereof, not by constraint, but willingly; not for filthy lucre, but of a ready mind."
                    <span className="eyebrow mt-2 block not-italic">1 Peter 5:2</span>
                  </p>
                )}
              </motion.div>

              <motion.div style={{ y: y3 }} className="relative z-10 mt-12 grid gap-4 md:grid-cols-3">
                {(role === "member" ? MEMBER_PROMISES : PASTOR_STEPS).map((p) => (
                  <div key={p.t} className="card p-4">
                    <span className="icon-chip">{p.g}</span>
                    <p className="mt-3 font-semibold">{p.t}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{p.d}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT: form ── */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10 lg:sticky lg:top-0 lg:h-screen lg:px-12">
        <div className="w-full max-w-md">
          {/* mobile heading */}
          <div className="mb-8 text-center lg:hidden">
            <p className="eyebrow">Join KingdomTradeX</p>
            <h1 className="section-title mt-2 text-3xl">
              {role === "member" ? <>Claim your <span className="gradient-text">$50 gift</span></> : <>List as a <span className="gradient-text">pastor</span></>}
            </h1>
          </div>

          {pastorOk ? (
            <GlowCard className="p-8 text-center">
              <p className="text-3xl text-[var(--gold)]">✝</p>
              <h2 className="mt-3 text-xl font-semibold text-[var(--gold)]">Account created · application received</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                The admin will review your pastor application. Once approved, you'll appear on the pastors list and can refer members.
              </p>
              {applyWarning && <p className="mt-3 text-xs text-loss">{applyWarning}</p>}
              <button onClick={() => { router.push("/console"); router.refresh(); }} className="btn-gold mt-5 w-full">
                Enter the console
              </button>
            </GlowCard>
          ) : (
            <GlowCard className="p-6 md:p-8">
              <div className="mb-6">
                <p className="eyebrow">Begin your journey</p>
                <h2 className="section-title mt-2 text-2xl md:text-3xl">
                  {role === "member" ? <>Start with <span className="gradient-text">$50 free</span></> : <>Walk with <span className="gradient-text">this work</span></>}
                </h2>
              </div>

              {/* ── ROLE SELECTOR ── */}
              <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/60 p-1.5">
                <button type="button" onClick={() => setRole("member")}
                  className={`flex flex-col items-center gap-0.5 rounded-xl border px-3 py-3 transition ${role === "member" ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold)]" : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"}`}>
                  <span className="text-xl">👤</span>
                  <span className="text-sm font-semibold">Member</span>
                  <span className="text-[10px] opacity-70">Trade & harvest</span>
                </button>
                <button type="button" onClick={() => setRole("pastor")}
                  className={`flex flex-col items-center gap-0.5 rounded-xl border px-3 py-3 transition ${role === "pastor" ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold)]" : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"}`}>
                  <span className="text-xl">✝</span>
                  <span className="text-sm font-semibold">Pastor</span>
                  <span className="text-[10px] opacity-70">Shepherd & share</span>
                </button>
              </div>

              {/* invite banners (member context) */}
              {role === "member" && pastorParam && (
                <div className="mb-4 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-4 text-center">
                  <p className="text-sm"><span className="text-[var(--gold)]">✝</span> You were invited by <span className="font-semibold text-[var(--gold)]">{pastorParam}</span></p>
                </div>
              )}
              {role === "member" && refParam && (
                <div className="mb-4 rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/[0.06] p-4 text-center">
                  <p className="text-sm"><span className="text-[var(--cyan)]">✦</span> Invited by a member. They earn <span className="font-semibold text-[var(--cyan)]">$25</span> when you fund your first plan.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* shared fields */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Full name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="John Smith" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} placeholder="john@example.com" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={inputCls} placeholder="8+ characters" />
                </div>

                {/* role-specific fields */}
                <AnimatePresence mode="wait">
                  {role === "member" ? (
                    <motion.div key="member-fields" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Referred by (pastor name, optional)</label>
                      <input type="text" value={pastor} onChange={(e) => setPastor(e.target.value)} className={inputCls} placeholder="Pastor Daniel" />
                    </motion.div>
                  ) : (
                    <motion.div key="pastor-fields" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Ministry</label>
                        <input type="text" value={ministry} onChange={(e) => setMinistry(e.target.value)} className={inputCls} placeholder="e.g. Prayer & Discernment" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Phone (optional)</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+1 555 000 0000" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">How would you shepherd this community?</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} placeholder="Share briefly…" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {refCode && <input type="hidden" name="refCode" value={refCode} />}

                {error && (
                  <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 text-center text-sm text-loss">{error}</div>
                )}

                <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
                  {loading ? "Creating account..." : role === "member" ? "Claim my $50" : "Submit application"}
                </button>
              </form>

              {role === "pastor" && (
                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  Pastor applications are reviewed by the admin before going live.
                </p>
              )}
              <p className="mt-4 text-center text-xs text-[var(--muted)]">🔒 No spam. No hidden fees. Your data stays private.</p>
              <p className="mt-3 text-center text-sm text-[var(--muted)]">
                Already have an account? <a href="/login" className="text-[var(--gold)] hover:underline">Sign in</a>
              </p>
            </GlowCard>
          )}
        </div>
      </div>
    </div>
  );
}
