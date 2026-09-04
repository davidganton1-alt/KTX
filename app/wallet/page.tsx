"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
type Wallet = {
  tier: string;
  freeCredit: number;
  deposited: number;
  balance: number;
  profit: number;
  dailyRate: number;
  freeCreditUnlocked: boolean;
  holdMonths: number;
};

const TIERS = [
  { key: "faithful", label: "Faithful", min: 100, max: 500, rate: "0.5%", hold: 6, perk: "Crypto, US stocks & commodities." },
  { key: "steward", label: "Steward", min: 650, max: 1500, rate: "0.75%", hold: 9, perk: "Advanced AI across all markets." },
  { key: "ambassador", label: "Ambassador", min: 2000, max: 1000000, rate: "1.0%", hold: 12, perk: "Elite AI desk, dedicated guardrails." },
];

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tier, setTier] = useState("faithful");
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/wallet/state");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    setWallet(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function deposit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), tier }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Deposit failed");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal as="main" variant="scale" className="container-page py-16">
      <div>
        <p className="eyebrow">Your treasury</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Your <span className="gradient-text">wallet</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Fund a tier to activate the AI desk. Your $50 credit unlocks for profit
          withdrawal once you add your own funds. Profit is yours to take out daily;
          your deposit stays at work.
        </p>
      </div>

      {wallet && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Balance</p>
            <p className="mt-2 text-2xl font-bold">
              ${wallet.balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">free ${wallet.freeCredit} + deposits + profit</p>
          </div>
          <div className="card p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Available profit</p>
            <p className="mt-2 text-2xl font-bold text-profit">
              ${wallet.profit.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">withdrawable daily</p>
          </div>
          <div className="card p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Daily target</p>
            <p className="mt-2 text-2xl font-bold text-[var(--gold)]">
              {wallet.dailyRate > 0 ? `${(wallet.dailyRate * 100).toFixed(1)}%` : "—"}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {wallet.tier === "none" ? "fund a tier to start" : wallet.tier}
            </p>
          </div>
        </div>
      )}

      <div className="mt-10 card p-6">
        <h2 className="text-lg font-semibold">Add funds (choose a tier)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TIERS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTier(t.key);
                setAmount(t.min);
              }}
              className={`rounded-xl border p-4 text-left transition ${
                tier === t.key
                  ? "border-[var(--gold)] bg-[var(--gold)]/10"
                  : "border-[var(--border)] hover:border-[var(--gold)]"
              }`}
            >
              <div className="font-semibold">{t.label}</div>
              <div className="text-xs text-[var(--muted)]">
                {t.rate}/day · ${t.min}+
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">{t.perk}</div>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs text-[var(--muted)]">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              min={TIERS.find((t) => t.key === tier)?.min}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />
          </div>
          <button
            onClick={deposit}
            disabled={busy}
            className="btn-primary disabled:opacity-60"
          >
            {busy ? "Processing…" : "Add funds"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-loss">{error}</p>}
        <p className="mt-3 text-xs text-[var(--muted)]">
          Simulation only — no real funds move. This demonstrates the deposit and tier flow.
        </p>
      </div>

      <div className="mt-8 card-grad p-6">
        <h3 className="text-lg font-semibold">Withdraw your deposit, on your terms</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You may withdraw your deposit at any time. Withdrawing before your plan&rsquo;s
          hold period (6, 9 or 12 months) carries a 25% fee, because the AI builds
          positions on a horizon. After the hold, you withdraw the full deposit with no
          fee. Profit, however, is yours to take out every single day.
        </p>
        <Link href="/plans" className="btn-ghost mt-4 inline-flex">See the plans</Link>
      </div>
    </Reveal>
  );
}
