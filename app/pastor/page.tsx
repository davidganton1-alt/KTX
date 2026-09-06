"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ProEngine } from "@/components/ProEngine";

const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const TABS = [
  { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "flock", label: "Your Flock", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "earnings", label: "Earnings & Payout", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "activity", label: "Activity Feed", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { id: "leaderboard", label: "Leaderboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "engine", label: "AI Engine", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
];

export default function PastorPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  async function load() {
    const res = await fetch("/api/pastor/me");
    if (res.status === 401 || res.status === 403) { router.push("/login"); return; }
    if (res.ok) setData(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function requestPayout() {
    setNote("");
    try {
      const res = await fetch("/api/pastor/payout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ amount: Number(payoutAmount) }) });
      const json = await res.json();
      if (res.ok) { setNote(`Payout of $${Number(payoutAmount).toFixed(2)} requested. The admin will review it shortly.`); setPayoutAmount(""); load(); }
      else setNote(json.error || "Failed to request payout.");
    } catch { setNote("Network error."); }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!data) return <div className="flex min-h-screen items-center justify-center bg-[#05080F]"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>;

  const fullLink = `${typeof window !== "undefined" ? window.location.origin : ""}${data.inviteLink}`;
  const flockDeposits = (data.referrals ?? []).reduce((s: number, u: any) => s + (u.deposited ?? 0), 0);
  const profitHistory: number[] = (data.profitHistory ?? []).map((h: any) => typeof h === "number" ? h : h?.profit ?? h?.amount ?? 0);

  return (
    <div className="flex min-h-screen bg-[#05080F] text-slate-300 font-sans">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 bg-[#0B0F19] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-center border-b border-white/5">
          <span className="text-xl font-bold tracking-tight text-white">KTX <span className="text-[var(--gold)]">Pastor</span></span>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} /></svg>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 w-full px-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1 text-xs font-bold text-[var(--gold)]">✝ Pastor</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* ═══ OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Total Earned</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-400 tabular-nums">$<AnimatedNumber value={data.earnedTotal ?? 0} /></p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Available for Payout</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--gold)] tabular-nums">$<AnimatedNumber value={data.available ?? 0} /></p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Flock Members</p>
                  <p className="mt-2 text-3xl font-extrabold text-white tabular-nums"><AnimatedNumber value={data.referralsCount ?? 0} /></p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Share Rate</p>
                  <p className="mt-2 text-3xl font-extrabold text-cyan-400 tabular-nums">{data.shareRate ?? 5}%</p>
                </div>
              </div>

              {/* Invite Link */}
              <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                <h3 className="text-lg font-bold text-white">Your Shepherd Link</h3>
                <p className="mt-1 text-sm text-slate-500">Anyone who registers through this link joins your flock.</p>
                <div className="mt-4 flex gap-2">
                  <input readOnly value={fullLink} onFocus={(e) => e.target.select()}
                    className="flex-1 rounded-lg border border-white/10 bg-[#05080F] px-4 py-3 font-mono text-xs text-[var(--gold)] outline-none" />
                  <button onClick={copyLink} className="rounded-lg bg-[var(--gold)] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110">
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Flock Deposits Summary */}
              <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                <h3 className="text-lg font-bold text-white">Flock Summary</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-xs text-slate-500">Total Flock Deposits</p>
                    <p className="mt-1 text-2xl font-extrabold text-white">${fmt(flockDeposits)}</p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-xs text-slate-500">Active Members</p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-400">{(data.referrals ?? []).filter((r: any) => r.deposited > 0).length}</p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-xs text-slate-500">Pending Members</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-400">{(data.referrals ?? []).filter((r: any) => r.deposited === 0).length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ FLOCK ═══ */}
          {activeTab === "flock" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Your Flock ({(data.referrals ?? []).length} members)</h3>
              {(data.referrals ?? []).length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No members yet. Share your shepherd link to grow your flock.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead><tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-500">
                      <th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Tier</th>
                      <th className="px-3 py-2">Deposited</th><th className="px-3 py-2">Profit</th><th className="px-3 py-2">Your Share</th>
                    </tr></thead>
                    <tbody>
                      {(data.referrals ?? []).map((u: any) => (
                        <tr key={u.id} className="border-b border-white/5">
                          <td className="px-3 py-3 font-bold text-white">{u.name}</td>
                          <td className="px-3 py-3 text-slate-500">{u.email}</td>
                          <td className="px-3 py-3 capitalize text-[var(--gold)]">{u.tier ?? "—"}</td>
                          <td className="px-3 py-3 text-white">${fmt(u.deposited ?? 0)}</td>
                          <td className="px-3 py-3 text-emerald-400">${fmt(u.profit ?? 0)}</td>
                          <td className="px-3 py-3 font-bold text-[var(--gold)]">${fmt(((u.profit ?? 0) * (u.pastorShareRate ?? data.shareRate ?? 5)) / 100)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ EARNINGS ═══ */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <h3 className="text-lg font-bold text-white">Request Payout</h3>
                  <p className="mt-1 text-sm text-slate-500">Available: <b className="text-[var(--gold)]">${fmt(data.available ?? 0)}</b></p>
                  <div className="mt-4 flex gap-3">
                    <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} placeholder="0.00" min="1"
                      className="flex-1 rounded-lg border border-white/10 bg-[#05080F] px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]" />
                    <button onClick={requestPayout} disabled={!payoutAmount || Number(payoutAmount) <= 0 || (data.available ?? 0) <= 0}
                      className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50">
                      Request
                    </button>
                  </div>
                  <button onClick={() => setPayoutAmount(String(data.available))} className="mt-3 text-xs text-[var(--gold)] hover:underline">Withdraw all (${fmt(data.available ?? 0)})</button>
                  {note && <p className="mt-3 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-3 text-xs text-[var(--gold)]">{note}</p>}
                </div>

                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <h3 className="mb-4 text-lg font-bold text-white">Payout History</h3>
                  {(data.payouts ?? []).length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">No payouts yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {(data.payouts ?? []).map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                          <span className="font-mono font-bold text-white">${fmt(p.amount ?? 0)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === "approved" ? "bg-emerald-500/15 text-emerald-400" : p.status === "rejected" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>{p.status}</span>
                          <span className="text-xs text-slate-500">{fmtDate(p.date ?? p.requestedAt ?? Date.now())}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Profit History Chart */}
              <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                <h3 className="mb-4 text-lg font-bold text-white">Daily Earnings</h3>
                {profitHistory.length > 1 ? (
                  <div className="flex items-end gap-1 h-32">
                    {profitHistory.slice(-30).map((v, i) => {
                      const max = Math.max(...profitHistory.slice(-30), 1);
                      const h = (v / max) * 100;
                      return <div key={i} className="flex-1 rounded-t-sm bg-emerald-500/60" style={{ height: `${Math.max(2, h)}%` }} title={`$${v.toFixed(2)}`} />;
                    })}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-slate-500">Not enough data yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ═══ ACTIVITY ═══ */}
          {activeTab === "activity" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Activity Feed</h3>
              {(data.events ?? []).length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No activity yet.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {(data.events ?? []).map((e: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                      <span className={`h-2 w-2 rounded-full ${e.type === "joined" ? "bg-cyan-400" : e.type === "deposit" ? "bg-[var(--gold)]" : e.type === "payout" ? "bg-red-400" : "bg-emerald-400"}`} />
                      <span className="text-xs font-bold uppercase text-slate-500">{e.type}</span>
                      <span className="flex-1 text-sm text-white">{e.text ?? e.detail ?? e.name ?? ""}</span>
                      <span className="text-xs text-slate-500">{new Date(e.at ?? e.date ?? Date.now()).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ AI ENGINE ═══ */}
          {activeTab === "engine" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">AI Trade Engine — Live Terminal</h3>
                <span className="text-xs text-slate-500">Watch the engine your flock benefits from</span>
              </div>
              <ProEngine initialSymbol="BTC" />
            </div>
          )}

          {/* ═══ LEADERBOARD ═══ */}
          {activeTab === "leaderboard" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Shepherds Leaderboard</h3>
              <div className="space-y-2">
                {(data.leaders ?? []).map((l: any) => (
                  <div key={l.rank} className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${l.isYou ? "border-[var(--gold)] bg-[var(--gold)]/[0.06]" : "border-white/5 bg-white/[0.02]"}`}>
                    <span className={`w-8 text-center text-lg font-extrabold ${l.rank === 1 ? "text-[var(--gold)]" : l.rank === 2 ? "text-cyan-400" : l.rank === 3 ? "text-purple-400" : "text-slate-500"}`}>#{l.rank}</span>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{l.name} {l.isYou && <span className="text-[var(--gold)]">· you</span>}</p>
                      <p className="text-xs text-slate-500">{l.ministry}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-cyan-400">{l.referrals} referrals</p>
                      <p className="text-xs text-emerald-400">${fmt(l.earnedTotal ?? 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
