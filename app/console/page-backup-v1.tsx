"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { TradeEngine } from "@/components/TradeEngine";

type Wallet = {
  id: string;
  name: string;
  email: string;
  tier: string;
  freeCredit: number;
  deposited: number;
  balance: number;
  profit: number;
  dailyRate: number;
  lastProfitDate: string;
  profitHistory: { date: string; profit: number }[];
  deposits: { id: string; amount: number; tier: string; at: number }[];
  withdrawals: { id: string; amount: number; type?: string; fee?: number; requestedAt: number; status: string }[];
  freeCreditUnlocked: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  holdMonths: number;
  referralBonusEarned: number;
  memberReferralsCount: number;
  notifications: { id: string; text: string; kind: string; at: number }[];
  lastSeenNotifs: number;
};

const SKELETON_WALLET: Wallet = {
  id: "",
  name: "Member",
  email: "",
  tier: "none",
  freeCredit: 0,
  deposited: 0,
  balance: 0,
  profit: 0,
  dailyRate: 0,
  lastProfitDate: "",
  profitHistory: [],
  deposits: [],
  withdrawals: [],
  freeCreditUnlocked: false,
  emailVerified: false,
  twoFactorEnabled: false,
  holdMonths: 0,
  referralBonusEarned: 0,
  memberReferralsCount: 0,
  notifications: [],
  lastSeenNotifs: 0,
};

const TIER_LABEL: Record<string, string> = {
  faithful: "Faithful",
  steward: "Steward",
  ambassador: "Ambassador",
  none: "No plan",
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "wallet", label: "Wallet" },
  { id: "calendar", label: "Profit Calendar" },
  { id: "insights", label: "AI Insights" },
  { id: "trading", label: "AI Trade Engine" },
  { id: "deposit", label: "Deposit" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "referrals", label: "Invite & Earn" },
  { id: "notifications", label: "Notifications" },
  { id: "markets", label: "Markets" },
  { id: "security", label: "Security" },
  { id: "profile", label: "Profile" },
];

