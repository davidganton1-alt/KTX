"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Trading Agreement signing modal (Phase H): a condensed summary of the full
// Trading Agreement & Risk Disclosure at /trading-agreement (opens in a new
// tab). Signature requires scrolling the summary AND checking the box; the
// binding POST is unchanged (/api/user/agreement -> has_signed_agreement).

const SUMMARY = [
  {
    t: "1. What this is",
    b: "AI-assisted algorithmic trading. The engine allocates your deposit across crypto, US stocks, and commodities and trades autonomously. You never place trades yourself.",
  },
  {
    t: "2. Real risk, said plainly",
    b: "Markets are volatile. Losses are possible, including the loss of some or all of your principal. Guardrails reduce risk; they do not remove it. Past performance (e.g., a 71.4% win rate) does not guarantee future results.",
  },
  {
    t: "3. Rates are targets, not promises",
    b: "0.25% / 0.50% / 0.75% per day by tier are design targets. They are not interest and not guaranteed.",
  },
  {
    t: "4. Holding periods & the 50% fee",
    b: "Principal is held 6/9/12 months by tier (Faithful/Steward/Ambassador). After the hold, withdraw 100% fee-free. Before the hold, an early exit pays you 50%: a liquidated-damages fee compensating the engine's real cost of unwinding long-term positions and refilling liquidity pools. Profit is never penalized and stays withdrawable throughout.",
  },
  {
    t: "5. The $50 platform credit",
    b: "Promotional and non-withdrawable. It earns daily profit alongside your principal; only its profit is yours to withdraw.",
  },
  {
    t: "6. Profit withdrawals",
    b: "Automatic, no admin approval, no platform fee — you pay only the blockchain network fee shown at confirmation. Profit accrues daily at UTC midnight on (principal + credit) × tier rate.",
  },
  {
    t: "7. Referral economics",
    b: "5% (pastors/creators) or 2.5% (members) of a referral's first deposit plus 0.1% of their daily profit for life, funded by the platform, unlocked after a 7-day anti-fraud hold.",
  },
];

export function TradingAgreementModal({ onAgree, userName }: { onAgree: () => void; userName?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function check() {
      if (!el) return;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      if (atBottom) setScrolled(true);
    }
    el.addEventListener("scroll", check);
    // short summaries may already fit: allow signing without scroll gymnastics
    if (el.scrollHeight <= el.clientHeight + 40) setScrolled(true);
    return () => el.removeEventListener("scroll", check);
  }, []);

  async function handleSubmit() {
    if (!agreed || !scrolled) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreedAt: Date.now() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save agreement");
      }
      onAgree();
    } catch (e: any) {
      setError(e.message || "Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl rounded-2xl border border-[var(--gold)]/30 bg-[var(--bg-soft)] shadow-2xl"
      >
        <div className="border-b border-[var(--border)] p-6">
          <p className="eyebrow">Required before you continue</p>
          <h2 className="section-title mt-2 text-2xl md:text-3xl">
            Trading Agreement <span className="gradient-text">Summary</span>
          </h2>
          {userName && <p className="mt-2 text-xs text-[var(--muted)]">Welcome, <b className="text-[var(--fg)]">{userName}</b>. Here is the short version — the full text is one click away.</p>}
        </div>

        <div ref={scrollRef} className="max-h-[46vh] overflow-y-auto px-6 py-5 space-y-4">
          {SUMMARY.map((s, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <h3 className="text-sm font-semibold text-[var(--fg)]">{s.t}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{s.b}</p>
            </div>
          ))}
          <a
            href="/trading-agreement"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/5 px-4 py-3 text-center text-sm font-medium text-[var(--gold)] no-underline transition hover:bg-[var(--gold)]/10"
          >
            Read the full Trading Agreement &amp; Risk Disclosure →
          </a>
          <div className="pt-1 text-center text-[11px] text-[var(--muted)]">End of summary · full agreement opens in a new tab</div>
        </div>

        <div className="border-t border-[var(--border)] p-6">
          {!scrolled && (
            <p className="mb-3 text-center text-xs text-amber-500">
              Please scroll to the bottom of the summary to enable your signature.
            </p>
          )}

          <label className={`flex items-start gap-3 rounded-xl border p-4 transition ${scrolled ? "border-[var(--border)] cursor-pointer" : "border-[var(--border)] opacity-40 cursor-not-allowed"}`}>
            <input
              type="checkbox"
              checked={agreed}
              disabled={!scrolled}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--gold)]"
            />
            <span className="text-sm leading-relaxed text-[var(--fg)]">
              <b>I have read the full agreement and accept the holding period and risk disclosures.</b>{" "}
              I understand profits are not guaranteed, that early principal withdrawal costs 50%, and that I invest at my own risk. I accept the Terms of Service and Privacy Policy.
            </span>
          </label>

          {error && <p className="mt-3 text-center text-xs text-loss">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!agreed || !scrolled || loading}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Saving…" : "Sign & Agree"}
          </button>
          <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
            Signing records your acceptance against your account. Links: <a className="underline" href="/terms" target="_blank" rel="noopener noreferrer">Terms</a> · <a className="underline" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
