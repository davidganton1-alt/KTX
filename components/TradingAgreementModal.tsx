"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const AGREEMENT_SECTIONS = [
  {
    title: "1. Nature of the Service",
    body: "KingdomTradeX provides an AI-powered trading engine that executes trades across cryptocurrencies, U.S. stocks, and commodities on your behalf. You entrust your deposited funds to the engine under the plan and tier you have selected. The engine trades autonomously; you do not direct individual trades.",
  },
  {
    title: "2. Substantial Risk of Loss",
    body: "Trading financial instruments involves substantial risk of loss, including the possible loss of some or all of your deposited principal. Markets are volatile and unpredictable. Even well-designed trading strategies can and do lose money. You must carefully consider whether trading is suitable for you in light of your financial condition.",
  },
  {
    title: "3. No Guarantee of Profits",
    body: "No profits are guaranteed. The daily rates, projected returns, and example calculations shown on the platform are targets and illustrations only — they are not promises, guarantees, or predictions of future performance. Past performance of the engine is not indicative of future results. Your actual returns may be higher, lower, or negative.",
  },
  {
    title: "4. You Trade at Your Own Risk",
    body: "By using the platform, you acknowledge and agree that you trade at your own risk. You are solely responsible for the decision to deposit funds and for any losses that occur. KingdomTradeX does not guarantee the safety of your principal and is not liable for trading losses beyond the limitations set out in our Terms of Service.",
  },
  {
    title: "5. Not Investment Advice",
    body: "Nothing on the platform constitutes financial, investment, legal, or tax advice. KingdomTradeX provides a technology and stewardship framework — not personalized guidance. You are solely responsible for your own investment decisions and should consult independent professional advisors where appropriate.",
  },
  {
    title: "6. AI Engine Behavior",
    body: "The AI engine makes autonomous decisions about which assets to trade, when to enter and exit positions, and how to size trades. It is designed to manage risk through diversification and drawdown guardrails, but no strategy eliminates risk entirely. The engine's decisions are logged and visible in your dashboard.",
  },
  {
    title: "7. Holding Periods and Withdrawals",
    body: "Each tier has a holding period during which your principal is intended to remain active in the engine (6 months for Faithful, 9 months for Steward, 12 months for Ambassador). Early withdrawal of principal incurs a 25% deduction. Your accrued profit is withdrawable at any time, subject to routine fraud-prevention review.",
  },
  {
    title: "8. The Free $50 Welcome Credit",
    body: "Where offered, the free $50 welcome credit is a promotional gift that trades alongside your deposit under the same engine rules. It is not withdrawable as principal. Profit generated from the credit becomes withdrawable only after you have activated your own deposit.",
  },
  {
    title: "9. Official Website",
    body: "This is the ONLY official KingdomTradeX website. No other person, website, social media channel, or organization is authorized to act on our behalf or collect funds in our name. Always verify you are on this official site before logging in or depositing.",
  },
  {
    title: "10. Your Acknowledgment",
    body: "By checking \"I have read and agree\" below and clicking Continue, you confirm that you have read this Trading Agreement in full, that you understand the risks described above, that you accept that profits are not guaranteed, and that you agree to trade at your own risk under the Terms of Service and Privacy Policy of KingdomTradeX.",
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
        className="w-full max-w-3xl rounded-2xl border border-[var(--gold)]/30 bg-[var(--bg-soft)] shadow-2xl"
      >
        <div className="border-b border-[var(--border)] p-6">
          <p className="eyebrow">Required before you continue</p>
          <h2 className="section-title mt-2 text-2xl md:text-3xl">
            Trading <span className="gradient-text">Agreement</span>
          </h2>
          {userName && <p className="mt-2 text-xs text-[var(--muted)]">Welcome, <b className="text-[var(--fg)]">{userName}</b>. Please read this agreement carefully before you begin.</p>}
        </div>

        <div
          ref={scrollRef}
          className="max-h-[55vh] overflow-y-auto px-6 py-5 space-y-5"
        >
          {AGREEMENT_SECTIONS.map((s, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5">
              <h3 className="text-base font-bold text-[var(--fg)]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.body}</p>
            </div>
          ))}
          <div className="pt-2 text-center text-xs text-[var(--muted)]">— End of Trading Agreement —</div>
        </div>

        <div className="border-t border-[var(--border)] p-6">
          {!scrolled && (
            <p className="mb-3 text-center text-xs text-amber-500">
              Please scroll to the bottom of the agreement to enable your signature.
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
              <b>I have read the entire Trading Agreement above.</b> I understand that trading involves substantial risk of loss, that profits are <b>not guaranteed</b>, and that I am trading at my own risk. I accept the Terms of Service and Privacy Policy of KingdomTradeX.
            </span>
          </label>

          {error && <p className="mt-3 text-center text-xs text-loss">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!agreed || loading}
            className="btn-gold mt-4 w-full disabled:opacity-50"
          >
            {loading ? "Saving your agreement..." : "I Agree — Enter Dashboard"}
          </button>

          <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
            You can re-read the full{" "}
            <a href="/terms" target="_blank" className="text-[var(--gold)] hover:underline">Terms of Service</a> and{" "}
            <a href="/privacy" target="_blank" className="text-[var(--gold)] hover:underline">Privacy Policy</a> anytime.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