export default function ConsolePage() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [w, setW] = useState<Wallet>(SKELETON_WALLET);
  const [markets, setMarkets] = useState<{ symbol: string; name: string; class: string; price: number; change24h: number }[]>([]);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dMsg, setDMsg] = useState<string | null>(null);
  const [liveProfit, setLiveProfit] = useState(0);
  const [depAmount, setDepAmount] = useState("");
  const [depTier, setDepTier] = useState<"faithful" | "steward" | "ambassador">("steward");
  const [depMsg, setDepMsg] = useState<string | null>(null);
  const [depErr, setDepErr] = useState<string | null>(null);
  // Invite & Earn
  const [ref, setRef] = useState<{ code: string; link: string; bonus: number; referralBonusEarned: number; referrals: { id: string; name: string; email: string; tier: string; joinedAt: number; funded: boolean }[] } | null>(null);
  const [refCopied, setRefCopied] = useState(false);
  // Notifications
  const [notifs, setNotifs] = useState<{ notifications: { id: string; text: string; kind: string; at: number }[]; announcements: { id: string; title: string; body: string; createdAt: number }[] } | null>(null);

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

  // Real-time profit accrual on the overview.
  useEffect(() => {
    if (!w || w.tier === "none" || w.dailyRate <= 0) return;
    let active = true;
    async function tick() {
      try {
        const res = await fetch("/api/wallet/tick", { method: "POST" });
        const json = await res.json();
        if (json.ok && active) {
          if (json.tick) setLiveProfit((p) => +(p + json.tick).toFixed(4));
          setW((prev) => (prev ? { ...prev, profit: json.profit, balance: json.balance } : prev));
        }
      } catch {
        /* ignore */
      }
    }
    tick();
    const id = window.setInterval(tick, 3500);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [w?.tier, w?.dailyRate, w?.id]);

  useEffect(() => {
    if (tab !== "markets") return;
    fetch("/api/markets")
      .then((r) => r.json())
      .then((j) => setMarkets(j.assets.slice(0, 12)))
      .catch(() => {});
  }, [tab]);

  useEffect(() => {
    if (tab !== "referrals") return;
    fetch("/api/user/referral")
      .then((r) => r.json())
      .then(setRef)
      .catch(() => {});
  }, [tab]);

  useEffect(() => {
    if (tab !== "notifications") return;
    fetch("/api/user/notifications")
      .then((r) => r.json())
      .then(setNotifs)
      .catch(() => {});
  }, [tab]);

  async function copyRefLink() {
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${ref.link}`);
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
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

  async function withdrawDeposit() {
    setDMsg(null);
    const res = await fetch("/api/wallet/withdraw-deposit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    const json = await res.json();
    if (!res.ok) {
      setDMsg(json.error);
      return;
    }
    const feeNote = json.penaltyPct > 0 ? ` (25% early deduction applied, you receive $${json.net.toFixed(2)})` : " (no deduction)";
    setDMsg(`Deposit withdrawal of $${Number(amount).toFixed(2)} requested${feeNote}.`);
    setAmount("");
    load();
  }

  async function deposit() {
    setDepErr(null);
    setDepMsg(null);
    const amt = Number(depAmount);
    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: amt, tier: depTier }),
    });
    const json = await res.json();
    if (!res.ok) {
      setDepErr(json.error);
      return;
    }
    setDepMsg(`Deposit of $${amt.toFixed(2)} confirmed to your ${TIER_LABEL[json.tier]} plan. Your $50 free credit is now unlocked.`);
    setDepAmount("");
    load();
  }

  async function security(action: string) {
    const res = await fetch("/api/security", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    if (!res.ok) return;
    load();
  }

  const principal = w.deposited + (w.freeCreditUnlocked ? w.freeCredit : 0);
  const maxP = Math.max(1, ...w.profitHistory.map((h) => h.profit));

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* sidebar */}
      <aside className="w-full shrink-0 border-b border-[var(--border)] bg-[var(--card)] p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-2 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-royal-violet to-cyan-light font-bold text-white">
            {w.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-semibold">{w.name}</p>
            <p className="text-xs text-[var(--gold)]">{TIER_LABEL[w.tier]}</p>
          </div>
        </div>
        <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
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

      {/* content */}
      <main className="flex-1 px-4 py-8 md:px-10 md:py-10">
        <div className="container-wide">
        {tab === "overview" && (
          <>
            <h2 className="text-2xl font-bold">Overview</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Balance" value={`$${w.balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} liveValue={w.balance} />
              <Stat
                label="Available profit"
                value={`$${w.profit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                liveValue={w.profit}
                accent="text-profit"
              />
              <Stat label="Daily target" value={w.dailyRate > 0 ? `${(w.dailyRate * 100).toFixed(1)}%` : "—"} accent="text-[var(--gold)]" />
              <Stat label="Deposited" value={`$${w.deposited.toLocaleString("en-US")}`} />
              <Stat label="Free credit" value={`$${w.freeCredit}`} />
              <Stat label="Plan" value={TIER_LABEL[w.tier]} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-profit" />
              {w.dailyRate > 0
                ? `AI accruing live${liveProfit > 0 ? ` · +$${liveProfit.toFixed(4)} this session` : ""}`
                : "Add a plan to start earning"}
            </div>
            <div className="mt-6 rounded-2xl border border-[var(--gold)]/30 p-5">
              <p className="text-sm font-semibold">Withdraw profit</p>
              <p className="mt-1 text-sm text-[var(--muted)]">You may withdraw profit only. Your deposit stays invested.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                <button onClick={withdraw} disabled={!w.profit} className="rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-6 py-3 font-semibold text-white shadow-gold transition hover:brightness-110 disabled:opacity-50">
                  Request withdrawal
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-loss">{error}</p>}
              {msg && <p className="mt-3 text-sm text-profit">{msg}</p>}
            </div>
          </>
        )}

        {tab === "wallet" && (
          <>
            <h2 className="text-2xl font-bold">Wallet</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Balance" value={`$${w.balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} />
              <Stat label="Principal" value={`$${principal.toFixed(2)}`} />
              <Stat label="Available profit" value={`$${w.profit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} accent="text-profit" />
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--gold)]/40 p-5">
              <p className="text-sm font-semibold">Withdraw your deposit</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                You can withdraw your deposit any time. Withdrawing before the
                {` ${w.holdMonths}-month `}holding period for the {TIER_LABEL[w.tier]} plan carries a 25% deduction. After that, you receive the full amount with no deduction.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                <button onClick={withdrawDeposit} disabled={!w.deposited} className="rounded-full bg-gradient-to-r from-royal-violet to-cyan-light px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">
                  Request deposit withdrawal
                </button>
              </div>
              {dMsg && <p className="mt-3 text-sm text-[var(--gold)]">{dMsg}</p>}
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">Deposit history</h3>
            {w.deposits.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">No deposits yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {w.deposits.slice().reverse().map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-2 text-sm">
                    <span>${d.amount.toLocaleString("en-US")}</span>
                    <span className="text-[var(--muted)]">{TIER_LABEL[d.tier] ?? d.tier}</span>
                    <span className="text-xs text-[var(--muted)]">{new Date(d.at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "deposit" && (
          <>
            <h2 className="text-2xl font-bold">Deposit funds</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Choose a biblical-named plan, fund it with crypto, and the AI Trade Engine begins compounding for you the same day. Your $50 free credit unlocks on your first deposit.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(["faithful", "steward", "ambassador"] as const).map((t) => {
                const conf = {
  faithful: { label: "Faithful", min: 100, max: 500, rate: "0.5%" },
  steward: { label: "Steward", min: 650, max: 1500, rate: "0.75%" },
  ambassador: { label: "Ambassador", min: 2000, max: 100000, rate: "1.0%" },
}[t];
                const active = depTier === t;
                return (
                  <button
                    key={t}
                    onClick={() => setDepTier(t)}
                    className={`rounded-2xl border p-5 text-left transition ${active ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--border)] hover:border-[var(--gold)]"}`}
                  >
                    <p className="text-lg font-bold">{conf.label}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">${conf.min} to ${conf.max === 100000 ? "and up" : `$${conf.max}`}</p>
                    <p className="mt-3 text-2xl font-extrabold text-[var(--gold)]">{conf.rate} / day</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--gold)]/40 p-5">
              <p className="text-sm font-semibold">Confirm your deposit</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <input
                  type="number"
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
                />
                <span className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
                  {TIER_LABEL[depTier]}
                </span>
                <button
                  onClick={deposit}
                  disabled={!depAmount || Number(depAmount) <= 0}
                  className="rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-6 py-3 font-semibold text-white shadow-gold transition hover:brightness-110 disabled:opacity-50"
                >
                  Deposit
                </button>
              </div>
              {depErr && <p className="mt-3 text-sm text-loss">{depErr}</p>}
              {depMsg && <p className="mt-3 text-sm text-profit">{depMsg}</p>}
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">Deposit history</h3>
            {w.deposits.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">No deposits yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {w.deposits.slice().reverse().map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-2 text-sm">
                    <span>${d.amount.toLocaleString("en-US")}</span>
                    <span className="text-[var(--muted)]">{TIER_LABEL[d.tier] ?? d.tier}</span>
                    <span className="text-xs text-[var(--muted)]">{new Date(d.at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "security" && (
          <>
            <h2 className="text-2xl font-bold">Security</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Stewardship means protecting what is entrusted to you. Confirm your identity and add a second factor so only you can move funds.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Email verification</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${w.emailVerified ? "bg-profit/20 text-profit" : "bg-[var(--border)] text-[var(--muted)]"}`}>
                    {w.emailVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{w.email}</p>
                {!w.emailVerified && (
                  <button onClick={() => security("verify-email")} className="mt-4 rounded-full bg-gradient-to-r from-royal-violet to-cyan-light px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                    Verify email
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Two-factor authentication</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${w.twoFactorEnabled ? "bg-profit/20 text-profit" : "bg-[var(--border)] text-[var(--muted)]"}`}>
                    {w.twoFactorEnabled ? "On" : "Off"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Require a time-based code from your authenticator app on every sign in.
                </p>
                {w.twoFactorEnabled ? (
                  <button onClick={() => security("disable-2fa")} className="mt-4 rounded-full border border-loss px-5 py-2 text-sm font-semibold text-loss transition hover:bg-loss/10">
                    Disable 2FA
                  </button>
                ) : (
                  <button onClick={() => security("enable-2fa")} className="mt-4 rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border)] p-5 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--fg)]">How 2FA works here</p>
              <p className="mt-2">
                KingdomTradeX issues a standard TOTP secret (the same kind Google Authenticator, Authy and 1Password read). On a live build, a QR code is shown once, you scan it, and every future login asks for the rotating 6-digit code. In this preview the secret is generated and stored securely so you can see the flow end to end.
              </p>
            </div>
          </>
        )}

        {tab === "trading" && (
          <TradeEngine />
        )}

        {tab === "withdrawals" && (
          <>
            <h2 className="text-2xl font-bold">Withdrawals</h2>
            <div className="mt-6 rounded-2xl border border-[var(--gold)]/30 p-5">
              <p className="text-sm font-semibold">Request a profit withdrawal</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
                <button onClick={withdraw} disabled={!w.profit} className="rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-6 py-3 font-semibold text-white shadow-gold transition hover:brightness-110 disabled:opacity-50">
                  Request withdrawal
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-loss">{error}</p>}
              {msg && <p className="mt-3 text-sm text-profit">{msg}</p>}
            </div>
            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">Withdrawal history</h3>
            {w.withdrawals.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">No withdrawal requests yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {w.withdrawals.slice().reverse().map((x) => {
                  const isDeposit = x.type === "deposit";
                  const fee = x.fee ?? 0;
                  const net = isDeposit ? x.amount - fee : x.amount;
                  return (
                    <div key={x.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm">
                      <span className="rounded-full bg-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                        {isDeposit ? "Deposit" : "Profit"}
                      </span>
                      <span className="font-semibold">${x.amount.toFixed(2)}</span>
                      {isDeposit && fee > 0 && (
                        <span className="text-xs text-loss">25% fee ${fee.toFixed(2)}</span>
                      )}
                      {isDeposit && fee > 0 && (
                        <span className="text-xs text-[var(--muted)]">net ${net.toFixed(2)}</span>
                      )}
                      <span className={x.status === "approved" ? "text-profit" : x.status === "rejected" ? "text-loss" : "text-[var(--muted)]"}>{x.status}</span>
                      <span className="text-xs text-[var(--muted)]">{new Date(x.requestedAt).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "markets" && (
          <>
            <h2 className="text-2xl font-bold">Markets</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {markets.map((m) => (
                <div key={m.symbol} className="rounded-xl border border-[var(--border)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-semibold">{m.symbol}</p>
                    <span className="text-xs text-[var(--muted)]">{m.class}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{m.name}</p>
                  <p className="mt-2 text-lg font-bold">${m.price.toLocaleString("en-US")}</p>
                  <p className={`text-sm ${m.change24h >= 0 ? "text-profit" : "text-loss"}`}>
                    {m.change24h >= 0 ? "+" : ""}{m.change24h}%
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "profile" && (
          <>
            <h2 className="text-2xl font-bold">Profile</h2>
            <div className="mt-6 space-y-3 text-sm">
              <Row k="Name" v={w.name} />
              <Row k="Email" v={w.email} />
              <Row k="Plan" v={TIER_LABEL[w.tier]} />
              <Row k="Daily target" v={w.dailyRate > 0 ? `${(w.dailyRate * 100).toFixed(1)}%` : "—"} />
              <Row k="Free credit" v={`$${w.freeCredit} (${w.freeCreditUnlocked ? "unlocked" : "locked until deposit"})`} />
              <Row k="Referral bonus earned" v={`$${(w.referralBonusEarned || 0).toFixed(2)}`} />
              <Row k="Members you invited" v={`${w.memberReferralsCount || 0}`} />
            </div>
          </>
        )}

        {tab === "calendar" && <ProfitCalendar history={w.profitHistory} />}

        {tab === "insights" && (
          <>
            <h2 className="text-2xl font-bold">AI Insights</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              What the engine has done with your account so far, computed live from your records.
            </p>
            <Insights w={w} />
          </>
        )}

        {tab === "referrals" && (
          <>
            <h2 className="text-2xl font-bold">Invite &amp; Earn</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Share your personal invite link. When someone signs up through it and funds
              their first plan, you receive a $25 bonus credit.
            </p>
            {!ref ? (
              <p className="mt-6 text-sm text-[var(--muted)]">Loading your invite link…</p>
            ) : (
              <>
                <div className="mt-6 max-w-2xl rounded-2xl border border-[var(--gold)]/40 bg-[var(--card)] p-5">
                  <p className="text-sm font-semibold">Your invite link</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}${ref.link}`}
                      onFocus={(e) => e.target.select()}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-xs text-[var(--gold)] outline-none"
                    />
                    <button
                      onClick={copyRefLink}
                      className="rounded-full bg-gradient-to-r from-gold-light to-royal-violet px-6 py-3 text-sm font-semibold text-white shadow-gold transition hover:brightness-110"
                    >
                      {refCopied ? "Copied ✓" : "Copy link"}
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[var(--border)] p-3 text-center">
                      <p className="text-2xl font-bold text-[var(--gold)]">${ref.bonus}</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">Per funded invite</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] p-3 text-center">
                      <p className="text-2xl font-bold">{ref.referrals.length}</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">Invited</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] p-3 text-center">
                      <p className="text-2xl font-bold text-profit">${ref.referralBonusEarned.toFixed(2)}</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">Bonus earned</p>
                    </div>
                  </div>
                </div>
                <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">People you invited</h3>
                {ref.referrals.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">No invites yet. Share your link and grow your circle.</p>
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    {ref.referrals.map((r) => (
                      <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-[var(--muted)]">{TIER_LABEL[r.tier] ?? r.tier}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${r.funded ? "bg-profit/20 text-profit" : "bg-[var(--border)] text-[var(--muted)]"}`}>
                          {r.funded ? "Funded" : "Not funded yet"}
                        </span>
                        <span className="text-xs text-[var(--muted)]">{new Date(r.joinedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-6 text-xs text-[var(--muted)]">
                  &ldquo;Iron sharpens iron, and one person sharpens another.&rdquo; Proverbs 27:17
                </p>
              </>
            )}
          </>
        )}

        {tab === "notifications" && (
          <>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Platform announcements and updates about your account.
            </p>
            {!notifs ? (
              <p className="mt-6 text-sm text-[var(--muted)]">Loading…</p>
            ) : (
              <div className="mt-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">From the platform</h3>
                  <div className="mt-3 flex flex-col gap-2">
                    {notifs.announcements.length === 0 && (
                      <p className="text-sm text-[var(--muted)]">No announcements right now.</p>
                    )}
                    {notifs.announcements.map((a) => (
                      <div key={a.id} className="rounded-xl border border-[var(--gold)]/30 bg-[var(--card)] px-4 py-3">
                        <p className="font-medium">{a.title}</p>
                        {a.body && <p className="mt-1 text-sm text-[var(--muted)]">{a.body}</p>}
                        <p className="mt-1 text-xs text-[var(--muted)]">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">Your account</h3>
                  <div className="mt-3 flex flex-col gap-2">
                    {notifs.notifications.length === 0 && (
                      <p className="text-sm text-[var(--muted)]">Nothing yet. Deposits, withdrawals and referral bonuses will show up here.</p>
                    )}
                    {notifs.notifications.map((n) => (
                      <div key={n.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                            n.kind === "withdrawal"
                              ? "bg-loss/20 text-loss"
                              : n.kind === "referral"
                              ? "bg-profit/20 text-profit"
                              : "bg-[var(--gold)]/20 text-[var(--gold)]"
                          }`}
                        >
                          {n.kind === "withdrawal" ? "↗" : n.kind === "referral" ? "✦" : "◆"}
                        </span>
                        <div>
                          <p className="text-sm">{n.text}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">{new Date(n.at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, accent = "", liveValue }: { label: string; value: string; accent?: string; liveValue?: number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-xl font-bold ${accent}`}>
        {liveValue != null ? <AnimatedNumber value={liveValue} prefix="$" decimals={2} /> : value}
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-[var(--border)] pb-2">
      <span className="text-[var(--muted)]">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

/* ---------------- Profit Calendar (heatmap) ---------------- */

function ProfitCalendar({ history }: { history: { date: string; profit: number }[] }) {
  const byDate = new Map(history.map((h) => [h.date, h.profit]));
  // Last 42 days (6 weeks), oldest first.
  const days: { date: string; profit: number }[] = [];
  const now = new Date();
  for (let i = 41; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, profit: byDate.get(key) || 0 });
  }
  const max = Math.max(0.0001, ...days.map((d) => d.profit));
  const activeDays = days.filter((d) => d.profit > 0).length;
  const best = days.reduce((a, b) => (b.profit > a.profit ? b : a), days[0]);
  const total42 = days.reduce((s, d) => s + d.profit, 0);

  function shade(p: number) {
    if (p <= 0) return "bg-[var(--bg)]";
    const t = p / max;
    if (t < 0.25) return "bg-profit/20";
    if (t < 0.5) return "bg-profit/40";
    if (t < 0.75) return "bg-profit/60";
    return "bg-profit/90";
  }

  return (
    <>
      <h2 className="text-2xl font-bold">Profit Calendar</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Every square is a day. Greener means more profit accrued. Hover a square for the number.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] p-4">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Days earning (6 weeks)</p>
          <p className="mt-2 text-2xl font-bold">{activeDays} / 42</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] p-4">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Best day</p>
          <p className="mt-2 text-2xl font-bold text-profit">
            ${best.profit > 0 ? best.profit.toFixed(2) : "0.00"}
          </p>
          {best.profit > 0 && <p className="mt-1 text-xs text-[var(--muted)]">{best.date}</p>}
        </div>
        <div className="rounded-2xl border border-[var(--border)] p-4">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Total (6 weeks)</p>
          <p className="mt-2 text-2xl font-bold text-profit">${total42.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-[var(--border)] p-5">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((d) => (
            <div
              key={d.date}
              className={`group relative aspect-square rounded-md ${shade(d.profit)} transition hover:ring-1 hover:ring-profit`}
            >
              <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--card)] px-2 py-0.5 text-[10px] shadow-lg group-hover:block">
                {d.date}: ${d.profit.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
          <span>Less</span>
          <span className="h-3 w-3 rounded-sm bg-[var(--bg)]" />
          <span className="h-3 w-3 rounded-sm bg-profit/20" />
          <span className="h-3 w-3 rounded-sm bg-profit/40" />
          <span className="h-3 w-3 rounded-sm bg-profit/60" />
          <span className="h-3 w-3 rounded-sm bg-profit/90" />
          <span>More</span>
        </div>
      </div>
    </>
  );
}

/* ---------------- AI Insights ---------------- */

function Insights({ w }: { w: Wallet }) {
  const history = w.profitHistory || [];
  const days = history.filter((h) => h.profit > 0).length;
  const totalProfit = w.profit;
  const avg = days > 0 ? totalProfit / days : 0;
  const best = history.reduce(
    (a, b) => (b.profit > (a?.profit ?? 0) ? b : a),
    undefined as { date: string; profit: number } | undefined
  );
  // Simple weekly trend: last 7 earning days vs previous 7 earning days.
  const earningDays = history.filter((h) => h.profit > 0);
  const last7 = earningDays.slice(-7).reduce((s, h) => s + h.profit, 0);
  const prev7 = earningDays.slice(-14, -7).reduce((s, h) => s + h.profit, 0);
  const trend = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : last7 > 0 ? 100 : 0;
  // Simulated engine stats for the demo narrative.
  const tradesPerDay = 14;
  const winRate = 68;

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Total profit to date</p>
          <p className="mt-2 text-2xl font-bold text-profit">
            ${totalProfit.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Average per earning day</p>
          <p className="mt-2 text-2xl font-bold">${avg.toFixed(2)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{days} earning day{days === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Weekly trend</p>
          <p className={`mt-2 text-2xl font-bold ${trend >= 0 ? "text-profit" : "text-loss"}`}>
            {trend >= 0 ? "+" : ""}{trend.toFixed(0)}%
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">vs the previous week</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-sm font-semibold">Engine report</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <ReportRow k="Signals evaluated today" v={`${tradesPerDay * 6}`} />
            <ReportRow k="Trades executed today" v={`${tradesPerDay}`} />
            <ReportRow k="Win rate (30 days)" v={`${winRate}%`} accent="text-profit" />
            <ReportRow k="Best asset class" v="Crypto momentum" />
            <ReportRow k="Risk guardrail" v="Active, 2% max drawdown" accent="text-profit" />
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-sm font-semibold">Highlights</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {best && best.profit > 0 && (
              <ReportRow k={`Best day (${best.date})`} v={`$${best.profit.toFixed(2)}`} accent="text-profit" />
            )}
            <ReportRow k="Plan" v={TIER_LABEL[w.tier]} />
            <ReportRow k="Daily target" v={w.dailyRate > 0 ? `${(w.dailyRate * 100).toFixed(1)}%` : "No plan active"} />
            <ReportRow k="Principal working" v={`$${(w.deposited + (w.freeCreditUnlocked ? w.freeCredit : 0)).toFixed(2)}`} />
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            The engine compounds every day your plan is active. Trade figures are part of the
            demo simulation shown on this platform.
          </p>
        </div>
      </div>
    </>
  );
}

function ReportRow({ k, v, accent = "" }: { k: string; v: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 last:border-0">
      <span className="text-[var(--muted)]">{k}</span>
      <span className={`font-medium ${accent}`}>{v}</span>
    </div>
  );
}
