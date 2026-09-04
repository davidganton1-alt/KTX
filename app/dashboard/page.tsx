"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Wallet = {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
  freeCredit: number;
  deposited: number;
  balance: number;
  profit: number;
  dailyRate: number;
  lastProfitDate: string;
  profitHistory: { date: string; profit: number }[];
  withdrawals: { id: string; amount: number; requestedAt: number; status: string }[];
  freeCreditUnlocked: boolean;
  pastorName?: string;
  pastorShareRate?: number;
};

type Trade = { id: string; symbol: string; side: "BUY" | "SELL"; qty: number; at: number };

export default function DashboardPage() {
  const router = useRouter();
  const [w, setW] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tickProfit, setTickProfit] = useState(0);
  const liveRef = useRef<number | null>(null);

  async function load() {
    const res = await fetch("/api/wallet/state");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    setW(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  // Real-time AI trading loop: ticks profit + shows live trades.
  useEffect(() => {
    if (!w) return;
    if (w.tier === "none") return;
    let active = true;
    async function tickOnce() {
      try {
        const res = await fetch("/api/wallet/tick", { method: "POST" });
        const json = await res.json();
        if (json.ok) {
          if (json.trade) setTrades((t) => [json.trade, ...t].slice(0, 12));
          if (json.tick) setTickProfit((p) => +(p + json.tick).toFixed(4));
          if (active) setW((prev) => (prev ? { ...prev, profit: json.profit, balance: json.balance } : prev));
        }
      } catch {
        /* ignore transient errors */
      }
    }
    tickOnce();
    liveRef.current = window.setInterval(tickOnce, 4000);
    return () => {
      active = false;
      if (liveRef.current) window.clearInterval(liveRef.current);
    };
  }, [w?.tier, w?.id]);

  async function accrue() {
    setBusy(true);
    const res = await fetch("/api/wallet/accrue", { method: "POST" });
    const json = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg(`Today's profit added: $${json.todayProfit.toFixed(2)}`);
      load();
    }
  }

  async function withdraw() {
    setError(null);
    setMsg(null);
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
      return;
    }
    setMsg(`Withdrawal of $${Number(amount).toFixed(2)} requested.`);
    setAmount("");
    load();
  }

  if (!w) {
    return <main className="container-wide py-24 text-[var(--muted)]">Loading…</main>;
  }

  const history = w.profitHistory;
  const maxP = Math.max(1, ...history.map((h) => h.profit));
  const totalPrincipal = w.deposited + (w.freeCreditUnlocked ? w.freeCredit : 0);
  const tierLabel = { faithful: "Faithful", steward: "Steward", ambassador: "Ambassador", none: "No plan" } as const;

  return (
    <div className="container-wide px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {w.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Signed in as <span className="text-[var(--gold)]">{w.role}</span> ·{" "}
            {tierLabel[w.tier as keyof typeof tierLabel]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/markets" className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm transition hover:border-[var(--gold)] hover:text-[var(--gold)]">
            Markets
          </a>
          <LogoutButton />
        </div>
      </div>

      {/* STATS */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Balance</p>
          <p className="mt-2 text-2xl font-bold">${w.balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">principal ${totalPrincipal.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Available profit</p>
          <p className="mt-2 text-2xl font-bold text-profit">${w.profit.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {tickProfit > 0 ? `+${(tickProfit).toFixed(4)} live` : "withdrawable"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Daily target</p>
          <p className="mt-2 text-2xl font-bold text-[var(--gold)]">
            {w.dailyRate > 0 ? `${(w.dailyRate * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {w.tier === "none" ? "fund to start" : tierLabel[w.tier as keyof typeof tierLabel]}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Free credit</p>
          <p className="mt-2 text-2xl font-bold">${w.freeCredit}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {w.freeCreditUnlocked ? "unlocked" : "unlocks after deposit"}
          </p>
        </div>
      </div>

      {/* YOUR PASTOR */}
      {w.pastorName && (
        <div className="mt-8 rounded-2xl border border-[var(--gold)]/40 bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold">Your pastor</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            You were brought in by <span className="text-[var(--gold)]">{w.pastorName}</span>. As you
            grow, {w.pastorName} receives a <span className="text-[var(--gold)]">{w.pastorShareRate}%</span>{" "}
            share of the profit you accrue, as a thank-you for shepherding you into this work.
          </p>
        </div>
      )}

      {/* LIVE AI TRADING */}
      <div className="mt-8 rounded-2xl border border-[var(--gold)]/40 bg-gradient-to-r from-royal-violet/10 via-navy-700/20 to-cyan-light/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI trading live</h2>
          <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-profit" /> live
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          The AI is working across crypto, US stocks and commodities. Profit accrues in real time below.
        </p>
        <div className="mt-4 max-h-56 space-y-2 overflow-y-auto">
          {trades.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Waiting for the first trade…</p>
          ) : (
            trades.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-2 text-sm">
                <span className="font-mono">{t.symbol}</span>
                <span className={t.side === "BUY" ? "text-profit" : "text-loss"}>{t.side}</span>
                <span className="text-[var(--muted)]">{t.qty}</span>
                <span className="text-xs text-[var(--muted)]">{new Date(t.at).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={accrue} disabled={busy} className="rounded-full bg-gradient-to-r from-royal-violet to-cyan-light px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60">
          {busy ? "Running AI…" : "Run today's AI profit"}
        </button>
        {w.tier === "none" && (
          <a href="/wallet" className="rounded-full border border-[var(--border)] px-5 py-2 text-sm transition hover:border-[var(--gold)] hover:text-[var(--gold)]">
            Fund a plan to earn
          </a>
        )}
        {msg && <span className="text-sm text-profit">{msg}</span>}
      </div>

      {/* PROFIT GROWTH */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold">Daily profit growth</h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No profit yet. Fund a plan and run the AI to start accruing daily profit.</p>
        ) : (
          <div className="mt-4 flex h-40 items-end gap-1">
            {history.map((h, i) => (
              <div key={i} title={`${h.date}: +$${h.profit.toFixed(2)}`} className="flex-1 rounded-t bg-gradient-to-t from-royal-violet to-cyan-light" style={{ height: `${(h.profit / maxP) * 100}%`, minHeight: 3 }} />
            ))}
          </div>
        )}
      </div>

      {/* WITHDRAW PROFIT */}
      <div className="mt-6 rounded-2xl border border-[var(--gold)]/40 bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold">Withdraw profit</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          You can withdraw <strong>profit only</strong>. Your deposit and free credit stay invested.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs text-[var(--muted)]">Amount (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
          </div>
          <button onClick={withdraw} disabled={!w.profit} className="rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-6 py-3 font-semibold text-white shadow-gold transition hover:brightness-110 disabled:opacity-50">
            Request withdrawal
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-loss">{error}</p>}
        {w.withdrawals.length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Withdrawal history</p>
            <div className="mt-2 flex flex-col gap-2">
              {w.withdrawals.slice().reverse().map((x) => (
                <div key={x.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-2 text-sm">
                  <span>${x.amount.toFixed(2)}</span>
                  <span className={x.status === "approved" ? "text-profit" : x.status === "rejected" ? "text-loss" : "text-[var(--muted)]"}>{x.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-[var(--muted)]">
        Projections are illustrative. This is a demonstration build, no real funds or trading occur.
      </p>
    </div>
  );
}

function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm transition hover:border-loss hover:text-loss">
      Sign out
    </button>
  );
}
