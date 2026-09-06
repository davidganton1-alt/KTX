"use client";
import { useEffect, useState } from "react";

export function SystemHealth() {
  const [engineMode, setEngineMode] = useState("demo");
  const [apiHealth, setApiHealth] = useState<"checking" | "healthy" | "degraded">("checking");
  const [uptime, setUptime] = useState("—");

  useEffect(() => {
    async function check() {
      try {
        const start = Date.now();
        const res = await fetch("/api/markets", { cache: "no-store" });
        const elapsed = Date.now() - start;
        setApiHealth(res.ok && elapsed < 3000 ? "healthy" : "degraded");
        setUptime(`${elapsed}ms`);
      } catch {
        setApiHealth("degraded");
      }
      try {
        const engRes = await fetch("/api/admin/engine-mode", { cache: "no-store" });
        if (engRes.ok) {
          const d = await engRes.json();
          setEngineMode(d.engineMode ?? "demo");
        }
      } catch {}
    }
    check();
    const t = setInterval(check, 30000); // Check every 30s
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-4">System Health</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Engine Status */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${engineMode === "live" ? "bg-emerald-500" : "bg-[var(--gold)]"}`} />
            <span className="text-xs font-bold text-[var(--fg)]">AI Engine</span>
          </div>
          <p className={`text-lg font-extrabold ${engineMode === "live" ? "text-[var(--profit)]" : "text-[var(--gold)]"}`}>
            {engineMode.toUpperCase()}
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-1">Trading mode active</p>
        </div>

        {/* API Health */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`h-2.5 w-2.5 rounded-full ${apiHealth === "healthy" ? "bg-emerald-500" : apiHealth === "degraded" ? "bg-red-500" : "bg-slate-500 animate-pulse"}`} />
            <span className="text-xs font-bold text-[var(--fg)]">API Status</span>
          </div>
          <p className={`text-lg font-extrabold ${apiHealth === "healthy" ? "text-[var(--profit)]" : apiHealth === "degraded" ? "text-[var(--loss)]" : "text-[var(--muted)]"}`}>
            {apiHealth === "checking" ? "Checking..." : apiHealth === "healthy" ? "HEALTHY" : "DEGRADED"}
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-1">Response: {uptime}</p>
        </div>

        {/* Data Sources */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--cyan)]" />
            <span className="text-xs font-bold text-[var(--fg)]">Data Feeds</span>
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-[var(--muted)]">Yahoo Finance</span>
              <span className="text-[var(--profit)]">Active</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[var(--muted)]">CoinGecko</span>
              <span className="text-[var(--profit)]">Active</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[var(--muted)]">Engine State</span>
              <span className="text-[var(--gold)]">In-Memory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
