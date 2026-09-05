"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberEmblem } from "@/components/MemberEmblem";
import { GlowCard } from "@/components/GlowCard";
import { Sparkline } from "@/components/Sparkline";
import { TradeEngine } from "@/components/TradeEngine";

const fmt = (p: number) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TABS = ["flock", "earnings", "activity", "leaderboard", "engine"] as const;
type Tab = (typeof TABS)[number];

export default function PastorPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("flock");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    const res = await fetch("/api/pastor/me");
    if (res.status === 401 || res.status === 403) { router.push("/login"); return; }
    if (res.ok) setData(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function requestPayout() {
    setNote(null);
    const res = await fetch("/api/pastor/payout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: Number(payoutAmount) }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok) {
      setNote(`Payout of $${Number(payoutAmount).toFixed(2)} requested. The admin will review it shortly.`);
      setPayoutAmount("");
      load();
    } else setNote(json?.error || "Failed");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }

  if (!data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
      </div>
    );
  }

  const fullLink = `${typeof window !== "undefined" ? window.location.origin : ""}${data.inviteLink}`;
  const flockDeposits = (data.referrals ?? []).reduce((s: number, u: any) => s + (u.deposited ?? 0), 0);
  const history: number[] = (data.profitHistory ?? []).map((h: any) => (typeof h === "number" ? h : h?.amount ?? h?.value ?? 0));

  return (
    <main className="container-wide pb-20 pt-10">
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MemberEmblem name={data.name} className="h-14 w-14" />
          <div>
            <p className="eyebrow">Pastor console</p>
            <h1 className="text-2xl font-extrabold md:text-3xl">{data.name}</h1>
            <p className="text-xs text-[var(--muted)]">{data.email}</p>
          </div>
        </div>
        <button
          onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); }}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-loss transition hover:border-loss"
        >
          Sign out
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlowCard className="p-5"><p className="eyebrow">Referrals</p><p className="mt-2 text-3xl font-extrabold text-[var(--cyan)]">{data.referralsCount ?? 0}</p></GlowCard>
        <GlowCard className="p-5"><p className="eyebrow">Flock deposits</p><p className="mt-2 text-3xl font-extrabold">${fmt(flockDeposits)}</p></GlowCard>
        <GlowCard className="p-5"><p className="eyebrow">Total earned</p><p className="mt-2 text-3xl font-extrabold text-profit">${fmt(data.earnedTotal ?? 0)}</p></GlowCard>
        <GlowCard className="p-5"><p className="eyebrow">Available</p><p className="mt-2 text-3xl font-extrabold text-[var(--gold)]">${fmt(data.available ?? 0)}</p><p className="mt-1 text-[10px] text-[var(--muted)]">share rate {data.shareRate ?? 5}%</p></GlowCard>
      </div>

      {/* ── INVITE LINK ── */}
      <GlowCard className="mt-5 p-5">
        <p className="eyebrow">Your shepherd link</p>
        <div className="mt-3 flex gap-2">
          <input readOnly value={fullLink} onFocus={(e) => e.target.select()}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-xs text-[var(--gold)] outline-none" />
          <button onClick={copyLink} className="btn-gold shrink-0 !px-5">{copied ? "Copied ✓" : "Copy"}</button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">Anyone who registers through this link joins your flock.</p>
      </GlowCard>

      {/* ── TABS ── */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`pill capitalize transition ${tab === t ? "!border-[var(--gold)] !text-[var(--gold)] bg-[var(--gold)]/10" : ""}`}>
            {t === "engine" ? "AI Trade Engine" : t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "flock" && (
          <GlowCard className="p-6">
            <p className="eyebrow mb-4">Your flock</p>
            {(data.referrals ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted)]">No members yet — share your shepherd link.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="text-[9px] uppercase tracking-widest text-[var(--muted)]">
                    <tr><th className="px-2 py-2">Name</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Plan</th><th className="px-2 py-2">Deposited</th><th className="px-2 py-2">Profit</th><th className="px-2 py-2">Your share</th></tr>
                  </thead>
                  <tbody>
                    {(data.referrals ?? []).map((u: any) => (
                      <tr key={u.id} className="border-t border-[var(--border)]">
                        <td className="px-2 py-2 font-bold">{u.name}</td>
                        <td className="px-2 py-2 text-[var(--muted)]">{u.email}</td>
                        <td className="px-2 py-2 text-[var(--gold)]">{u.tier ?? "—"}</td>
                        <td className="px-2 py-2">${fmt(u.deposited ?? 0)}</td>
                        <td className="px-2 py-2 text-profit">${fmt(u.profit ?? 0)}</td>
                        <td className="px-2 py-2 text-[var(--gold)]">${fmt(((u.profit ?? 0) * (u.pastorShareRate ?? data.shareRate ?? 5)) / 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlowCard>
        )}

        {tab === "earnings" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <GlowCard className="p-6">
              <p className="eyebrow mb-3">Daily earnings</p>
              {history.length > 1 ? <Sparkline points={history} up /> : <p className="py-8 text-center text-sm text-[var(--muted)]">No earnings history yet.</p>}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} placeholder="0.00"
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-profit" />
                <button onClick={requestPayout} disabled={!payoutAmount || Number(payoutAmount) <= 0 || (data.available ?? 0) <= 0}
                  className="rounded-full bg-gradient-to-r from-profit to-cyan-light px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">
                  Request payout
                </button>
              </div>
              {note && <p className="mt-3 text-xs text-[var(--gold)]">{note}</p>}
            </GlowCard>
            <GlowCard className="p-6">
              <p className="eyebrow mb-4">Payout history</p>
              {(data.payouts ?? []).length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted)]">No payouts yet.</p>
              ) : (
                <div className="space-y-2">
                  {(data.payouts ?? []).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 text-sm">
                      <span className="font-bold">${fmt(p.amount ?? 0)}</span>
                      <span className={`text-xs font-bold uppercase ${p.status === "approved" ? "text-profit" : p.status === "rejected" ? "text-loss" : "text-[var(--gold)]"}`}>{p.status}</span>
                      <span className="text-xs text-[var(--muted)]">{new Date(p.date ?? p.requestedAt ?? Date.now()).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </div>
        )}

        {tab === "activity" && (
          <GlowCard className="p-6">
            <p className="eyebrow mb-4">Activity feed</p>
            {(data.events ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted)]">No activity yet.</p>
            ) : (
              <div className="space-y-2 font-mono text-[11px]">
                {(data.events ?? []).map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-4 py-2.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${e.type === "joined" ? "bg-cyan-light" : e.type === "deposit" ? "bg-gold-light" : e.type === "payout" ? "bg-loss" : "bg-profit"}`} />
                    <span className="font-bold uppercase text-[var(--muted)]">{e.type}</span>
                    <span className="text-[var(--fg)]">{e.text ?? e.detail ?? e.name ?? ""}</span>
                    <span className="ml-auto text-[var(--muted)]">{new Date(e.at ?? e.date ?? Date.now()).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </GlowCard>
        )}

        {tab === "leaderboard" && (
          <GlowCard className="p-6">
            <p className="eyebrow mb-4">Shepherds leaderboard</p>
            <div className="space-y-2">
              {(data.leaders ?? []).map((l: any) => (
                <div key={l.rank} className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${l.isYou ? "border-[var(--gold)] bg-[var(--gold)]/[0.06]" : "border-[var(--border)]"}`}>
                  <span className={`w-8 text-center text-lg font-extrabold ${l.rank === 1 ? "text-[var(--gold)]" : l.rank === 2 ? "text-[var(--cyan)]" : l.rank === 3 ? "text-[var(--purple)]" : "text-[var(--muted)]"}`}>#{l.rank}</span>
                  <MemberEmblem name={l.name} className="h-9 w-9" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{l.name} {l.isYou && <span className="text-[var(--gold)]">· you</span>}</p>
                    <p className="text-xs text-[var(--muted)]">{l.ministry}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--cyan)]">{l.referrals} referrals</p>
                    <p className="text-xs text-profit">${fmt(l.earnedTotal ?? 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        )}

        {tab === "engine" && (
          <GlowCard className="p-6">
            <p className="eyebrow mb-4">Watch the engine your flock benefits from</p>
            <TradeEngine demo />
          </GlowCard>
        )}
      </div>
    </main>
  );
}
