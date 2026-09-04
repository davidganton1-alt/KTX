"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TradeEngine } from "@/components/TradeEngine";

type Referral = {
  id: string;
  name: string;
  email: string;
  tier: string;
  deposited: number;
  profit: number;
  pastorShareRate?: number;
};
type Event = {
  id: string;
  text: string;
  kind: "joined" | "deposit" | "earn" | "payout";
  at: number;
};
type Payout = {
  id: string;
  amount: number;
  requestedAt: number;
  status: string;
};
type Leader = {
  rank: number;
  name: string;
  ministry: string;
  referrals: number;
  earnedTotal: number;
  isYou: boolean;
};
type PastorData = {
  name: string;
  email: string;
  earnedTotal: number;
  available: number;
  shareRate: number;
  referrals: Referral[];
  referralsCount: number;
  inviteLink: string;
  events: Event[];
  payouts: Payout[];
  profitHistory: { date: string; profit: number }[];
  leaders: Leader[];
};

const SKELETON: PastorData = {
  name: "Pastor",
  email: "",
  earnedTotal: 0,
  available: 0,
  shareRate: 5,
  referrals: [],
  referralsCount: 0,
  inviteLink: "",
  events: [],
  payouts: [],
  profitHistory: [],
  leaders: [],
};

const KIND_ICON: Record<Event["kind"], string> = {
  joined: "✦",
  deposit: "◈",
  earn: "▲",
  payout: "◉",
};

