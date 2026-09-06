"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { DashCard } from "@/components/DashCard";
import { DashEngine } from "@/components/DashEngine";

type WalletState = {
  balance: number; profit: number; freeCredit: number; freeCreditUnlocked: boolean;
  deposited: number; tier: "none" | "faithful" | "steward" | "ambassador";
  dailyRate: number; holdMonths: number; profitHistory: { date: string; profit: number }[];
  deposits: { amount: number; date: number; status: string }[];
  withdrawals: { amount: number; date: number; status: string; type: string }[];
};

type ReferralData = { code: string; referrals: { name: string; email: string; tier: string; deposited: number }[]; bonusEarned: number };
type MeData = { role: string; name: string; isPastor: boolean; hasSeenTour: boolean };

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "wallet", label: "Wallet", icon: "💼" },
  { id: "ai-engine", label: "AI Engine", icon: "🧠" },
  { id: "markets", label: "Markets", icon: "📈" },
  { id: "referrals", label: "Referrals", icon: "🤝" },
  { id: "calendar", label: "Profit Calendar", icon: "📅" },
  { id: "insights", label: "Insights", icon: "💡" },
  { id: "reports", label: "Reports", icon: "📑" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "support", label: "Support", icon: "🎧" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function ConsolePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [me, setMe] = useState<MeData | null>(null);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [engineSymbol, setEngineSymbol] = useState("BTC");

  // Load data
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
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  async function handleDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    setActionMsg("Processing deposit...");
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Deposit of $${Number(depositAmount).toFixed(2)} successful!`);
        setDepositAmount("");
        const wRes = await fetch("/api/wallet/state", { cache: "no-store" });
        if (wRes.ok) setWallet(await wRes.json());
      } else setActionMsg(data.error || "Deposit failed.");
    } catch { setActionMsg("Network error."); }
  }

  async function handleWithdrawProfit() {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    setActionMsg("Processing withdrawal...");
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(withdrawAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Withdrawal of $${Number(withdrawAmount).toFixed(2)} successful!`);
        setWithdrawAmount("");
        const wRes = await fetch("/api/wallet/state", { cache: "no-store" });
        if (wRes.ok) setWallet(await wRes.json());
      } else setActionMsg(data.error || "Withdrawal failed.");
    } catch { setActionMsg("Network error."); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!wallet) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>;

  const tierLabels = { none: "Unranked", faithful: "Faithful", steward: "Steward", ambassador: "Ambassador" };
  const tierColors = { none: "text-[var(--muted)]", faithful: "text-amber-400", steward: "text-cyan-400", ambassador: "text-[var(--gold)]" };
  const nextTier = wallet.tier === "none" ? "faithful" : wallet.tier === "faithful" ? "steward" : wallet.tier === "steward" ? "ambassador" : null;
  const tierThresholds = { none: 0, faithful: 100, steward: 650, ambassador: 2000 };
  const progress = nextTier ? Math.min(100, (wallet.deposited / tierThresholds[nextTier as keyof typeof tierThresholds]) * 100) : 100;

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* SIDEBAR */}
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

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/80 px-6 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl text-[var(--muted)] lg:hidden">☰</button>
          <h2 className="text-lg font-bold capitalize">{TABS.find(t => t.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-4">
            <span className={`rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold uppercase ${tierColors[wallet.tier]}`}>{tierLabels[wallet.tier]}</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-light to-royal-violet" />
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {/* ═══ DASHBOARD ═══ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <DashCard className="p-6">
                  <p className="text-sm text-[var(--muted)]">Total Balance</p>
                  <p className="mt-2 text-3xl font-extrabold tabular-nums">$<AnimatedNumber value={wallet.balance} /></p>
                  {!wallet.freeCreditUnlocked && <p className="mt-2 text-xs text-[var(--gold)]">🔒 Deposit to unlock $50 free credit</p>}
                </DashCard>
                <DashCard className="p-6">
                  <p className="text-sm text-[var(--muted)]">Withdrawable Profit</p>
                  <p className="mt-2 text-3xl font-extrabold text-profit tabular-nums">$<AnimatedNumber value={wallet.profit} /></p>
                  <p className="mt-2 text-xs text-[var(--muted)]">Target: {(wallet.dailyRate * 100).toFixed(2)}% / day</p>
                </DashCard>
                <DashCard className="p-6">
                  <p className="text-sm text-[var(--muted)]">Deposited Principal</p>
                  <p className="mt-2 text-3xl font-extrabold tabular-nums">$<AnimatedNumber value={wallet.deposited} /></p>
                  <p className="mt-2 text-xs text-[var(--muted)]">Hold: {wallet.holdMonths} months</p>
                </DashCard>
              </div>

              {/* Tier Progress */}
              {nextTier && (
                <DashCard className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Progress to <span className={tierColors[nextTier as keyof typeof tierColors]}>{tierLabels[nextTier as keyof typeof tierLabels]}</span></p>
                    <span className="text-xs text-[var(--muted)]">${fmt(wallet.deposited)} / ${fmt(tierThresholds[nextTier as keyof typeof tierThresholds])}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[var(--border)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-light to-cyan-light" style={{ width: `${progress}%` }} />
                  </div>
                </DashCard>
              )}

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3">
                <button onClick={() => setActiveTab("wallet")} className="rounded-xl bg-gradient-to-r from-profit to-cyan-light p-5 text-left font-bold text-white shadow-lg">
                  <span className="text-2xl">💰</span><p className="mt-2">Deposit Funds</p>
                </button>
                <button onClick={() => setActiveTab("wallet")} disabled={wallet.profit <= 0} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-left font-bold transition hover:border-[var(--gold)] disabled:opacity-50">
                  <span className="text-2xl">💸</span><p className="mt-2">Withdraw Profit</p>
                </button>
                <button onClick={() => setActiveTab("ai-engine")} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-left font-bold transition hover:border-[var(--gold)]">
                  <span className="text-2xl">🧠</span><p className="mt-2">AI Engine</p>
                </button>
              </div>

              {/* Engine Preview */}
              <DashCard className="p-6">
                <h3 className="mb-4 text-lg font-bold">Live AI Execution</h3>
                <DashEngine symbol={engineSymbol} />
              </DashCard>
            </div>
          )}

          {/* ═══ WALLET ═══ */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Deposit */}
                <DashCard className="p-6">
                  <h3 className="text-lg font-bold">💰 Deposit Funds</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">Add funds to activate your plan and unlock the $50 free credit.</p>
                  <div className="mt-4 flex gap-3">
                    <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" min="1"
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]" />
                    <button onClick={handleDeposit} disabled={!depositAmount || Number(depositAmount) <= 0}
                      className="btn-primary disabled:opacity-50">Deposit</button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {[100, 500, 1000, 2500].map(a => (
                      <button key={a} onClick={() => setDepositAmount(String(a))} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]">${a}</button>
                    ))}
                  </div>
                </DashCard>

                {/* Withdraw */}
                <DashCard className="p-6">
                  <h3 className="text-lg font-bold">💸 Withdraw Profit</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">Available: <b className="text-profit">${fmt(wallet.profit)}</b>. Withdraw your daily profit anytime.</p>
                  <div className="mt-4 flex gap-3">
                    <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" min="1" max={wallet.profit}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]" />
                    <button onClick={handleWithdrawProfit} disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || wallet.profit <= 0}
                      className="btn-gold disabled:opacity-50">Withdraw</button>
                  </div>
                  <button onClick={() => setWithdrawAmount(String(wallet.profit))} className="mt-3 text-xs text-[var(--gold)] hover:underline">Withdraw all (${fmt(wallet.profit)})</button>
                </DashCard>
              </div>

              {actionMsg && <DashCard className="border-[var(--gold)]/40 p-4 text-center text-sm text-[var(--gold)]">{actionMsg}</DashCard>}

              {/* Transaction History */}
              <DashCard className="p-6">
                <h3 className="mb-4 text-lg font-bold">Transaction History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead><tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
                      <th className="px-2 py-2">Date</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Amount</th><th className="px-2 py-2">Status</th>
                    </tr></thead>
                    <tbody>
                      {(wallet.deposits ?? []).map((d, i) => (
                        <tr key={`d${i}`} className="border-b border-[var(--border)]/50">
                          <td className="px-2 py-2 text-[var(--muted)]">{fmtDate(d.date)}</td>
                          <td className="px-2 py-2 font-bold text-profit">Deposit</td>
                          <td className="px-2 py-2">${fmt(d.amount)}</td>
                          <td className="px-2 py-2 capitalize text-[var(--muted)]">{d.status}</td>
                        </tr>
                      ))}
                      {(wallet.withdrawals ?? []).map((w, i) => (
                        <tr key={`w${i}`} className="border-b border-[var(--border)]/50">
                          <td className="px-2 py-2 text-[var(--muted)]">{fmtDate(w.date)}</td>
                          <td className="px-2 py-2 font-bold text-loss">Withdrawal</td>
                          <td className="px-2 py-2">${fmt(w.amount)}</td>
                          <td className="px-2 py-2 capitalize text-[var(--muted)]">{w.status}</td>
                        </tr>
                      ))}
                      {(wallet.deposits ?? []).length === 0 && (wallet.withdrawals ?? []).length === 0 && (
                        <tr><td colSpan={4} className="px-2 py-6 text-center text-[var(--muted)]">No transactions yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </DashCard>
            </div>
          )}

          {/* ═══ AI ENGINE ═══ */}
          {activeTab === "ai-engine" && (
            <div className="space-y-6">
              <DashCard className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-bold">🧠 AI Trade Engine — Live Terminal</h3>
                  <div className="flex gap-2">
                    {["BTC", "ETH", "AAPL", "XAU", "WTI"].map(s => (
                      <button key={s} onClick={() => setEngineSymbol(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${engineSymbol === s ? "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/40" : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--gold)]/50"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <DashEngine symbol={engineSymbol} />
              </DashCard>
            </div>
          )}

          {/* ═══ MARKETS ═══ */}
          {activeTab === "markets" && (
            <DashCard className="p-6">
              <h3 className="mb-4 text-lg font-bold">📈 Live Markets</h3>
              <MarketsGrid />
            </DashCard>
          )}

          {/* ═══ REFERRALS ═══ */}
          {activeTab === "referrals" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <DashCard className="p-6"><p className="text-sm text-[var(--muted)]">Total Referrals</p><p className="mt-2 text-3xl font-extrabold">{referral?.referrals?.length ?? 0}</p></DashCard>
                <DashCard className="p-6"><p className="text-sm text-[var(--muted)]">Bonus Earned</p><p className="mt-2 text-3xl font-extrabold text-profit">${fmt(referral?.bonusEarned ?? 0)}</p></DashCard>
                <DashCard className="p-6"><p className="text-sm text-[var(--muted)]">Your Code</p><p className="mt-2 text-2xl font-extrabold text-[var(--gold)] font-mono">{referral?.code ?? "—"}</p></DashCard>
              </div>
              <DashCard className="p-6">
                <h3 className="mb-4 text-lg font-bold">Your Referral Link</h3>
                <div className="flex gap-2">
                  <input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referral?.code ?? ""}`}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-xs text-[var(--gold)] outline-none" />
                  <button onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referral?.code}`); setActionMsg("Link copied!"); setTimeout(() => setActionMsg(""), 2000); } catch {} }}
                    className="btn-gold shrink-0">Copy</button>
                </div>
                {actionMsg && <p className="mt-2 text-xs text-[var(--gold)]">{actionMsg}</p>}
              </DashCard>
              <DashCard className="p-6">
                <h3 className="mb-4 text-lg font-bold">Referred Members</h3>
                {(referral?.referrals ?? []).length === 0 ? (
                  <p className="py-6 text-center text-sm text-[var(--muted)]">No referrals yet. Share your link to earn $25 per funded member.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead><tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
                        <th className="px-2 py-2">Name</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Tier</th><th className="px-2 py-2">Deposited</th>
                      </tr></thead>
                      <tbody>
                        {referral!.referrals.map((r, i) => (
                          <tr key={i} className="border-b border-[var(--border)]/50">
                            <td className="px-2 py-2 font-bold">{r.name}</td>
                            <td className="px-2 py-2 text-[var(--muted)]">{r.email}</td>
                            <td className="px-2 py-2 capitalize text-[var(--gold)]">{r.tier}</td>
                            <td className="px-2 py-2">${fmt(r.deposited)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DashCard>
            </div>
          )}

          {/* ═══ PROFIT CALENDAR ═══ */}
          {activeTab === "calendar" && (
            <DashCard className="p-6">
              <h3 className="mb-4 text-lg font-bold">📅 Profit Calendar — Last 42 Days</h3>
              {(() => {
                const profitMap = new Map<string, number>();
                (wallet.profitHistory ?? []).forEach((e) => { if (e.date && e.profit > 0) profitMap.set(e.date, e.profit); });
                const days: { date: string; profit: number }[] = [];
                for (let i = 41; i >= 0; i--) {
                  const d = new Date(); d.setDate(d.getDate() - i);
                  const dateStr = d.toISOString().split("T")[0];
                  days.push({ date: dateStr, profit: profitMap.get(dateStr) ?? 0 });
                }
                return (
                  <div className="grid grid-cols-7 gap-1.5">
                    {days.map((day) => (
                      <div key={day.date} className={`aspect-square rounded-md ${day.profit > 0 ? "bg-profit/60" : "bg-[var(--border)]/30"}`}
                        title={day.profit > 0 ? `${day.date}: +$${day.profit.toFixed(2)}` : `${day.date}: No activity`} />
                    ))}
                  </div>
                );
              })()}
              <div className="mt-4 flex items-center gap-4 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-profit/60" /> Profit earned</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[var(--border)]/30" /> No activity</span>
              </div>
            </DashCard>
          )}

          {/* ═══ INSIGHTS ═══ */}
          {activeTab === "insights" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashCard className="p-6"><p className="text-sm text-[var(--muted)]">Daily Rate</p><p className="mt-2 text-3xl font-extrabold text-[var(--gold)]">{(wallet.dailyRate * 100).toFixed(2)}%</p></DashCard>
              <DashCard className="p-6"><p className="text-sm text-[var(--muted)]">Projected Monthly</p><p className="mt-2 text-3xl font-extrabold text-profit">${fmt(wallet.deposited * wallet.dailyRate * 30)}</p></DashCard>
              <DashCard className="p-6"><p className="text-sm text-[var(--muted)]">Total Profit Earned</p><p className="mt-2 text-3xl font-extrabold text-profit">${fmt((wallet.profitHistory ?? []).reduce((s, e) => s + e.profit, 0))}</p></DashCard>
              <DashCard className="p-6"><p className="text-sm text-[var(--muted)]">Active Days</p><p className="mt-2 text-3xl font-extrabold">{(wallet.profitHistory ?? []).filter(e => e.profit > 0).length}</p></DashCard>
            </div>
          )}

          {/* ═══ REPORTS ═══ */}
          {activeTab === "reports" && (
            <DashCard className="p-6">
              <h3 className="mb-4 text-lg font-bold">📑 Account Reports</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
                  <div><p className="font-bold">Monthly Statement</p><p className="text-xs text-[var(--muted)]">Full breakdown of deposits, profit, and withdrawals</p></div>
                  <button className="btn-ghost !px-4 !py-2 text-xs">Download</button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
                  <div><p className="font-bold">Tax Summary</p><p className="text-xs text-[var(--muted)]">Annual profit summary for tax reporting</p></div>
                  <button className="btn-ghost !px-4 !py-2 text-xs">Download</button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
                  <div><p className="font-bold">Trade History Export</p><p className="text-xs text-[var(--muted)]">CSV export of all AI-executed trades</p></div>
                  <button className="btn-ghost !px-4 !py-2 text-xs">Export CSV</button>
                </div>
              </div>
            </DashCard>
          )}

          {/* ═══ SECURITY ═══ */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <DashCard className="p-6">
                <h3 className="text-lg font-bold">🔒 Account Security</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
                    <div><p className="font-bold">Email Verification</p><p className="text-xs text-[var(--muted)]">Your email is verified and secure</p></div>
                    <span className="rounded-full bg-profit/15 px-3 py-1 text-xs font-bold text-profit">✓ Verified</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
                    <div><p className="font-bold">Two-Factor Authentication</p><p className="text-xs text-[var(--muted)]">Add an extra layer of security</p></div>
                    <button className="btn-ghost !px-4 !py-2 text-xs">Enable</button>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
                    <div><p className="font-bold">Change Password</p><p className="text-xs text-[var(--muted)]">Last changed: Never</p></div>
                    <button className="btn-ghost !px-4 !py-2 text-xs">Update</button>
                  </div>
                </div>
              </DashCard>
            </div>
          )}

          {/* ═══ SUPPORT ═══ */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <DashCard className="p-6">
                <h3 className="text-lg font-bold">🎧 Support Center</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">Need help? Our team is here for you.</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <a href="/faq" className="rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--gold)]">
                    <p className="font-bold">📖 FAQ</p><p className="mt-1 text-xs text-[var(--muted)]">Answers to common questions</p>
                  </a>
                  <a href="mailto:support@kingdomtradex.com" className="rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--gold)]">
                    <p className="font-bold">✉️ Email Support</p><p className="mt-1 text-xs text-[var(--muted)]">support@kingdomtradex.com</p>
                  </a>
                </div>
              </DashCard>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {activeTab === "settings" && (
            <DashCard className="p-6">
              <h3 className="text-lg font-bold">⚙️ Account Settings</h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <p className="text-sm font-bold">Display Name</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{me?.name ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <p className="text-sm font-bold">Current Tier</p>
                  <p className={`mt-1 text-sm font-bold ${tierColors[wallet.tier]}`}>{tierLabels[wallet.tier]}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <p className="text-sm font-bold">Daily Profit Rate</p>
                  <p className="mt-1 text-sm text-[var(--gold)]">{(wallet.dailyRate * 100).toFixed(2)}% per day</p>
                </div>
              </div>
            </DashCard>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Inline Markets Grid (lightweight, no external deps) ──
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
          <div key={a.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold">{a.symbol}</p>
              <span className={`text-xs font-bold ${up ? "text-profit" : "text-loss"}`}>{up ? "+" : ""}{a.change24h.toFixed(1)}%</span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">{a.name}</p>
            <p className="mt-2 text-lg font-extrabold tabular-nums">${fmt(a.price)}</p>
          </div>
        );
      })}
    </div>
  );
}
