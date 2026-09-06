"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ProEngine } from "@/components/ProEngine";
import { TierComparison } from "@/components/TierComparison";
import { PortfolioChart } from "@/components/PortfolioChart";
import { SpotlightTour } from "@/components/SpotlightTour";

const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const TOUR_STEPS = [
  { id: "tour-balance", title: "Your Portfolio", desc: "This is your total balance, including your principal and accrued profit. Watch it grow daily." },
  { id: "tour-actions", title: "Quick Actions", desc: "Deposit funds to activate your plan, or withdraw your profit instantly. No locks, no friction." },
  { id: "tour-engine", title: "Live AI Engine", desc: "This is your trading desk. The AI executes trades in real-time with strict risk guardrails. You can watch every move." },
  { id: "tour-sidebar", title: "Command Center", desc: "Access your wallet, referrals, security, and settings from here. Everything you need is one click away." },
];

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "wallet", label: "Wallet", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { id: "ai-engine", label: "AI Engine", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
  { id: "markets", label: "Markets", icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" },
  { id: "referrals", label: "Referrals", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { id: "security", label: "Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  { id: "support", label: "Support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" },
  { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default function ConsolePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wallet, setWallet] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [engineSymbol, setEngineSymbol] = useState("BTC");
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [wRes, meRes, rRes] = await Promise.all([
          fetch("/api/wallet/state", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/user/referral", { cache: "no-store" }),
        ]);
        if (wRes.ok) setWallet(await wRes.json());
        if (meRes.ok) setMe(await meRes.json());
        if (rRes.ok) setReferral(await rRes.json());
      } catch {}
    }
    load();
  }, []);

  useEffect(() => {
    const handleNext = () => setTourStep(s => s + 1);
    window.addEventListener("tour-next", handleNext);
    return () => window.removeEventListener("tour-next", handleNext);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    setActionMsg("Processing deposit...");
    try {
      const res = await fetch("/api/wallet/deposit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(depositAmount) }) });
      const data = await res.json();
      if (res.ok) { setActionMsg(`Deposit of $${Number(depositAmount).toFixed(2)} successful!`); setDepositAmount(""); loadWallet(); }
      else setActionMsg(data.error || "Deposit failed.");
    } catch { setActionMsg("Network error."); }
  }

  async function handleWithdraw() {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    setActionMsg("Processing withdrawal...");
    try {
      const res = await fetch("/api/wallet/withdraw", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(withdrawAmount) }) });
      const data = await res.json();
      if (res.ok) { setActionMsg(`Withdrawal of $${Number(withdrawAmount).toFixed(2)} successful!`); setWithdrawAmount(""); loadWallet(); }
      else setActionMsg(data.error || "Withdrawal failed.");
    } catch { setActionMsg("Network error."); }
  }

  async function loadWallet() {
    const res = await fetch("/api/wallet/state", { cache: "no-store" });
    if (res.ok) setWallet(await res.json());
  }

  async function completeTour() {
    setTourStep(0);
    try { await fetch("/api/user/tour", { method: "POST" }); } catch {}
  }

  if (!wallet) return <div className="flex min-h-screen items-center justify-center bg-[#05080F]"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>;

  const tierLabels: Record<string, string> = { none: "Unranked", faithful: "Faithful", steward: "Steward", ambassador: "Ambassador" };
  const tierColors: Record<string, string> = { none: "text-slate-400", faithful: "text-amber-400", steward: "text-cyan-400", ambassador: "text-[var(--gold)]" };
  const nextTier = wallet.tier === "none" ? "faithful" : wallet.tier === "faithful" ? "steward" : wallet.tier === "steward" ? "ambassador" : null;
  const tierThresholds: Record<string, number> = { none: 0, faithful: 100, steward: 650, ambassador: 2000 };
  const progress = nextTier ? Math.min(100, (wallet.deposited / tierThresholds[nextTier]) * 100) : 100;

  return (
    <div className="flex min-h-screen bg-[#05080F] text-slate-300 font-sans">
      {/* SIDEBAR */}
      <aside id="tour-sidebar" className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 bg-[#0B0F19] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-center border-b border-white/5">
          <span className="text-xl font-bold tracking-tight text-white">KTX <span className="text-[var(--gold)]">Console</span></span>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 w-full px-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#05080F]/80 px-6 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 lg:hidden">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h2 className="text-lg font-bold text-white">{TABS.find(t => t.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-4">
            <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase ${tierColors[wallet.tier]}`}>{tierLabels[wallet.tier]}</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* ═══ DASHBOARD ═══ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div id="tour-balance" className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Total Balance</p>
                  <p className="mt-2 text-3xl font-extrabold text-white tabular-nums">$<AnimatedNumber value={wallet.balance} /></p>
                  {!wallet.freeCreditUnlocked && <p className="mt-2 text-xs text-amber-500">🔒 Deposit to unlock $50 free credit</p>}
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Withdrawable Profit</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-400 tabular-nums">$<AnimatedNumber value={wallet.profit} /></p>
                  <p className="mt-2 text-xs text-slate-500">Target: {(wallet.dailyRate * 100).toFixed(2)}% / day</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Deposited Principal</p>
                  <p className="mt-2 text-3xl font-extrabold text-white tabular-nums">$<AnimatedNumber value={wallet.deposited} /></p>
                  <p className="mt-2 text-xs text-slate-500">Hold: {wallet.holdMonths} months</p>
                </div>
              </div>

              {/* Tier Progress */}
              {nextTier && (
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">Progress to <span className={tierColors[nextTier]}>{tierLabels[nextTier]}</span></p>
                    <span className="text-xs text-slate-500">${fmt(wallet.deposited)} / ${fmt(tierThresholds[nextTier])}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-amber-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div id="tour-actions" className="grid gap-4 md:grid-cols-3">
                <button onClick={() => setActiveTab("wallet")} className="group rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-left transition hover:bg-emerald-500/20">
                  <span className="text-2xl text-emerald-400">💰</span>
                  <p className="mt-2 font-bold text-emerald-400">Deposit Funds</p>
                  <p className="mt-1 text-xs text-slate-500">Activate your plan & unlock credit</p>
                </button>
                <button onClick={() => setActiveTab("wallet")} disabled={wallet.profit <= 0} className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:bg-white/[0.05] disabled:opacity-40">
                  <span className="text-2xl text-slate-300">💸</span>
                  <p className="mt-2 font-bold text-white">Withdraw Profit</p>
                  <p className="mt-1 text-xs text-slate-500">Instant, zero friction</p>
                </button>
                <button onClick={() => setActiveTab("ai-engine")} className="group rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/10 p-5 text-left transition hover:bg-[var(--gold)]/20">
                  <span className="text-2xl text-[var(--gold)]">🧠</span>
                  <p className="mt-2 font-bold text-[var(--gold)]">AI Engine</p>
                  <p className="mt-1 text-xs text-slate-500">Watch live execution</p>
                </button>
              </div>

              {/* Portfolio Allocation + Tier Button */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <PortfolioChart deposited={wallet.deposited} profit={wallet.profit} freeCredit={wallet.freeCreditUnlocked ? 50 : 0} />
                </div>
                <button
                  onClick={() => setShowTierModal(true)}
                  className="rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-6 text-left transition hover:bg-[var(--gold)]/10"
                >
                  <span className="text-2xl">👑</span>
                  <p className="mt-2 font-bold text-[var(--gold)]">Compare Tiers</p>
                  <p className="mt-1 text-xs text-slate-500">See what each tier unlocks and how to upgrade</p>
                </button>
              </div>

              {/* Engine Preview */}
              <div id="tour-engine">
                <ProEngine initialSymbol="BTC" />
              </div>
            </div>
          )}

          {/* ═══ WALLET ═══ */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <h3 className="text-lg font-bold text-white">Deposit Funds</h3>
                  <p className="mt-2 text-sm text-slate-500">Add funds to activate your plan and unlock the $50 free credit.</p>
                  <div className="mt-4 flex gap-3">
                    <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" min="1"
                      className="flex-1 rounded-lg border border-white/10 bg-[#05080F] px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]" />
                    <button onClick={handleDeposit} disabled={!depositAmount || Number(depositAmount) <= 0}
                      className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50">Deposit</button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {[100, 500, 1000, 2500].map(a => (
                      <button key={a} onClick={() => setDepositAmount(String(a))} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:border-[var(--gold)] hover:text-[var(--gold)]">${a}</button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <h3 className="text-lg font-bold text-white">Withdraw Profit</h3>
                  <p className="mt-2 text-sm text-slate-500">Available: <b className="text-emerald-400">${fmt(wallet.profit)}</b>. Withdraw your daily profit anytime.</p>
                  <div className="mt-4 flex gap-3">
                    <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" min="1" max={wallet.profit}
                      className="flex-1 rounded-lg border border-white/10 bg-[#05080F] px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]" />
                    <button onClick={handleWithdraw} disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || wallet.profit <= 0}
                      className="rounded-lg bg-[var(--gold)] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50">Withdraw</button>
                  </div>
                  <button onClick={() => setWithdrawAmount(String(wallet.profit))} className="mt-3 text-xs text-[var(--gold)] hover:underline">Withdraw all (${fmt(wallet.profit)})</button>
                </div>
              </div>

              {actionMsg && <div className="rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-4 text-center text-sm text-[var(--gold)]">{actionMsg}</div>}

              <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                <h3 className="mb-4 text-lg font-bold text-white">Transaction History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead><tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-500">
                      <th className="px-2 py-2">Date</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Amount</th><th className="px-2 py-2">Status</th>
                    </tr></thead>
                    <tbody>
                      {(wallet.deposits ?? []).map((d: any, i: number) => (
                        <tr key={`d${i}`} className="border-b border-white/5">
                          <td className="px-2 py-2 text-slate-500">{fmtDate(d.date)}</td>
                          <td className="px-2 py-2 font-bold text-emerald-400">Deposit</td>
                          <td className="px-2 py-2 text-white">${fmt(d.amount)}</td>
                          <td className="px-2 py-2 capitalize text-slate-500">{d.status}</td>
                        </tr>
                      ))}
                      {(wallet.withdrawals ?? []).map((w: any, i: number) => (
                        <tr key={`w${i}`} className="border-b border-white/5">
                          <td className="px-2 py-2 text-slate-500">{fmtDate(w.date)}</td>
                          <td className="px-2 py-2 font-bold text-red-400">Withdrawal</td>
                          <td className="px-2 py-2 text-white">${fmt(w.amount)}</td>
                          <td className="px-2 py-2 capitalize text-slate-500">{w.status}</td>
                        </tr>
                      ))}
                      {(wallet.deposits ?? []).length === 0 && (wallet.withdrawals ?? []).length === 0 && (
                        <tr><td colSpan={4} className="px-2 py-6 text-center text-slate-500">No transactions yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ AI ENGINE ═══ */}
          {activeTab === "ai-engine" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">AI Trade Engine — Live Terminal</h3>
                <span className="text-xs text-slate-500">Real-time execution · 500ms refresh · 5s candles</span>
              </div>
              <ProEngine initialSymbol="BTC" />
            </div>
          )}

          {/* ═══ MARKETS ═══ */}
          {activeTab === "markets" && <MarketsGrid />}

          {/* ═══ REFERRALS ═══ */}
          {activeTab === "referrals" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6"><p className="text-sm text-slate-500">Total Referrals</p><p className="mt-2 text-3xl font-extrabold text-white">{referral?.referrals?.length ?? 0}</p></div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6"><p className="text-sm text-slate-500">Bonus Earned</p><p className="mt-2 text-3xl font-extrabold text-emerald-400">${fmt(referral?.bonusEarned ?? 0)}</p></div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6"><p className="text-sm text-slate-500">Your Code</p><p className="mt-2 text-2xl font-extrabold text-[var(--gold)] font-mono">{referral?.code ?? "—"}</p></div>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                <h3 className="mb-4 text-lg font-bold text-white">Your Referral Link</h3>
                <div className="flex gap-2">
                  <input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referral?.code ?? ""}`}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 rounded-lg border border-white/10 bg-[#05080F] px-4 py-3 font-mono text-xs text-[var(--gold)] outline-none" />
                  <button onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referral?.code}`); setActionMsg("Link copied!"); setTimeout(() => setActionMsg(""), 2000); } catch {} }}
                    className="rounded-lg bg-[var(--gold)] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110">Copy</button>
                </div>
                {actionMsg && <p className="mt-2 text-xs text-[var(--gold)]">{actionMsg}</p>}
              </div>
            </div>
          )}

          {/* ═══ SECURITY ═══ */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                <h3 className="text-lg font-bold text-white">Account Security</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div><p className="font-bold text-white">Email Verification</p><p className="text-xs text-slate-500">Your email is verified and secure</p></div>
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">✓ Verified</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div><p className="font-bold text-white">Two-Factor Authentication</p><p className="text-xs text-slate-500">Add an extra layer of security</p></div>
                    <button className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-300 hover:border-[var(--gold)] hover:text-[var(--gold)]">Enable</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SUPPORT ═══ */}
          {activeTab === "support" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="text-lg font-bold text-white">Support Center</h3>
              <p className="mt-2 text-sm text-slate-500">Need help? Our team is here for you.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <a href="/faq" className="rounded-xl border border-white/10 p-4 transition hover:border-[var(--gold)]">
                  <p className="font-bold text-white">FAQ</p><p className="mt-1 text-xs text-slate-500">Answers to common questions</p>
                </a>
                <a href="mailto:support@kingdomtradex.com" className="rounded-xl border border-white/10 p-4 transition hover:border-[var(--gold)]">
                  <p className="font-bold text-white">Email Support</p><p className="mt-1 text-xs text-slate-500">support@kingdomtradex.com</p>
                </a>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {activeTab === "settings" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="text-lg font-bold text-white">Account Settings</h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-sm font-bold text-white">Display Name</p>
                  <p className="mt-1 text-sm text-slate-500">{me?.name ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-sm font-bold text-white">Current Tier</p>
                  <p className={`mt-1 text-sm font-bold ${tierColors[wallet.tier]}`}>{tierLabels[wallet.tier]}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* TOUR */}
      <SpotlightTour steps={TOUR_STEPS} activeStep={tourStep} onComplete={completeTour} />

      {/* Tier Comparison Modal */}
      <TierComparison
        currentTier={wallet.tier}
        deposited={wallet.deposited}
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
      />
    </div>
  );
}

function MarketsGrid() {
  const [assets, setAssets] = useState<any[]>([]);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/markets", { cache: "no-store" });
        if (res.ok) { const d = await res.json(); setAssets(d.assets || []); }
      } catch {}
    }
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  if (assets.length === 0) return <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {assets.map((a) => {
        const up = a.change24h >= 0;
        return (
          <div key={a.id} className="rounded-xl border border-white/5 bg-[#0B0F19] p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">{a.symbol}</p>
              <span className={`text-xs font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>{up ? "+" : ""}{a.change24h.toFixed(1)}%</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{a.name}</p>
            <p className="mt-2 text-lg font-extrabold text-white tabular-nums">${fmt(a.price)}</p>
          </div>
        );
      })}
    </div>
  );
}
