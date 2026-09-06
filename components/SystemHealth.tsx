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
    <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">System Health</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Engine Status */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${engineMode === "live" ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="text-xs font-bold text-white">AI Engine</span>
          </div>
          <p className={`text-lg font-extrabold ${engineMode === "live" ? "text-emerald-400" : "text-amber-400"}`}>
            {engineMode.toUpperCase()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Trading mode active</p>
        </div>

        {/* API Health */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`h-2.5 w-2.5 rounded-full ${apiHealth === "healthy" ? "bg-emerald-500" : apiHealth === "degraded" ? "bg-red-500" : "bg-slate-500 animate-pulse"}`} />
            <span className="text-xs font-bold text-white">API Status</span>
          </div>
          <p className={`text-lg font-extrabold ${apiHealth === "healthy" ? "text-emerald-400" : apiHealth === "degraded" ? "text-red-400" : "text-slate-400"}`}>
            {apiHealth === "checking" ? "Checking..." : apiHealth === "healthy" ? "HEALTHY" : "DEGRADED"}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Response: {uptime}</p>
        </div>

        {/* Data Sources */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            <span className="text-xs font-bold text-white">Data Feeds</span>
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Yahoo Finance</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">CoinGecko</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Engine State</span>
              <span className="text-amber-400">In-Memory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
