"use client";
import { motion, AnimatePresence } from "framer-motion";

const TIERS = [
  {
    id: "faithful",
    name: "Faithful",
    threshold: 100,
    color: "from-amber-500 to-amber-600",
    rate: "0.50%",
    features: [
      "Basic AI trading access",
      "Daily profit withdrawal",
      "Standard support",
      "5 trades per day",
    ],
    locked: ["Priority withdrawal", "Advanced analytics", "Dedicated support"],
  },
  {
    id: "steward",
    name: "Steward",
    threshold: 650,
    color: "from-cyan-500 to-cyan-600",
    rate: "0.75%",
    features: [
      "Everything in Faithful",
      "Priority withdrawal (instant)",
      "Advanced analytics dashboard",
      "15 trades per day",
      "Email support (24h response)",
    ],
    locked: ["Dedicated account manager", "Custom strategies"],
  },
  {
    id: "ambassador",
    name: "Ambassador",
    threshold: 2000,
    color: "from-[var(--gold)] to-amber-500",
    rate: "1.00%",
    features: [
      "Everything in Steward",
      "Dedicated account manager",
      "Custom AI strategies",
      "Unlimited trades",
      "VIP support (1h response)",
      "Early access to new features",
    ],
    locked: [],
  },
];

export function TierComparison({ currentTier, deposited, isOpen, onClose }: {
  currentTier: string;
  deposited: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0B0F19] p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Choose Your Path</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
          </div>

          <p className="text-sm text-slate-400 mb-8">
            Your current deposit: <b className="text-white">${deposited.toLocaleString()}</b> ·
            Current tier: <b className="text-[var(--gold)] capitalize">{currentTier}</b>
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((tier) => {
              const isCurrent = currentTier === tier.id;
              const isUnlocked = deposited >= tier.threshold;
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-xl border p-5 ${
                    isCurrent
                      ? "border-[var(--gold)] bg-[var(--gold)]/5"
                      : isUnlocked
                      ? "border-white/20 bg-white/[0.02]"
                      : "border-white/5 bg-white/[0.01] opacity-70"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gold)] px-3 py-0.5 text-[10px] font-bold text-black">
                      CURRENT
                    </span>
                  )}
                  <div className={`inline-block rounded-lg bg-gradient-to-r ${tier.color} px-3 py-1 text-xs font-bold text-white`}>
                    {tier.name}
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-white">{tier.rate}<span className="text-sm text-slate-400"> / day</span></p>
                  <p className="mt-1 text-xs text-slate-500">Min. deposit: ${tier.threshold.toLocaleString()}</p>

                  <div className="mt-4 space-y-2">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                    {tier.locked.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="text-slate-600 mt-0.5">🔒</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {!isUnlocked && (
                    <p className="mt-4 text-[10px] text-amber-400">
                      Deposit ${(tier.threshold - deposited).toLocaleString()} more to unlock
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="rounded-lg bg-[var(--gold)] px-8 py-3 text-sm font-bold text-black transition hover:brightness-110"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
