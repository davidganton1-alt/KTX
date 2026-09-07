"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const AGREEMENT_SECTIONS = [
  {
    title: "1. Welcome to KingdomTradeX",
    body: "KingdomTradeX is a faith-driven investment platform. When you deposit funds, you entrust them to our AI trading engine, which trades across cryptocurrencies, U.S. stocks, and commodities on your behalf. You choose your plan and tier, and the engine handles the trading. You never place individual trades yourself.",
  },
  {
    title: "2. How the AI Engine Works",
    body: "The engine watches live prices, volume, and order flow, then runs them through forecasting models and a volatility filter before every trade. Each position is sized against strict drawdown limits, so no single move can undo your plan. You can watch every decision live in your dashboard.",
  },
  {
    title: "3. Your Plan, Holding Period, and Withdrawals",
    body: "Each tier has a holding period: 6 months for Faithful, 9 months for Steward, and 12 months for Ambassador. During this time your principal stays active in the engine. Your accrued profit is withdrawable at any time. If you withdraw your principal before the holding period ends, a 25% deduction applies to cover engine rebalancing.",
  },
  {
    title: "4. Your Free $50 Welcome Credit",
    body: "Where offered, the free $50 welcome credit is a gift that trades alongside your deposit under the same engine rules. It is not withdrawable as principal. Any profit it earns becomes withdrawable once you activate your own deposit.",
  },
  {
    title: "5. Trading Involves Real Risk",
    body: "We want to be straight with you: trading financial markets carries a real risk of loss, including the possibility of losing some or all of your deposited principal. Markets are volatile and hard to predict. Even a well-designed strategy can lose money. Please only invest money you can afford to put at risk.",
  },
  {
    title: "6. Profits Are Not Guaranteed",
    body: "No profit is guaranteed, ever. The daily rates and projected returns you see on the platform are targets and illustrations, not promises. Past performance does not predict future results. Your actual returns may be higher, lower, or negative.",
  },
  {
    title: "7. You Trade at Your Own Risk",
    body: "By using the platform, you confirm that you understand the risks and that you trade at your own risk. You are responsible for your decision to deposit funds and for any losses that may occur. KingdomTradeX does not guarantee the safety of your principal.",
  },
  {
    title: "8. This Is Not Investment Advice",
    body: "Nothing on this platform counts as financial, investment, legal, or tax advice. We provide a technology and stewardship framework, not personalized guidance. You are responsible for your own investment decisions, and we encourage you to speak with an independent advisor if you need one.",
  },
  {
    title: "9. This Is the Only Official Website",
    body: "This is the only official KingdomTradeX website. No other person, page, channel, or group is allowed to act for us or collect money in our name. Always check that you are on this site before you log in or deposit. If someone else claims to represent us, do not send them money, and report it to us right away.",
  },
  {
    title: "10. Your Acknowledgment",
    body: "By checking the box below and clicking Continue, you confirm that you have read this whole agreement. You understand that trading carries real risk, that profits are not guaranteed, and that you trade at your own risk. You accept our Terms of Service and Privacy Policy, and you are ready to begin.",
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
              <b>I have read the full Trading Agreement above.</b> I understand that trading carries real risk, that profits are <b>not guaranteed</b>, and that I trade at my own risk. I accept the Terms of Service and Privacy Policy.
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
