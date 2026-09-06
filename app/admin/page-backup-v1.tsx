"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TradeEngine } from "@/components/TradeEngine";

type UserRow = {
  id: string;
  name: string;
  email: string;
  tier: string;
  deposited: number;
  profit: number;
  balance: number;
  createdAt: number;
  referredBy?: string;
  pastorName?: string;
  pastorShareRate?: number;
  suspended: boolean;
};
type WithdrawalRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  requestedAt: number;
  status: string;
};
type PayoutRow = {
  id: string;
  amount: number;
  requestedAt: number;
  status: string;
};
type PastorRow = {
  id: string;
  name: string;
  email: string;
  ministry: string;
  shareRate: number;
  earnedTotal: number;
  available: number;
  referrals: number;
  payouts: PayoutRow[];
  profitHistory: { date: string; profit: number }[];
};
type PastorAppRow = {
  id: string;
  name: string;
  email: string;
  ministry: string;
  message: string;
  shareRate: number;
  createdAt: number;
};
type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
};
type AdminData = {
  users: UserRow[];
  withdrawals: WithdrawalRow[];
  pastors: PastorRow[];
  pastorApplications: PastorAppRow[];
  announcements: AnnouncementRow[];
};

const TIER_LABEL: Record<string, string> = {
  faithful: "Faithful",
  steward: "Steward",
  ambassador: "Ambassador",
  none: "No plan",
};
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics" },
  { id: "users", label: "Users" },
  { id: "pastors", label: "Pastors" },
  { id: "deposits", label: "Deposits" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "announcements", label: "Announcements" },
  { id: "engine", label: "AI Trade Engine" },
  { id: "markets", label: "Markets" },
  { id: "plans", label: "Plans" },
];

const SKELETON_ADMIN: AdminData = {
  users: [],
  withdrawals: [],
  pastors: [],
  pastorApplications: [],
  announcements: [],
};

