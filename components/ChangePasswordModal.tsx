"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { passwordIssues, passwordStrengthLabel } from "@/lib/passwordPolicy";

// Phase I: change-password modal for signed-in users (Settings tab).
interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const strength = passwordStrengthLabel(next);
  const issues = passwordIssues(next);
  const mismatch = confirm.length > 0 && next !== confirm;

  function reset() {
    setCurrent(""); setNext(""); setConfirm(""); setError(""); setDone(false); setShow(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Could not change your password.");
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
      setTimeout(() => { reset(); onClose(); }, 2000);
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => { if (!loading) { reset(); onClose(); } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-6 shadow-2xl"
          >
            {done ? (
              <div className="space-y-4 py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-2xl">✓</div>
                <p className="text-sm text-[var(--fg)]">Password changed. A confirmation email is on its way.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <p className="eyebrow">Security</p>
                  <h2 className="section-title mt-1 text-xl">Change password</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">You'll stay signed in on this device. We'll email you a confirmation.</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Current password</label>
                  <input type={show ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} required className={inputCls} placeholder="••••••••" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">New password</label>
                    <button type="button" onClick={() => setShow((v) => !v)} className="text-[11px] text-[var(--gold)] hover:underline">
                      {show ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} required className={inputCls} placeholder="••••••••" />
                  {next && (
                    <div className="mt-2">
                      <div className="flex gap-1.5">
                        {(["weak", "fair", "strong"] as const).map((tier, i) => (
                          <span key={tier} className="h-1 flex-1 rounded-full" style={{
                            background: ["weak", "fair", "strong"].indexOf(strength) >= i
                              ? strength === "weak" ? "var(--loss, #F87171)" : strength === "fair" ? "var(--warning, #FBBF24)" : "var(--success, #34D399)"
                              : "var(--border)",
                          }} />
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
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Confirm new password</label>
                  <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={inputCls} placeholder="••••••••" />
                  {mismatch && <p className="mt-1.5 text-[11px] text-loss">Passwords do not match.</p>}
                </div>

                {error && (
                  <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 text-center text-sm text-loss">{error}</div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { reset(); onClose(); }} className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--fg)] transition hover:bg-[var(--bg)]">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || issues.length > 0 || mismatch || !current} className="btn-gold flex-1 disabled:opacity-60">
                    {loading ? "Changing..." : "Change password"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
