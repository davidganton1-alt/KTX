"use client";

export function FlockAnalytics({ referrals, shareRate }: {
  referrals: any[];
  shareRate: number;
}) {
  const totalMembers = referrals.length;
  const activeMembers = referrals.filter(r => (r.deposited ?? 0) > 0).length;
  const dormantMembers = totalMembers - activeMembers;
  const engagementRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

  // Tier distribution
  const tierCounts: Record<string, number> = { faithful: 0, steward: 0, ambassador: 0, none: 0 };
  referrals.forEach(r => {
    const t = r.tier ?? "none";
    tierCounts[t] = (tierCounts[t] ?? 0) + 1;
  });

  const totalDeposits = referrals.reduce((s, r) => s + (r.deposited ?? 0), 0);
  const totalProfit = referrals.reduce((s, r) => s + (r.profit ?? 0), 0);
  const yourEarnings = totalProfit * (shareRate / 100);

  const tierColors: Record<string, string> = {
    faithful: "#f59e0b",
    steward: "#22d3ee",
    ambassador: "#F5C97B",
    none: "#64748b",
  };

  return (
    <div className="space-y-4">
      {/* Engagement Score */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-4">Flock Engagement</h3>
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={engagementRate > 60 ? "#10b981" : engagementRate > 30 ? "#f59e0b" : "#ef4444"}
                strokeWidth="10"
                strokeDasharray={`${(engagementRate / 100) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-extrabold text-[var(--fg)]">{engagementRate.toFixed(0)}%</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-[var(--card)] p-3 text-center">
              <p className="text-lg font-extrabold text-[var(--fg)]">{totalMembers}</p>
              <p className="text-[10px] text-[var(--muted)]">Total</p>
            </div>
            <div className="rounded-lg bg-[var(--profit)]/10 p-3 text-center">
              <p className="text-lg font-extrabold text-[var(--profit)]">{activeMembers}</p>
              <p className="text-[10px] text-[var(--muted)]">Active</p>
            </div>
            <div className="rounded-lg bg-[var(--loss)]/10 p-3 text-center">
              <p className="text-lg font-extrabold text-[var(--loss)]">{dormantMembers}</p>
              <p className="text-[10px] text-[var(--muted)]">Dormant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-4">Flock Tier Distribution</h3>
        <div className="space-y-3">
          {Object.entries(tierCounts).filter(([, count]) => count > 0).map(([tier, count]) => (
            <div key={tier} className="flex items-center gap-3">
              <span className="w-20 text-xs capitalize text-[var(--muted)]">{tier}</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--card)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(count / totalMembers) * 100}%`, backgroundColor: tierColors[tier] }}
                />
              </div>
              <span className="w-8 text-right text-xs font-bold text-[var(--fg)]">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-4">Flock Financials</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[var(--muted)]">Flock Deposits</p>
            <p className="mt-1 text-xl font-extrabold text-[var(--fg)]">${totalDeposits.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Flock Profit</p>
            <p className="mt-1 text-xl font-extrabold text-[var(--profit)]">${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Your Share ({shareRate}%)</p>
            <p className="mt-1 text-xl font-extrabold text-[var(--gold)]">${yourEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