export default function AdminConsole() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState<AdminData>(SKELETON_ADMIN);
  const [markets, setMarkets] = useState<{ symbol: string; name: string; class: string; price: number; change24h: number }[]>([]);
  const [note, setNote] = useState<string | null>(null);
  // Announcements form
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  // User management
  const [adjustTarget, setAdjustTarget] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");

  async function load() {
    const res = await fetch("/api/admin/data");
    if (res.status === 401 || res.status === 403) {
      router.push("/login");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (tab === "markets") fetch("/api/markets").then((r) => r.json()).then((j) => setMarkets(j.assets));
  }, [tab]);

  async function decide(wid: string, status: "approved" | "rejected") {
    setNote(null);
    const res = await fetch(`/api/admin/withdrawal?wid=${wid}&status=${status}`, { method: "POST" });
    const json = await res.json();
    if (res.ok) {
      setNote(`Withdrawal ${status}.`);
      load();
    } else setNote(json.error || "Failed");
  }

  async function reviewPastor(id: string, status: "approved" | "rejected") {
    setNote(null);
    const res = await fetch(`/api/admin/pastor`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (res.ok) {
      if (status === "approved" && json.pastor?.credentials) {
        const c = json.pastor.credentials;
        setNote(`Pastor approved. Login: ${c.email} · password: ${c.password} (share with the pastor, they can change it later).`);
      } else {
        setNote(`Pastor ${status}.`);
      }
      load();
    } else setNote(json.error || "Failed");
  }

  async function setPastorRate(id: string, rate: number) {
    setNote(null);
    const res = await fetch("/api/admin/pastor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action: "set-rate", shareRate: rate }),
    });
    const json = await res.json();
    if (res.ok) {
      setNote(`Share rate updated to ${rate}%.`);
      load();
    } else setNote(json.error || "Failed");
  }

  async function payoutDecision(pastorId: string, payoutId: string, status: "approved" | "rejected") {
    setNote(null);
    const res = await fetch("/api/admin/pastor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: pastorId, action: "payout", payoutId, status }),
    });
    const json = await res.json();
    if (res.ok) {
      setNote(`Payout ${status}.`);
      load();
    } else setNote(json.error || "Failed");
  }

  async function userAction(id: string, action: string, extra?: Record<string, unknown>) {
    setNote(null);
    const res = await fetch("/api/admin/user", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action, ...extra }),
    });
    const json = await res.json();
    if (res.ok) {
      setNote(action === "suspend" ? "User suspended." : action === "reactivate" ? "User reactivated." : "User updated.");
      setAdjustTarget(null);
      setAdjustAmount("");
      load();
    } else setNote(json.error || "Failed");
  }

  async function postAnnouncement() {
    setNote(null);
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: annTitle, body: annBody }),
    });
    const json = await res.json();
    if (res.ok) {
      setNote("Announcement published. It now appears on every member and pastor panel.");
      setAnnTitle("");
      setAnnBody("");
      load();
    } else setNote(json.error || "Failed");
  }

  async function deleteAnnouncement(id: string) {
    setNote(null);
    const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setNote("Announcement removed.");
      load();
    } else setNote("Failed to remove.");
  }

  const funded = data.users.filter((u) => u.deposited > 0);
  const totalDeposited = data.users.reduce((s, u) => s + u.deposited, 0);
  const totalProfit = data.users.reduce((s, u) => s + u.profit, 0);
  const pending = data.withdrawals.filter((w) => w.status === "pending");
  const pendingPayouts = data.pastors.flatMap((p) =>
    (p.payouts || []).filter((x) => x.status === "pending").map((x) => ({ ...x, pastor: p }))
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-[var(--border)] bg-[var(--card)] p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-2 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-loss to-royal-violet font-bold text-white">A</div>
          <div>
            <p className="text-sm font-semibold">Admin</p>
            <p className="text-xs text-[var(--gold)]">Console</p>
          </div>
        </div>
        <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                tab === t.id ? "bg-gradient-to-r from-royal-violet/30 to-cyan-light/20 text-[var(--fg)]" : "text-[var(--muted)] hover:bg-[var(--bg)]"
              }`}
            >
              {t.label}
              {t.id === "withdrawals" && pending.length > 0 && (
                <span className="ml-2 rounded-full bg-loss px-1.5 text-xs text-white">{pending.length}</span>
              )}
              {t.id === "pastors" && pendingPayouts.length > 0 && (
                <span className="ml-2 rounded-full bg-loss px-1.5 text-xs text-white">{pendingPayouts.length}</span>
              )}
            </button>
          ))}
        </nav>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
          }}
          className="mt-4 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-sm text-loss transition hover:border-loss"
        >
          Sign out
        </button>
      </aside>

      <main className="flex-1 px-4 py-8 md:px-10 md:py-10">
        <div className="container-wide">
        {note && <p className="mb-4 rounded-xl border border-[var(--gold)]/40 bg-[var(--card)] px-4 py-2 text-sm text-[var(--gold)]">{note}</p>}

        {tab === "overview" && (
          <>
            <h2 className="text-2xl font-bold">Platform overview</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <Stat label="Total users" value={`${data.users.length}`} />
              <Stat label="Funded users" value={`${funded.length}`} />
              <Stat label="Total deposited" value={`$${totalDeposited.toLocaleString("en-US")}`} accent="text-[var(--gold)]" />
              <Stat label="Accrued profit" value={`$${totalProfit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} accent="text-profit" />
              <Stat label="Pending withdrawals" value={`${pending.length}`} accent="text-loss" />
              <Stat label="Active pastors" value={`${data.pastors.length}`} accent="text-[var(--gold)]" />
              <Stat label="Pending pastor payouts" value={`${pendingPayouts.length}`} accent="text-loss" />
              <Stat label="Status" value="Live demo" />
            </div>
          </>
        )}

        {tab === "analytics" && <Analytics data={data} />}

        {tab === "users" && (
          <>
            <h2 className="text-2xl font-bold">Users</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Suspend or reactivate accounts, change plans, or adjust profit. Changes are
              notified to the member automatically.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)]">
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Deposited</th>
                    <th>Profit</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id} className="border-t border-[var(--border)]">
                      <td className="py-2 font-medium">{u.name}</td>
                      <td className="text-[var(--muted)]">{u.email}</td>
                      <td>
                        <select
                          value={u.tier}
                          onChange={(e) => userAction(u.id, "set-tier", { tier: e.target.value })}
                          className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs outline-none"
                        >
                          <option value="none">No plan</option>
                          <option value="faithful">Faithful</option>
                          <option value="steward">Steward</option>
                          <option value="ambassador">Ambassador</option>
                        </select>
                      </td>
                      <td>${u.deposited.toLocaleString("en-US")}</td>
                      <td className="text-profit">${u.profit.toFixed(2)}</td>
                      <td className="text-xs text-[var(--muted)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${u.suspended ? "bg-loss/20 text-loss" : "bg-profit/20 text-profit"}`}>
                          {u.suspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {u.suspended ? (
                            <button onClick={() => userAction(u.id, "reactivate")} className="rounded-full bg-profit/20 px-3 py-1 text-xs text-profit transition hover:bg-profit/30">
                              Reactivate
                            </button>
                          ) : (
                            <button onClick={() => userAction(u.id, "suspend")} className="rounded-full bg-loss/20 px-3 py-1 text-xs text-loss transition hover:bg-loss/30">
                              Suspend
                            </button>
                          )}
                          {adjustTarget === u.id ? (
                            <span className="flex items-center gap-1">
                              <input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                placeholder="+/- $"
                                className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs outline-none"
                              />
                              <button
                                onClick={() => userAction(u.id, "adjust-profit", { amount: Number(adjustAmount) })}
                                className="rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-3 py-1 text-xs font-semibold text-white"
                              >
                                Apply
                              </button>
                              <button onClick={() => setAdjustTarget(null)} className="rounded-full border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)]">
                                ✕
                              </button>
                            </span>
                          ) : (
                            <button onClick={() => { setAdjustTarget(u.id); setAdjustAmount(""); }} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--gold)]">
                              Adjust profit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "pastors" && (
          <>
            <h2 className="text-2xl font-bold">Pastors &amp; referrals</h2>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
              Active pastors
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)]">
                    <th className="py-2">Name</th>
                    <th>Login email</th>
                    <th>Ministry</th>
                    <th>Share rate</th>
                    <th>Referrals</th>
                    <th>Earned</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pastors.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--border)]">
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="text-[var(--muted)]">{p.email}</td>
                      <td className="text-[var(--muted)]">{p.ministry}</td>
                      <td>
                        <span className="flex items-center gap-1">
                          <input
                            type="number"
                            defaultValue={p.shareRate}
                            min={0}
                            max={50}
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (v !== p.shareRate) setPastorRate(p.id, v);
                            }}
                            className="w-16 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs text-[var(--gold)] outline-none"
                          />
                          <span className="text-xs text-[var(--muted)]">%</span>
                        </span>
                      </td>
                      <td>{p.referrals}</td>
                      <td className="text-profit">${p.earnedTotal.toFixed(2)}</td>
                      <td className="text-[var(--gold)]">${p.available.toFixed(2)}</td>
                    </tr>
                  ))}
                  {data.pastors.length === 0 && (
                    <tr><td colSpan={7} className="py-3 text-[var(--muted)]">No active pastors yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
              Pastor payout requests
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              {pendingPayouts.length === 0 && (
                <p className="text-sm text-[var(--muted)]">No pending payout requests.</p>
              )}
              {pendingPayouts.map((x) => (
                <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
                  <div>
                    <p className="font-medium">{x.pastor.name} <span className="text-xs text-[var(--muted)]">{x.pastor.email}</span></p>
                    <p className="text-sm text-[var(--muted)]">${x.amount.toFixed(2)} · requested {new Date(x.requestedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => payoutDecision(x.pastor.id, x.id, "approved")} className="rounded-full bg-profit/20 px-4 py-1.5 text-sm text-profit transition hover:bg-profit/30">Approve</button>
                    <button onClick={() => payoutDecision(x.pastor.id, x.id, "rejected")} className="rounded-full bg-loss/20 px-4 py-1.5 text-sm text-loss transition hover:bg-loss/30">Reject</button>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
              Pending applications
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              {data.pastorApplications.length === 0 && (
                <p className="text-sm text-[var(--muted)]">No pending applications.</p>
              )}
              {data.pastorApplications.map((a) => (
                <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
                  <div>
                    <p className="font-medium">{a.name} <span className="text-xs text-[var(--muted)]">{a.email}</span></p>
                    <p className="text-sm text-[var(--muted)]">{a.ministry}</p>
                    {a.message && <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">{a.message}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => reviewPastor(a.id, "approved")} className="rounded-full bg-profit/20 px-4 py-1.5 text-sm text-profit transition hover:bg-profit/30">Approve</button>
                    <button onClick={() => reviewPastor(a.id, "rejected")} className="rounded-full bg-loss/20 px-4 py-1.5 text-sm text-loss transition hover:bg-loss/30">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "announcements" && (
          <>
            <h2 className="text-2xl font-bold">Announcements</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Broadcast to every member and pastor panel. New posts appear at the top of
              their notifications feed.
            </p>
            <div className="mt-6 max-w-2xl rounded-2xl border border-[var(--gold)]/30 p-5">
              <p className="text-sm font-semibold">Publish a new announcement</p>
              <div className="mt-4 flex flex-col gap-3">
                <input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Title, e.g. Weekend maintenance window"
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                />
                <textarea
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  placeholder="Message shown to all members"
                  rows={4}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                />
                <button
                  onClick={postAnnouncement}
                  disabled={!annTitle.trim()}
                  className="self-start rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-6 py-3 font-semibold text-white shadow-gold transition hover:brightness-110 disabled:opacity-50"
                >
                  Publish
                </button>
              </div>
            </div>
            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">Published</h3>
            <div className="mt-3 flex flex-col gap-3">
              {data.announcements.length === 0 && (
                <p className="text-sm text-[var(--muted)]">Nothing published yet.</p>
              )}
              {data.announcements.map((a) => (
                <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
                  <div className="max-w-xl">
                    <p className="font-medium">{a.title}</p>
                    {a.body && <p className="mt-1 text-sm text-[var(--muted)]">{a.body}</p>}
                    <p className="mt-1 text-xs text-[var(--muted)]">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteAnnouncement(a.id)} className="rounded-full bg-loss/20 px-3 py-1 text-xs text-loss transition hover:bg-loss/30">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "deposits" && (
          <>
            <h2 className="text-2xl font-bold">Deposits</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)]">
                    <th className="py-2">User</th>
                    <th>Plan</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.filter((u) => u.deposited > 0).map((u) => (
                    <tr key={u.id} className="border-t border-[var(--border)]">
                      <td className="py-2 font-medium">{u.name}</td>
                      <td>{TIER_LABEL[u.tier]}</td>
                      <td>${u.deposited.toLocaleString("en-US")}</td>
                    </tr>
                  ))}
                  {data.users.filter((u) => u.deposited > 0).length === 0 && (
                    <tr><td colSpan={3} className="py-3 text-[var(--muted)]">No deposits yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "withdrawals" && (
          <>
            <h2 className="text-2xl font-bold">Withdrawals</h2>
            <div className="mt-4 flex flex-col gap-3">
              {data.withdrawals.length === 0 && <p className="text-sm text-[var(--muted)]">No withdrawal requests.</p>}
              {data.withdrawals.map((x) => (
                <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
                  <div>
                    <p className="font-medium">{x.userName} <span className="text-xs text-[var(--muted)]">{x.userEmail}</span></p>
                    <p className="text-sm text-[var(--muted)]">${x.amount.toFixed(2)} · {x.status} · {new Date(x.requestedAt).toLocaleString()}</p>
                  </div>
                  {x.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => decide(x.id, "approved")} className="rounded-full bg-profit/20 px-4 py-1.5 text-sm text-profit transition hover:bg-profit/30">Approve</button>
                      <button onClick={() => decide(x.id, "rejected")} className="rounded-full bg-loss/20 px-4 py-1.5 text-sm text-loss transition hover:bg-loss/30">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "markets" && (
          <>
            <h2 className="text-2xl font-bold">Markets</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)]">
                    <th className="py-2">Symbol</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Price</th>
                    <th>24h</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((m) => (
                    <tr key={m.symbol} className="border-t border-[var(--border)]">
                      <td className="py-2 font-mono font-medium">{m.symbol}</td>
                      <td className="text-[var(--muted)]">{m.name}</td>
                      <td>{m.class}</td>
                      <td>${m.price.toLocaleString("en-US")}</td>
                      <td className={m.change24h >= 0 ? "text-profit" : "text-loss"}>{m.change24h >= 0 ? "+" : ""}{m.change24h}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "engine" && (
          <TradeEngine />
        )}

        {tab === "plans" && (
          <>
            <h2 className="text-2xl font-bold">Plans</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { name: "Faithful", range: "$100 to $500", rate: "0.5% / day" },
                { name: "Steward", range: "$650 to $1,500", rate: "0.75% / day" },
                { name: "Ambassador", range: "$2,000 and up", rate: "1.0% / day" },
              ].map((p) => (
                <div key={p.name} className="rounded-2xl border border-[var(--border)] p-5">
                  <p className="text-lg font-bold">{p.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{p.range}</p>
                  <p className="mt-4 text-2xl font-extrabold text-[var(--gold)]">{p.rate}</p>
                </div>
              ))}
            </div>
          </>
        )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

/* ---------------- Analytics tab ---------------- */

function Analytics({ data }: { data: AdminData }) {
  const users = data.users;
  const funded = users.filter((u) => u.deposited > 0);

  // Deposits by plan
  const byPlan = (["faithful", "steward", "ambassador"] as const).map((t) => ({
    label: TIER_LABEL[t],
    count: users.filter((u) => u.tier === t).length,
    sum: users.filter((u) => u.tier === t).reduce((s, u) => s + u.deposited, 0),
  }));
  const maxSum = Math.max(1, ...byPlan.map((b) => b.sum));

  // Signup momentum: new members per week (last 8 weeks).
  const weeks: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = Date.now() - (i + 1) * 7 * 86400_000;
    const end = Date.now() - i * 7 * 86400_000;
    weeks.push({
      label: i === 0 ? "This week" : `${i}w ago`,
      count: users.filter((u) => u.createdAt >= start && u.createdAt < end).length,
    });
  }
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));

  const totalDeposited = users.reduce((s, u) => s + u.deposited, 0);
  const totalProfit = users.reduce((s, u) => s + u.profit, 0);
  const pastorEarnings = data.pastors.reduce((s, p) => s + p.earnedTotal, 0);
  const topPastors = data.pastors.slice().sort((a, b) => b.earnedTotal - a.earnedTotal).slice(0, 5);

  return (
    <>
      <h2 className="text-2xl font-bold">Analytics</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Live numbers from the platform store, refreshed on every load.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Deposits" value={`$${totalDeposited.toLocaleString("en-US")}`} accent="text-[var(--gold)]" />
        <Stat label="Member profit accrued" value={`$${totalProfit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} accent="text-profit" />
        <Stat label="Pastor earnings" value={`$${pastorEarnings.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} accent="text-[var(--gold)]" />
        <Stat label="Funded ratio" value={`${users.length ? Math.round((funded.length / users.length) * 100) : 0}%`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-sm font-semibold">Deposits by plan</p>
          <div className="mt-4 flex flex-col gap-3">
            {byPlan.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>{b.label} · {b.count} member{b.count === 1 ? "" : "s"}</span>
                  <span>${b.sum.toLocaleString("en-US")}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--bg)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-light to-royal-violet transition-all"
                    style={{ width: `${(b.sum / maxSum) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-sm font-semibold">New members per week</p>
          <div className="mt-4 flex h-32 items-end gap-2">
            {weeks.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs text-[var(--muted)]">{w.count || ""}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-royal-violet to-cyan-light"
                  style={{ height: `${(w.count / maxWeek) * 88 + 4}px` }}
                />
                <span className="text-[9px] text-[var(--muted)]">{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-sm font-semibold">Top pastors by earnings</p>
          <div className="mt-4 flex flex-col gap-2">
            {topPastors.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No pastor earnings yet.</p>
            )}
            {topPastors.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--gold)]/20 text-xs font-bold text-[var(--gold)]">{i + 1}</span>
                  {p.name}
                </span>
                <span className="text-[var(--gold)]">${p.earnedTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-sm font-semibold">Account status</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat label="Active" value={users.filter((u) => !u.suspended).length} accent="text-profit" />
            <MiniStat label="Suspended" value={users.filter((u) => u.suspended).length} accent="text-loss" />
            <MiniStat label="Pastors" value={data.pastors.length} accent="text-[var(--gold)]" />
            <MiniStat label="Applications" value={data.pastorApplications.length} />
          </div>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value, accent = "" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-3 text-center">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">{label}</p>
    </div>
  );
}
