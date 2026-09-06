"use client";

export function PortfolioChart({ deposited, profit, freeCredit }: {
  deposited: number;
  profit: number;
  freeCredit: number;
}) {
  const total = deposited + profit + freeCredit;
  if (total <= 0) return null;

  const segments = [
    { label: "Principal", value: deposited, color: "#22d3ee" },
    { label: "Profit", value: profit, color: "#10b981" },
    { label: "Free Credit", value: freeCredit, color: "#F5C97B" },
  ].filter(s => s.value > 0);

  // Build conic gradient
  let accumulated = 0;
  const gradientStops = segments.map(s => {
    const start = (accumulated / total) * 360;
    accumulated += s.value;
    const end = (accumulated / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-4">Portfolio Allocation</h3>
      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative h-32 w-32 shrink-0">
          <div
            className="h-full w-full rounded-full"
            style={{ background: `conic-gradient(${gradientStops})` }}
          />
          <div className="absolute inset-3 rounded-full bg-[var(--bg-soft)] flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-extrabold text-[var(--fg)]">${total >= 1000 ? `${(total/1000).toFixed(1)}k` : total.toFixed(0)}</p>
              <p className="text-[9px] text-[var(--muted)]">TOTAL</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-[var(--muted)]">{s.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--fg)]">${s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-[10px] text-[var(--muted)]">{((s.value / total) * 100).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
