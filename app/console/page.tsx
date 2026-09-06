"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { TradeEngine } from "@/components/TradeEngine";
import { GlowCard } from "@/components/GlowCard";

// --- Types (matching your existing API contracts) ---
type WalletState = {
  balance: number;
  profit: number;
  freeCredit: number;
  freeCreditUnlocked: boolean;
  deposited: number;
  tier: "none" | "faithful" | "steward" | "ambassador";
  dailyRate: number;
  holdMonths: number;
  profitHistory: { date: string; profit: number }[];
};

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "wallet", label: "Wallet", icon: "💼" },
  { id: "ai-engine", label: "AI Engine", icon: "🧠" },
  { id: "markets", label: "Markets", icon: "📈" },
  { id: "referrals", label: "Referrals", icon: "🤝" },
  { id: "pastor", label: "Pastor Hub", icon: "✝️" },
  { id: "calendar", label: "Profit Calendar", icon: "📅" },
  { id: "insights", label: "Insights", icon: "💡" },
  { id: "reports", label: "Reports", icon: "📑" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "support", label: "Support", icon: "🎧" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const TOUR_STEPS = [
  { id: "tour-balance", title: "Your Total Balance", desc: "This includes your principal, accrued profit, and your $50 free credit (once unlocked)." },
  { id: "tour-actions", title: "Quick Actions", desc: "Deposit funds to activate your plan, or withdraw your daily profit instantly with zero friction." },
  { id: "tour-engine", title: "Live AI Engine", desc: "Watch the AI trade in real-time. Every decision is logged, guarded, and transparent." },
  { id: "tour-calendar", title: "Profit Calendar", desc: "Your daily earnings heatmap. Consistency is the hallmark of true stewardship." },
];

export default function ConsolePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [tourStep, setTourStep] = useState(0); // 0 = closed, 1-4 = active
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/wallet/state", { cache: "no-store" });
        if (res.ok) setWallet(await res.json());
        
        // Check if tour should run
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const me = await meRes.json();
        if (me && !me.hasSeenTour) {
          setTimeout(() => setTourStep(1), 1000); // Start tour after 1s
        }
      } catch (e) { console.error("Failed to load console data", e); }
      // Note: /api/wallet/tick polling would go here
    }
    loadData();
  }, []);

  async function completeTour() {
    setTourStep(0);
    try { await fetch("/api/user/tour", { method: "POST" }); } catch {}
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const tierColors = { none: "text-[var(--muted)]", faithful: "text-amber-400", steward: "text-cyan-400", ambassador: "text-[var(--gold)]" };
  const tierLabels = { none: "Unranked", faithful: "Faithful", steward: "Steward", ambassador: "Ambassador" };

  if (!wallet) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>;

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[var(--border)] bg-[var(--bg-soft)] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-center border-b border-[var(--border)]">
          <span className="text-xl font-bold text-[var(--gold)]">KTX Console</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === tab.id ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--fg)]"}`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-0 w-full px-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-loss hover:bg-loss/10">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/80 px-6 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-2xl text-[var(--muted)]">☰</button>
          <div className="ml-auto flex items-center gap-4">
            <span className={`rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold uppercase ${tierColors[wallet.tier]}`}>
              {tierLabels[wallet.tier]}
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-light to-royal-violet" />
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {/* Dashboard View */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Row 1: Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div id="tour-balance" className="relative">
                  <GlowCard className="p-6">
                  <p className="text-sm text-[var(--muted)]">Total Balance</p>
                  <p className="mt-2 text-3xl font-extrabold tabular-nums">
                    $<AnimatedNumber value={wallet.balance} />
                  </p>
                  {!wallet.freeCreditUnlocked && <p className="mt-2 text-xs text-[var(--gold)]">🔒 Deposit to unlock $50 free credit</p>}
                  </GlowCard>
                </div>
                <GlowCard className="p-6">
                  <p className="text-sm text-[var(--muted)]">Withdrawable Profit</p>
                  <p className="mt-2 text-3xl font-extrabold text-profit tabular-nums">
                    $<AnimatedNumber value={wallet.profit} />
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">Target: { (wallet.dailyRate * 100).toFixed(2) }% / day</p>
                </GlowCard>
                <GlowCard className="p-6">
                  <p className="text-sm text-[var(--muted)]">Deposited Principal</p>
                  <p className="mt-2 text-3xl font-extrabold tabular-nums">
                    $<AnimatedNumber value={wallet.deposited} />
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">Hold period: {wallet.holdMonths} months</p>
                </GlowCard>
              </div>

              {/* Row 2: Quick Actions */}
              <div id="tour-actions" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <button className="rounded-xl bg-gradient-to-r from-profit to-cyan-light p-4 text-left font-bold text-white shadow-lg transition hover:brightness-110">
                  <span className="text-2xl">💰</span>
                  <p className="mt-2">Deposit Funds</p>
                </button>
                <button disabled={wallet.profit <= 0} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left font-bold text-[var(--fg)] transition hover:border-[var(--gold)] disabled:opacity-50">
                  <span className="text-2xl">💸</span>
                  <p className="mt-2">Withdraw Profit</p>
                </button>
                <button onClick={() => setActiveTab("ai-engine")} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left font-bold text-[var(--fg)] transition hover:border-[var(--gold)]">
                  <span className="text-2xl">🧠</span>
                  <p className="mt-2">View AI Engine</p>
                </button>
                <button onClick={() => setActiveTab("referrals")} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left font-bold text-[var(--fg)] transition hover:border-[var(--gold)]">
                  <span className="text-2xl">🤝</span>
                  <p className="mt-2">My Referrals</p>
                </button>
              </div>

              {/* Row 3: Engine & Calendar */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div id="tour-engine" className="lg:col-span-2">
                  <GlowCard className="p-6">
                    <h3 className="mb-4 text-lg font-bold">Live AI Execution</h3>
                    <TradeEngine demo />
                  </GlowCard>
                </div>
                <div id="tour-calendar" className="lg:col-span-1">
                  <GlowCard className="p-6">
                    <h3 className="mb-4 text-lg font-bold">Profit Calendar</h3>
                    {(() => {
                      // Build a lookup map from date → profit
                      const profitMap = new Map<string, number>();
                      (wallet.profitHistory ?? []).forEach((entry) => {
                        if (entry.date && entry.profit > 0) profitMap.set(entry.date, entry.profit);
                      });

                      // Generate the last 42 days (oldest first, matching GitHub style)
                      const days: { date: string; profit: number }[] = [];
                      for (let i = 41; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
                        days.push({ date: dateStr, profit: profitMap.get(dateStr) ?? 0 });
                      }

                      return (
                        <div className="grid grid-cols-7 gap-1">
                          {days.map((day) => (
                            <div
                              key={day.date}
                              className={`aspect-square rounded-sm ${day.profit > 0 ? "bg-profit/60" : "bg-[var(--border)]/30"}`}
                              title={day.profit > 0 ? `${day.date}: +$${day.profit.toFixed(2)}` : `${day.date}: No activity`}
                            />
                          ))}
                        </div>
                      );
                    })()}
                    <p className="mt-3 text-xs text-[var(--muted)]">Daily compounding visualized · last 42 days.</p>
                  </GlowCard>
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs Placeholder (Preserve your existing logic here) */}
          {activeTab !== "dashboard" && (
            <GlowCard className="flex h-96 items-center justify-center p-8">
              <p className="text-lg text-[var(--muted)]">
                {TABS.find(t => t.id === activeTab)?.label} module loading... <br/>
                <span className="text-xs">(Preserve your existing tab logic here)</span>
              </p>
            </GlowCard>
          )}
        </div>
      </main>

      {/* ── ONBOARDING TOUR OVERLAY ── */}
      <AnimatePresence>
        {tourStep > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setTourStep(0)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--gold)] bg-[var(--card)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">Step {tourStep} of {TOUR_STEPS.length}</span>
                <button onClick={() => setTourStep(0)} className="text-sm text-[var(--muted)] hover:text-[var(--fg)]">Skip Tour</button>
                <div className="absolute right-4 top-4">
                  <button onClick={() => setTourStep(0)} className="text-xl text-[var(--muted)] hover:text-[var(--fg)]">×</button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold">{TOUR_STEPS[tourStep - 1].title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{TOUR_STEPS[tourStep - 1].desc}</p>
              
              <div className="mt-6 flex justify-end gap-3">
                {tourStep < TOUR_STEPS.length ? (
                  <button onClick={() => setTourStep(tourStep + 1)} className="btn-gold">Next</button>
                ) : (
                  <button onClick={completeTour} className="btn-primary">Get Started</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
