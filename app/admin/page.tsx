"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedNumber } from "@/components/AnimatedNumber";

const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const TABS = [
  { id: "overview", label: "Overview", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "users", label: "User Management", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { id: "pastors", label: "Pastor Approvals", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "withdrawals", label: "Withdrawals", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
  { id: "engine", label: "Engine Control", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { id: "announcements", label: "Announcements", icon: "M11 5.882V19.24a1.765 1.765 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pastorApps, setPastorApps] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [engineMode, setEngineMode] = useState("demo");
  const [announcement, setAnnouncement] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [dataRes, usersRes, pastorsRes, withdrawalsRes, engineRes] = await Promise.all([
        fetch("/api/admin/data", { cache: "no-store" }),
        fetch("/api/admin/user", { cache: "no-store" }),
        fetch("/api/admin/pastor", { cache: "no-store" }),
        fetch("/api/admin/withdrawal", { cache: "no-store" }),
        fetch("/api/admin/engine-mode", { cache: "no-store" }),
      ]);
      if (dataRes.ok) setStats(await dataRes.json());
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(Array.isArray(d) ? d : d.users ?? []); }
      if (pastorsRes.ok) { const d = await pastorsRes.json(); setPastorApps(Array.isArray(d) ? d : d.applications ?? d.pending ?? []); }
      if (withdrawalsRes.ok) { const d = await withdrawalsRes.json(); setWithdrawals(Array.isArray(d) ? d : d.withdrawals ?? d.pending ?? []); }
      if (engineRes.ok) { const d = await engineRes.json(); setEngineMode(d.engineMode ?? "demo"); }
    } catch {}
  }

  async function toggleEngine() {
    const newMode = engineMode === "demo" ? "live" : "demo";
    try {
      const res = await fetch("/api/admin/engine-mode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: newMode }) });
      if (res.ok) { setEngineMode(newMode); setMsg(`Engine mode set to ${newMode}.`); }
      else setMsg("Failed to update engine mode.");
    } catch { setMsg("Network error."); }
    setTimeout(() => setMsg(""), 3000);
  }

  async function postAnnouncement() {
    if (!announcement.trim()) return;
    try {
      const res = await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: announcement }) });
      if (res.ok) { setMsg("Announcement published."); setAnnouncement(""); }
      else setMsg("Failed to publish.");
    } catch { setMsg("Network error."); }
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#05080F] text-slate-300 font-sans">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 bg-[#0B0F19] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-center border-b border-white/5">
          <span className="text-xl font-bold tracking-tight text-white">KTX <span className="text-red-400">Admin</span></span>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-red-500/10 text-red-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
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
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">⚡ Admin</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-400 to-red-600" />
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {msg && <div className="mb-4 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3 text-center text-sm text-[var(--gold)]">{msg}</div>}

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Total Users</p>
                  <p className="mt-2 text-3xl font-extrabold text-white tabular-nums"><AnimatedNumber value={stats?.totalUsers ?? users.length} /></p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Total Deposits</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-400 tabular-nums">$<AnimatedNumber value={stats?.totalDeposits ?? 0} /></p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Active Pastors</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--gold)] tabular-nums"><AnimatedNumber value={stats?.activePastors ?? 0} /></p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                  <p className="text-sm text-slate-500">Pending Withdrawals</p>
                  <p className="mt-2 text-3xl font-extrabold text-red-400 tabular-nums"><AnimatedNumber value={withdrawals.length} /></p>
                </div>
              </div>

              {/* Engine Status */}
              <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Engine Status</h3>
                    <p className="mt-1 text-sm text-slate-500">Currently running in <b className={engineMode === "live" ? "text-emerald-400" : "text-amber-400"}>{engineMode.toUpperCase()}</b> mode</p>
                  </div>
                  <button onClick={toggleEngine} className={`rounded-lg px-6 py-3 text-sm font-bold transition ${engineMode === "demo" ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-amber-500 text-black hover:bg-amber-400"}`}>
                    Switch to {engineMode === "demo" ? "LIVE" : "DEMO"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {activeTab === "users" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="mb-4 text-lg font-bold text-white">All Users ({users.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead><tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-500">
                    <th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Tier</th>
                    <th className="px-3 py-2">Deposited</th><th className="px-3 py-2">Verified</th><th className="px-3 py-2">Role</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u: any, i: number) => (
                      <tr key={u.id ?? i} className="border-b border-white/5">
                        <td className="px-3 py-3 font-bold text-white">{u.name}</td>
                        <td className="px-3 py-3 text-slate-500">{u.email}</td>
                        <td className="px-3 py-3 capitalize text-[var(--gold)]">{u.tier ?? "none"}</td>
                        <td className="px-3 py-3 text-white">${fmt(u.deposited ?? 0)}</td>
                        <td className="px-3 py-3">{u.emailVerified ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✕</span>}</td>
                        <td className="px-3 py-3 capitalize text-slate-400">{u.role ?? "user"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ PASTOR APPROVALS ═══ */}
          {activeTab === "pastors" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Pending Pastor Applications ({pastorApps.length})</h3>
              {pastorApps.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No pending applications.</p>
              ) : (
                <div className="space-y-3">
                  {pastorApps.map((p: any, i: number) => (
                    <div key={p.id ?? i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div>
                        <p className="font-bold text-white">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.email} · {p.ministry}</p>
                        {p.message && <p className="mt-1 text-xs text-slate-400 italic">"{p.message}"</p>}
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-400">Approve</button>
                        <button className="rounded-lg bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ WITHDRAWALS ═══ */}
          {activeTab === "withdrawals" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Pending Withdrawals ({withdrawals.length})</h3>
              {withdrawals.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No pending withdrawals.</p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w: any, i: number) => (
                    <div key={w.id ?? i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div>
                        <p className="font-bold text-white">${fmt(w.amount ?? 0)}</p>
                        <p className="text-xs text-slate-500">{w.userName ?? w.email ?? "User"} · {fmtDate(w.date ?? w.requestedAt ?? Date.now())}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-400">Approve</button>
                        <button className="rounded-lg bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ ENGINE CONTROL ═══ */}
          {activeTab === "engine" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="text-lg font-bold text-white">Engine Control Panel</h3>
              <p className="mt-2 text-sm text-slate-500">Toggle between demo and live trading modes. Changes apply instantly across the platform.</p>
              <div className="mt-6 flex items-center gap-4">
                <div className={`flex h-16 w-32 items-center justify-center rounded-xl border-2 font-bold ${engineMode === "live" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-amber-500 bg-amber-500/10 text-amber-400"}`}>
                  {engineMode.toUpperCase()}
                </div>
                <button onClick={toggleEngine} className="rounded-lg bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20">
                  Toggle Mode
                </button>
              </div>
            </div>
          )}

          {/* ═══ ANNOUNCEMENTS ═══ */}
          {activeTab === "announcements" && (
            <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
              <h3 className="text-lg font-bold text-white">Publish Announcement</h3>
              <p className="mt-2 text-sm text-slate-500">This will appear as a banner across all user dashboards.</p>
              <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} rows={4} placeholder="Type your announcement..."
                className="mt-4 w-full rounded-lg border border-white/10 bg-[#05080F] px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]" />
              <button onClick={postAnnouncement} disabled={!announcement.trim()} className="mt-3 rounded-lg bg-[var(--gold)] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50">
                Publish
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
