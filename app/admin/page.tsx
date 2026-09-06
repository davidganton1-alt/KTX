"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { SystemHealth } from "@/components/SystemHealth";

const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const fmtDateTime = (ms: number) => new Date(ms).toLocaleString();

const TABS = [
  { id: "overview", label: "Overview", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { id: "pastors", label: "Pastors", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "withdrawals", label: "Withdrawals", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
  { id: "engine", label: "Engine", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { id: "announcements", label: "Announcements", icon: "M11 5.882V19.24a1.765 1.765 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data from /api/admin/data
  const [users, setUsers] = useState<any[]>([]);
  const [pastors, setPastors] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [engineMode, setEngineMode] = useState<"demo" | "live">("demo");
  const [msg, setMsg] = useState("");
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  // Pastor approval modal
  const [newCreds, setNewCreds] = useState<{ email: string; password: string; name: string } | null>(null);

  // Announcements form
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");

  // Pastor share rate editor
  const [editRate, setEditRate] = useState<{ id: string; value: string } | null>(null);

  async function loadAll() {
    try {
      const [dataRes, engRes] = await Promise.all([
        fetch("/api/admin/data", { cache: "no-store" }),
        fetch("/api/admin/engine-mode", { cache: "no-store" }),
      ]);
      if (dataRes.ok) {
        const d = await dataRes.json();
        setUsers(d.users ?? []);
        setPastors(d.pastors ?? []);
        setApps(d.pastorApplications ?? []);
        setWithdrawals(d.withdrawals ?? []);
        setAnnouncements(d.announcements ?? []);
      }
      if (engRes.ok) {
        const d = await engRes.json();
        setEngineMode(d.engineMode ?? "demo");
      }
    } catch {}
  }

  useEffect(() => { loadAll(); }, []);

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3500);
  }

  // ── Pastor actions ──
  async function decidePastor(id: string, status: "approved" | "rejected", app?: any) {
    const key = `pastor-${id}-${status}`;
    setActionBusy(key);
    try {
      const res = await fetch("/api/admin/pastor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          name: app?.name,
          email: app?.email,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { flash(d.error || "Failed."); setActionBusy(null); return; }
      if (status === "approved" && d.pastor?.credentials) {
        setNewCreds({ email: d.pastor.credentials.email, password: d.pastor.credentials.password, name: app?.name ?? d.pastor.name });
      } else {
        flash(`Pastor ${status}.`);
      }
      loadAll();
    } catch { flash("Network error."); }
    setActionBusy(null);
  }

  async function saveShareRate() {
    if (!editRate) return;
    const v = Number(editRate.value);
    if (!Number.isFinite(v) || v < 0 || v > 50) { flash("Rate must be 0–50."); return; }
    setActionBusy(`rate-${editRate.id}`);
    try {
      const res = await fetch("/api/admin/pastor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-rate", id: editRate.id, shareRate: v }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { flash(d.error || "Failed."); setActionBusy(null); return; }
      flash("Share rate updated.");
      setEditRate(null);
      loadAll();
    } catch { flash("Network error."); }
    setActionBusy(null);
  }

  async function reviewPayout(pastorId: string, payoutId: string, status: "approved" | "rejected") {
    const key = `payout-${payoutId}-${status}`;
    setActionBusy(key);
    try {
      const res = await fetch("/api/admin/pastor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "payout", id: pastorId, payoutId, status }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { flash(d.error || "Failed."); setActionBusy(null); return; }
      flash(`Payout ${status}.`);
      loadAll();
    } catch { flash("Network error."); }
    setActionBusy(null);
  }

  // ── Withdrawal actions (query params) ──
  async function decideWithdrawal(wid: string, status: "approved" | "rejected") {
    const key = `w-${wid}-${status}`;
    setActionBusy(key);
    try {
      const res = await fetch(`/api/admin/withdrawal?wid=${encodeURIComponent(wid)}&status=${status}`, { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { flash(d.error || "Failed."); setActionBusy(null); return; }
      flash(`Withdrawal ${status}.`);
      loadAll();
    } catch { flash("Network error."); }
    setActionBusy(null);
  }

  // ── Announcements (title + body) ──
  async function postAnnouncement() {
    if (!annTitle.trim()) { flash("Title is required."); return; }
    setActionBusy("ann-post");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: annTitle.trim(), body: annBody.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { flash(d.error || "Failed."); setActionBusy(null); return; }
      flash("Announcement published.");
      setAnnTitle("");
      setAnnBody("");
      loadAll();
    } catch { flash("Network error."); }
    setActionBusy(null);
  }

  async function deleteAnnouncement(id: string) {
    setActionBusy(`ann-del-${id}`);
    try {
      const res = await fetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) { flash("Failed to delete."); setActionBusy(null); return; }
      flash("Announcement deleted.");
      loadAll();
    } catch { flash("Network error."); }
    setActionBusy(null);
  }

  // ── Engine mode ──
  async function toggleEngine() {
    const next = engineMode === "demo" ? "live" : "demo";
    setActionBusy("engine");
    try {
      const res = await fetch("/api/admin/engine-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: next }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { flash(d.error || "Failed to update engine mode."); setActionBusy(null); return; }
      setEngineMode(d.engineMode);
      flash(`Engine mode set to ${d.engineMode.toUpperCase()}.`);
    } catch { flash("Network error."); }
    setActionBusy(null);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // ── Derived stats ──
  const totalDeposits = users.reduce((s, u) => s + (u.deposited ?? 0), 0);
  const totalProfit = users.reduce((s, u) => s + (u.profit ?? 0), 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;
  const activePastors = pastors.length;
  const pendingApps = apps.length;

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[var(--border)] bg-[var(--bg-soft)] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-center border-b border-[var(--border)]">
          <span className="text-xl font-bold tracking-tight text-[var(--fg)]">KTX <span className="text-red-400">Admin</span></span>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-red-500/10 text-red-400" : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--fg)]"}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} /></svg>
              {tab.label}
              {tab.id === "pastors" && pendingApps > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-[var(--fg)]">{pendingApps}</span>}
              {tab.id === "withdrawals" && pendingWithdrawals > 0 && <span className="ml-auto rounded-full bg-[var(--gold)] px-2 py-0.5 text-[10px] font-bold text-black">{pendingWithdrawals}</span>}
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/80 px-6 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[var(--muted)] lg:hidden">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h2 className="text-lg font-bold text-[var(--fg)]">{TABS.find(t => t.id === activeTab)?.label}</h2>
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
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                  <p className="text-sm text-[var(--muted)]">Total Users</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--fg)] tabular-nums"><AnimatedNumber value={users.length} /></p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                  <p className="text-sm text-[var(--muted)]">Total Deposits</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--profit)] tabular-nums">$<AnimatedNumber value={totalDeposits} /></p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                  <p className="text-sm text-[var(--muted)]">Accrued Profit</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--gold)] tabular-nums">$<AnimatedNumber value={totalProfit} /></p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                  <p className="text-sm text-[var(--muted)]">Active Pastors</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--cyan)] tabular-nums"><AnimatedNumber value={activePastors} /></p>
                </div>
              </div>

              {/* Pending items */}
              <div className="grid gap-4 md:grid-cols-3">
                <button onClick={() => setActiveTab("pastors")} className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6 text-left transition hover:border-[var(--gold)]/40">
                  <p className="text-sm text-[var(--muted)]">Pending Pastor Apps</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--gold)] tabular-nums"><AnimatedNumber value={pendingApps} /></p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Click to review →</p>
                </button>
                <button onClick={() => setActiveTab("withdrawals")} className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6 text-left transition hover:border-[var(--gold)]/40">
                  <p className="text-sm text-[var(--muted)]">Pending Withdrawals</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--gold)] tabular-nums"><AnimatedNumber value={pendingWithdrawals} /></p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Click to review →</p>
                </button>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                  <p className="text-sm text-[var(--muted)]">Announcements</p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--fg)] tabular-nums"><AnimatedNumber value={announcements.length} /></p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Currently active</p>
                </div>
              </div>

              {/* Engine status */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--fg)]">Engine Status</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">Running in <b className={engineMode === "live" ? "text-[var(--profit)]" : "text-[var(--gold)]"}>{engineMode.toUpperCase()}</b> mode</p>
                  </div>
                  <button onClick={toggleEngine} disabled={actionBusy === "engine"}
                    className={`rounded-lg px-6 py-3 text-sm font-bold transition disabled:opacity-50 ${engineMode === "demo" ? "bg-[var(--profit)] text-[var(--fg)] hover:bg-[var(--profit)]" : "bg-[var(--gold)] text-black hover:bg-[var(--gold)]"}`}>
                    {actionBusy === "engine" ? "Saving..." : `Switch to ${engineMode === "demo" ? "LIVE" : "DEMO"}`}
                  </button>
                </div>
              </div>

              {/* System Health Monitor */}
              <SystemHealth />
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {activeTab === "users" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
              <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">All Users ({users.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead><tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
                    <th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Tier</th>
                    <th className="px-3 py-2">Deposited</th><th className="px-3 py-2">Profit</th><th className="px-3 py-2">Status</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-b border-[var(--border)]">
                        <td className="px-3 py-3 font-bold text-[var(--fg)]">{u.name}</td>
                        <td className="px-3 py-3 text-[var(--muted)]">{u.email}</td>
                        <td className="px-3 py-3 capitalize text-[var(--gold)]">{u.tier ?? "none"}</td>
                        <td className="px-3 py-3 text-[var(--fg)]">${fmt(u.deposited ?? 0)}</td>
                        <td className="px-3 py-3 text-[var(--profit)]">${fmt(u.profit ?? 0)}</td>
                        <td className="px-3 py-3">
                          {u.suspended
                            ? <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">Suspended</span>
                            : <span className="rounded-full bg-[var(--profit)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--profit)]">Active</span>}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-[var(--muted)]">No users yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ PASTORS ═══ */}
          {activeTab === "pastors" && (
            <div className="space-y-6">
              {/* Applications */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Pending Applications ({apps.length})</h3>
                {apps.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[var(--muted)]">No pending applications.</p>
                ) : (
                  <div className="space-y-3">
                    {apps.map((p: any) => (
                      <div key={p.id} className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--fg)]">{p.name}</p>
                          <p className="text-xs text-[var(--muted)]">{p.email} · {p.ministry || "—"}</p>
                          {p.message && <p className="mt-2 text-xs text-[var(--muted)] italic">"{p.message}"</p>}
                          <p className="mt-1 text-[10px] text-[var(--muted)]">{fmtDateTime(p.createdAt ?? Date.now())}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => decidePastor(p.id, "approved", p)}
                            disabled={actionBusy?.startsWith(`pastor-${p.id}`)}
                            className="rounded-lg bg-[var(--profit)] px-4 py-2 text-xs font-bold text-[var(--fg)] hover:bg-[var(--profit)] disabled:opacity-50">
                            {actionBusy === `pastor-${p.id}-approved` ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => decidePastor(p.id, "rejected", p)}
                            disabled={actionBusy?.startsWith(`pastor-${p.id}`)}
                            className="rounded-lg bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30 disabled:opacity-50">
                            {actionBusy === `pastor-${p.id}-rejected` ? "..." : "Reject"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active pastors */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Active Pastors ({pastors.length})</h3>
                {pastors.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[var(--muted)]">No active pastors yet.</p>
                ) : (
                  <div className="space-y-3">
                    {pastors.map((p: any) => (
                      <div key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-bold text-[var(--fg)]">{p.name}</p>
                            <p className="text-xs text-[var(--muted)]">{p.email} · {p.ministry || "—"}</p>
                            <div className="mt-2 flex gap-4 text-xs text-[var(--muted)]">
                              <span>Referrals: <b className="text-[var(--cyan)]">{p.referrals ?? 0}</b></span>
                              <span>Earned: <b className="text-[var(--profit)]">${fmt(p.earnedTotal ?? 0)}</b></span>
                              <span>Available: <b className="text-[var(--gold)]">${fmt(p.available ?? 0)}</b></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {editRate && editRate.id === p.id ? (
                              <div className="flex items-center gap-2">
                                <input type="number" value={editRate.value} onChange={(e) => setEditRate({ ...editRate, value: e.target.value })}
                                  className="w-20 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs text-[var(--fg)] outline-none" />
                                <span className="text-xs text-[var(--muted)]">%</span>
                                <button onClick={saveShareRate} className="rounded-lg bg-[var(--profit)] px-3 py-1 text-xs font-bold text-[var(--fg)] hover:bg-[var(--profit)]">Save</button>
                                <button onClick={() => setEditRate(null)} className="rounded-lg bg-white/10 px-3 py-1 text-xs text-[var(--fg)] hover:bg-[var(--card)]">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setEditRate({ id: p.id, value: String(p.shareRate ?? 5) })}
                                className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs text-[var(--fg)] hover:border-[var(--gold)] hover:text-[var(--gold)]">
                                Rate: {p.shareRate ?? 5}% · Edit
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Payout requests */}
                        {(p.payouts ?? []).filter((x: any) => x.status === "pending").length > 0 && (
                          <div className="mt-3 border-t border-[var(--border)] pt-3">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">Pending Payouts</p>
                            <div className="space-y-2">
                              {(p.payouts as any[]).filter(x => x.status === "pending").map((pw: any) => (
                                <div key={pw.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2.5">
                                  <span className="text-sm font-bold text-[var(--fg)]">${fmt(pw.amount)}</span>
                                  <span className="text-xs text-[var(--muted)]">{fmtDateTime(pw.requestedAt ?? Date.now())}</span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => reviewPayout(p.id, pw.id, "approved")}
                                      disabled={actionBusy?.startsWith(`payout-${pw.id}`)}
                                      className="rounded bg-[var(--profit)] px-3 py-1 text-[10px] font-bold text-[var(--fg)] hover:bg-[var(--profit)] disabled:opacity-50">Approve</button>
                                    <button
                                      onClick={() => reviewPayout(p.id, pw.id, "rejected")}
                                      disabled={actionBusy?.startsWith(`payout-${pw.id}`)}
                                      className="rounded bg-red-500/20 px-3 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/30 disabled:opacity-50">Reject</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ WITHDRAWALS ═══ */}
          {activeTab === "withdrawals" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
              <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Pending Withdrawals ({pendingWithdrawals})</h3>
              {withdrawals.filter(w => w.status === "pending").length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted)]">No pending withdrawals.</p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.filter(w => w.status === "pending").map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                      <div>
                        <p className="font-bold text-[var(--fg)]">${fmt(w.amount)}</p>
                        <p className="text-xs text-[var(--muted)]">{w.userName ?? "User"} · {w.userEmail}</p>
                        <p className="text-[10px] text-[var(--muted)]">{fmtDateTime(w.requestedAt ?? Date.now())}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => decideWithdrawal(w.id, "approved")}
                          disabled={actionBusy?.startsWith(`w-${w.id}`)}
                          className="rounded-lg bg-[var(--profit)] px-4 py-2 text-xs font-bold text-[var(--fg)] hover:bg-[var(--profit)] disabled:opacity-50">
                          {actionBusy === `w-${w.id}-approved` ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => decideWithdrawal(w.id, "rejected")}
                          disabled={actionBusy?.startsWith(`w-${w.id}`)}
                          className="rounded-lg bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30 disabled:opacity-50">
                          {actionBusy === `w-${w.id}-rejected` ? "..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent history */}
              {withdrawals.filter(w => w.status !== "pending").length > 0 && (
                <div className="mt-8">
                  <h4 className="mb-3 text-sm font-bold text-[var(--muted)]">Recent Decisions</h4>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {withdrawals.filter(w => w.status !== "pending").slice(0, 20).map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5">
                        <span className="font-mono font-bold text-[var(--fg)]">${fmt(w.amount)}</span>
                        <span className="text-xs text-[var(--muted)]">{w.userName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${w.status === "approved" ? "bg-[var(--profit)]/15 text-[var(--profit)]" : "bg-red-500/15 text-red-400"}`}>{w.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ ENGINE ═══ */}
          {activeTab === "engine" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
              <h3 className="text-lg font-bold text-[var(--fg)]">Engine Control Panel</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Toggle between demo and live trading modes. Changes take effect immediately across the platform.</p>
              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <div className={`flex h-20 w-40 items-center justify-center rounded-xl border-2 font-bold text-lg ${engineMode === "live" ? "border-emerald-500 bg-[var(--profit)]/10 text-[var(--profit)]" : "border-amber-500 bg-[var(--gold)]/10 text-[var(--gold)]"}`}>
                  {engineMode.toUpperCase()}
                </div>
                <button onClick={toggleEngine} disabled={actionBusy === "engine"}
                  className="rounded-lg bg-white/10 px-6 py-3 text-sm font-bold text-[var(--fg)] transition hover:bg-[var(--card)] disabled:opacity-50">
                  {actionBusy === "engine" ? "Saving..." : `Switch to ${engineMode === "demo" ? "LIVE" : "DEMO"}`}
                </button>
              </div>
              <p className="mt-6 text-xs text-[var(--muted)]">Persistence: <code className="text-[var(--muted)]">data/engine-mode.json</code></p>
            </div>
          )}

          {/* ═══ ANNOUNCEMENTS ═══ */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                <h3 className="text-lg font-bold text-[var(--fg)]">Publish New Announcement</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Will appear as a banner across all user and pastor dashboards.</p>
                <input
                  type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Title (required)"
                  className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                <textarea
                  value={annBody} onChange={(e) => setAnnBody(e.target.value)}
                  rows={4} placeholder="Body (optional)"
                  className="mt-3 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                <button
                  onClick={postAnnouncement}
                  disabled={!annTitle.trim() || actionBusy === "ann-post"}
                  className="mt-3 rounded-lg bg-[var(--gold)] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50">
                  {actionBusy === "ann-post" ? "Publishing..." : "Publish"}
                </button>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
                <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">Active Announcements ({announcements.length})</h3>
                {announcements.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[var(--muted)]">No announcements published.</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((a: any) => (
                      <div key={a.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[var(--fg)]">{a.title}</p>
                            {a.body && <p className="mt-1 text-sm text-[var(--muted)] whitespace-pre-wrap">{a.body}</p>}
                            {a.createdAt && <p className="mt-2 text-[10px] text-[var(--muted)]">{fmtDateTime(a.createdAt)}</p>}
                          </div>
                          <button
                            onClick={() => deleteAnnouncement(a.id)}
                            disabled={actionBusy === `ann-del-${a.id}`}
                            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30 disabled:opacity-50">
                            {actionBusy === `ann-del-${a.id}` ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREDENTIALS MODAL */}
      {newCreds && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--gold)]/40 bg-[var(--bg-soft)] p-8 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--profit)]/20 text-xl text-[var(--profit)]">✓</div>
              <h2 className="text-xl font-bold text-[var(--fg)]">Pastor Approved</h2>
            </div>
            <p className="text-sm text-[var(--muted)]">Share these credentials securely with <b className="text-[var(--fg)]">{newCreds.name}</b>:</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Email</p>
                <p className="mt-1 font-mono text-sm text-[var(--fg)]">{newCreds.email}</p>
              </div>
              <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-[var(--gold)]">Temporary Password</p>
                <p className="mt-1 font-mono text-sm font-bold text-[var(--fg)]">{newCreds.password}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--gold)]">⚠ Advise them to change this password immediately after first login.</p>
            <button
              onClick={() => setNewCreds(null)}
              className="mt-6 w-full rounded-lg bg-[var(--gold)] py-3 text-sm font-bold text-black transition hover:brightness-110">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