function money(n: number) {
  return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default function PastorPanel() {
  const router = useRouter();
  const [data, setData] = useState<PastorData>(SKELETON);
  const [tab, setTab] = useState<"flock" | "earnings" | "activity" | "leaderboard" | "trade">("flock");
  const [note, setNote] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [copied, setCopied] = useState(false);

  async function load() {
    const res = await fetch("/api/pastor/me");
    if (res.status === 401 || res.status === 403) {
      router.push("/login");
      return;
    }
    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  const totalDeposited = data.referrals.reduce((s, r) => s + r.deposited, 0);
  const fullLink = typeof window !== "undefined" ? `${window.location.origin}${data.inviteLink}` : data.inviteLink;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function requestPayout() {
    setNote(null);
    const res = await fetch("/api/pastor/payout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: Number(payoutAmount) }),
    });
    const json = await res.json();
    if (res.ok) {
      setNote(`Payout of $${Number(payoutAmount).toFixed(2)} requested. The admin will review it shortly.`);
      setPayoutAmount("");
      load();
    } else setNote(json.error || "Failed");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-[var(--border)] bg-[var(--card)] p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-2 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[var(--gold)] to-royal-violet font-bold text-[#0a0e27]">
            ✝
          </div>
          <div>
            <p className="text-sm font-semibold">{data.name}</p>
            <p className="text-xs text-[var(--gold)]">Pastor panel</p>
          </div>
        </div>
        <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
          {[
            { id: "flock", label: "Your flock" },
            { id: "earnings", label: "Earnings & payout" },
            { id: "activity", label: "Activity feed" },
            { id: "leaderboard", label: "Pastor leaderboard" },
            { id: "trade", label: "AI Trade Engine" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                tab === t.id
                  ? "bg-gradient-to-r from-royal-violet/30 to-cyan-light/20 text-[var(--fg)]"
                  : "text-[var(--muted)] hover:bg-[var(--bg)]"
              }`}
            >
              {t.label}
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

          {tab === "flock" && (
            <>
              <h2 className="text-2xl font-bold">Your flock</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                The members the Lord has entrusted to you through this work. As they grow, you
                receive a {data.shareRate}% share of the profit they accrue.
              </p>

              {/* Shareable referral link */}
              <div className="mt-6 rounded-2xl border border-[var(--gold)]/40 bg-[var(--card)] p-5">
                <p className="text-sm font-semibold">Invite members with your personal link</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Share this link and everyone who signs up through it joins your flock
                  automatically. No need to ask them to type your name.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    readOnly
                    value={fullLink}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-xs text-[var(--gold)] outline-none"
                  />
                  <button
                    onClick={copyLink}
                    className="rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-6 py-3 text-sm font-semibold text-white shadow-gold transition hover:brightness-110"
                  >
                    {copied ? "Copied ✓" : "Copy link"}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Referrals</p>
                  <p className="mt-2 text-2xl font-bold">{data.referralsCount}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Flock deposits</p>
                  <p className="mt-2 text-2xl font-bold">${totalDeposited.toLocaleString("en-US")}</p>
                </div>
                <div className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--card)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Your earnings (demo)</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--gold)]">
                    ${data.earnedTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{data.shareRate}% of flock profit</p>
                </div>
              </div>

              <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
                Members you referred
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="text-left text-[var(--muted)]">
                      <th className="py-2">Name</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Deposited</th>
                      <th>Profit</th>
                      <th>Your share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.referrals.map((r) => (
                      <tr key={r.id} className="border-t border-[var(--border)]">
                        <td className="py-2 font-medium">{r.name}</td>
                        <td className="text-[var(--muted)]">{r.email}</td>
                        <td className="capitalize">{r.tier}</td>
                        <td>${r.deposited.toLocaleString("en-US")}</td>
                        <td className="text-profit">${r.profit.toFixed(2)}</td>
                        <td className="text-[var(--gold)]">
                          ${((r.profit * (r.pastorShareRate ?? data.shareRate)) / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {data.referrals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-[var(--muted)]">
                          No members yet. Share your invite link above, and everyone who signs up
                          through it will appear here as your flock.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 max-w-2xl text-sm text-[var(--muted)]">
                Invite members to sign up and enter your name in the &ldquo;Referred by&rdquo;
                field, or share your personal link. They join your flock, and their growth
                becomes your shared blessing.
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                &ldquo;And the Lord added to their number daily those who were being saved.&rdquo; Acts 2:47
              </p>
            </>
          )}

          {tab === "earnings" && (
            <>
              <h2 className="text-2xl font-bold">Earnings &amp; payout</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Your share of your flock&rsquo;s profit, credited live. Request a payout of
                your available balance at any time.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--card)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Total earned</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--gold)]">
                    ${data.earnedTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-2xl border border-profit/40 bg-[var(--card)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Available for payout</p>
                  <p className="mt-2 text-2xl font-bold text-profit">
                    ${data.available.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Share rate</p>
                  <p className="mt-2 text-2xl font-bold">{data.shareRate}%</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">of each member&rsquo;s accrued profit</p>
                </div>
              </div>

              {/* Earnings chart */}
              <div className="mt-6 rounded-2xl border border-[var(--border)] p-5">
                <p className="text-sm font-semibold">Daily earnings</p>
                {data.profitHistory.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    No earnings yet. As your flock accrues profit, your daily share appears here.
                  </p>
                ) : (
                  <div className="mt-4 flex h-36 items-end gap-1.5">
                    {data.profitHistory.slice(-30).map((h) => {
                      const max = Math.max(...data.profitHistory.map((x) => x.profit), 0.0001);
                      return (
                        <div key={h.date} className="group relative flex-1">
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-[var(--gold)]/60 to-[var(--gold)] transition-all group-hover:from-[var(--gold)] group-hover:to-[var(--gold)]"
                            style={{ height: `${(h.profit / max) * 120 + 6}px` }}
                          />
                          <span className="pointer-events-none absolute -top-6 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--card)] px-2 py-0.5 text-[10px] shadow-lg group-hover:block">
                            {h.date}: ${h.profit.toFixed(4)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payout flow */}
              <div className="mt-6 rounded-2xl border border-profit/30 p-5">
                <p className="text-sm font-semibold">Request a payout</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Available balance: ${data.available.toFixed(2)}. Payouts are reviewed by the
                  admin before release.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-profit"
                  />
                  <button
                    onClick={requestPayout}
                    disabled={!payoutAmount || Number(payoutAmount) <= 0 || data.available <= 0}
                    className="rounded-full bg-gradient-to-r from-profit to-cyan-light px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
                  >
                    Request payout
                  </button>
                </div>
              </div>

              <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
                Payout history
              </h3>
              {data.payouts.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted)]">No payout requests yet.</p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {data.payouts.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm">
                      <span className="font-semibold">{money(p.amount)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${p.status === "approved" ? "bg-profit/20 text-profit" : p.status === "rejected" ? "bg-loss/20 text-loss" : "bg-[var(--border)] text-[var(--muted)]"}`}>
                        {p.status}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{new Date(p.requestedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "activity" && (
            <>
              <h2 className="text-2xl font-bold">Flock activity</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Live events from your flock: joins, deposits, and your credited shares.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {data.events.length === 0 && (
                  <p className="text-sm text-[var(--muted)]">
                    No activity yet. Invite members with your personal link on the Your flock tab.
                  </p>
                )}
                {data.events.map((e) => (
                  <div key={e.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                        e.kind === "earn"
                          ? "bg-profit/20 text-profit"
                          : e.kind === "joined"
                          ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                          : e.kind === "deposit"
                          ? "bg-cyan-light/20 text-cyan-light"
                          : "bg-royal-violet/20 text-royal-violet"
                      }`}
                    >
                      {KIND_ICON[e.kind]}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm">{e.text}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{new Date(e.at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "leaderboard" && (
            <>
              <h2 className="text-2xl font-bold">Pastor leaderboard</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Ranked by members served, then by earnings. &ldquo;Well done, good and faithful
                servant.&rdquo; Matthew 25:21
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {data.leaders.length === 0 && (
                  <p className="text-sm text-[var(--muted)]">No pastors on the board yet.</p>
                )}
                {data.leaders.map((l) => (
                  <div
                    key={l.name + l.rank}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                      l.isYou ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--border)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          l.rank === 1
                            ? "bg-[var(--gold)] text-[#0a0e27]"
                            : l.rank === 2
                            ? "bg-[var(--gold)]/50 text-[#0a0e27]"
                            : l.rank === 3
                            ? "bg-[var(--gold)]/25 text-[var(--gold)]"
                            : "bg-[var(--border)] text-[var(--muted)]"
                        }`}
                      >
                        {l.rank}
                      </span>
                      <div>
                        <p className="font-medium">
                          {l.name} {l.isYou && <span className="text-xs text-[var(--gold)]">(you)</span>}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{l.ministry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-[var(--muted)]">{l.referrals} members</span>
                      <span className="font-semibold text-[var(--gold)]">${l.earnedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "trade" && (
            <>
              <h2 className="text-2xl font-bold">AI Trade Engine</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                The same engine your flock uses, shown here as a live demo. Watch the candles and
                the trades the AI takes, without the depth book.
              </p>
              <div className="mt-6">
                <TradeEngine demo />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
