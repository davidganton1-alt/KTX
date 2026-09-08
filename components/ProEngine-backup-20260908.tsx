"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, Time, CandlestickData } from "lightweight-charts";
import { useLiveCandles, LiveCandle } from "@/hooks/useLiveCandles";

const SYMBOLS = ["BTC", "ETH", "SOL", "AAPL", "NVDA", "XAU", "WTI"];

function calcRSI(candles: LiveCandle[], period = 14): number {
  if (candles.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff > 0) gains += diff; else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function calcMA(candles: LiveCandle[], period: number): number {
  if (candles.length < period) return 0;
  return candles.slice(-period).reduce((s, c) => s + c.close, 0) / period;
}

export function ProEngine({ initialSymbol = "BTC" }: { initialSymbol?: string }) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [activePanel, setActivePanel] = useState<"positions" | "trades" | "analysis">("positions");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lastTimeRef = useRef(0);
  const initRef = useRef(false);
  const prevSymRef = useRef(symbol);

  const {
    historicalCandles, liveCandles, currentPrice, change24h,
    positions, closedTrades, bids, asks, source, isReady,
  } = useLiveCandles(symbol);

  const up = change24h >= 0;
  const allCandles = useMemo(() => [...historicalCandles, ...liveCandles], [historicalCandles, liveCandles]);
  const rsi = useMemo(() => calcRSI(allCandles), [allCandles]);
  const ma20 = useMemo(() => calcMA(allCandles, 20), [allCandles]);
  const ma50 = useMemo(() => calcMA(allCandles, 50), [allCandles]);
  const maBullish = ma20 > ma50;
  const signalStrength = Math.min(97, Math.round(50 + Math.abs(change24h) * 3 + (maBullish ? 15 : 0) + (rsi > 50 ? 10 : -5)));

  const openPnl = positions.reduce((sum, p) => {
    const pnl = p.side === "BUY" ? (currentPrice - p.entry) * p.qty : (p.entry - currentPrice) * p.qty;
    return sum + pnl;
  }, 0);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#94a3b8", fontSize: 11 },
      grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
      crosshair: { mode: 0, vertLine: { color: "#F5C97B", width: 1, style: 2, labelBackgroundColor: "#F5C97B" }, horzLine: { color: "#F5C97B", width: 1, style: 2, labelBackgroundColor: "#F5C97B" } },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)", scaleMargins: { top: 0.05, bottom: 0.25 } },
      timeScale: { borderColor: "rgba(255,255,255,0.1)", timeVisible: true, secondsVisible: true, rightOffset: 5, barSpacing: 8 },
      width: chartContainerRef.current.clientWidth,
      height: 340,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981", downColor: "#ef4444",
      borderUpColor: "#10b981", borderDownColor: "#ef4444",
      wickUpColor: "#10b981", wickDownColor: "#ef4444",
    });

    const volSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    chartRef.current = chart;
    seriesRef.current = candleSeries;
    volumeRef.current = volSeries;

    const resize = () => chartContainerRef.current && chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); chart.remove(); chartRef.current = null; seriesRef.current = null; volumeRef.current = null; initRef.current = false; lastTimeRef.current = 0; };
  }, []);

  useEffect(() => {
    if (prevSymRef.current !== symbol) { initRef.current = false; lastTimeRef.current = 0; prevSymRef.current = symbol; }
  }, [symbol]);

  // Load historical
  useEffect(() => {
    if (!seriesRef.current || !isReady || historicalCandles.length === 0 || initRef.current) return;
    seriesRef.current.setData(historicalCandles.map(c => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close })));
    volumeRef.current?.setData(historicalCandles.map(c => ({ time: c.time as Time, value: c.volume, color: c.close >= c.open ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)" })));
    chartRef.current?.timeScale().fitContent();
    initRef.current = true;
    lastTimeRef.current = historicalCandles[historicalCandles.length - 1]?.time ?? 0;
  }, [isReady, historicalCandles]);

  // Update live candles
  useEffect(() => {
    if (!seriesRef.current || !initRef.current || liveCandles.length === 0) return;
    const last = liveCandles[liveCandles.length - 1];
    if (!last) return;

    seriesRef.current.update({ time: last.time as Time, open: last.open, high: last.high, low: last.low, close: last.close });
    volumeRef.current?.update({ time: last.time as Time, value: last.volume, color: last.close >= last.open ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)" });

    if (last.time > lastTimeRef.current) {
      lastTimeRef.current = last.time;
      chartRef.current?.timeScale().scrollToRealTime();
    }
  }, [liveCandles]);

  const maxBid = Math.max(...bids.map(b => b.q ?? 0), 0.001);
  const maxAsk = Math.max(...asks.map(a => a.q ?? 0), 0.001);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#0B0F19] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {SYMBOLS.map(s => (
              <button key={s} onClick={() => setSymbol(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${symbol === s ? "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/40" : "border border-white/10 text-slate-400 hover:border-[var(--gold)]/40"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-white tabular-nums">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className={`text-sm font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>{up ? "▲" : "▼"} {change24h.toFixed(2)}%</span>
          <span className={`flex items-center gap-1.5 text-xs ${source === "live" ? "text-emerald-400" : "text-amber-400"}`}>
            <span className={`h-2 w-2 rounded-full animate-pulse ${source === "live" ? "bg-emerald-500" : "bg-amber-500"}`} />
            {source === "live" ? "LIVE" : "SIM"}
          </span>
        </div>
      </div>

      {/* Chart + Order Book */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3 rounded-xl border border-white/5 bg-[#0B0F19] p-4">
          {!isReady ? (
            <div className="flex h-[340px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>
          ) : (
            <div ref={chartContainerRef} className="w-full" />
          )}
        </div>

        {/* Order Book */}
        <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Order Book</h4>
          <div className="space-y-0.5 font-mono text-[10px]">
            {[...asks].sort((a, b) => b.p - a.p).slice(0, 6).map((a, i) => (
              <div key={i} className="relative flex justify-between px-1 py-0.5">
                <div className="absolute inset-y-0 right-0 bg-red-500/10" style={{ width: `${(a.q / maxAsk) * 100}%` }} />
                <span className="relative text-red-400">{a.p?.toFixed(2)}</span>
                <span className="relative text-slate-500">{a.q?.toFixed(3)}</span>
              </div>
            ))}
            <div className="my-1.5 flex items-center justify-center gap-2 border-y border-white/10 py-1">
              <span className={`text-sm font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>{currentPrice.toFixed(2)}</span>
            </div>
            {bids.slice(0, 6).map((b, i) => (
              <div key={i} className="relative flex justify-between px-1 py-0.5">
                <div className="absolute inset-y-0 right-0 bg-emerald-500/10" style={{ width: `${(b.q / maxBid) * 100}%` }} />
                <span className="relative text-emerald-400">{b.p?.toFixed(2)}</span>
                <span className="relative text-slate-500">{b.q?.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="rounded-xl border border-white/5 bg-[#0B0F19]">
        <div className="flex border-b border-white/5">
          {(["positions", "trades", "analysis"] as const).map(tab => (
            <button key={tab} onClick={() => setActivePanel(tab)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${activePanel === tab ? "border-b-2 border-[var(--gold)] text-[var(--gold)]" : "text-slate-500 hover:text-white"}`}>
              {tab === "positions" ? `Open Positions (${positions.length})` : tab === "trades" ? `Trade History` : `Technical Analysis`}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* POSITIONS */}
          {activePanel === "positions" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">Unrealized P&L</span>
                <span className={`text-sm font-bold ${openPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {openPnl >= 0 ? "+" : ""}${openPnl.toFixed(2)}
                </span>
              </div>
              {positions.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">Engine scanning for disciplined entries...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead><tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-500">
                      <th className="px-2 py-2">Symbol</th><th className="px-2 py-2">Side</th><th className="px-2 py-2">Entry</th>
                      <th className="px-2 py-2">Current</th><th className="px-2 py-2">P&L</th><th className="px-2 py-2">Held</th><th className="px-2 py-2">Technique</th>
                    </tr></thead>
                    <tbody>
                      {positions.map(p => {
                        const pnl = p.side === "BUY" ? (currentPrice - p.entry) * p.qty : (p.entry - currentPrice) * p.qty;
                        const held = Math.floor((Date.now() - p.openedAt) / 1000);
                        return (
                          <tr key={p.id} className="border-b border-white/5">
                            <td className="px-2 py-2 font-bold text-white">{p.symbol}</td>
                            <td className={`px-2 py-2 font-bold ${p.side === "BUY" ? "text-emerald-400" : "text-red-400"}`}>{p.side}</td>
                            <td className="px-2 py-2 text-slate-400">${p.entry.toFixed(2)}</td>
                            <td className="px-2 py-2 text-white">${currentPrice.toFixed(2)}</td>
                            <td className={`px-2 py-2 font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}</td>
                            <td className="px-2 py-2 text-slate-500">{held}s</td>
                            <td className="px-2 py-2 text-[var(--gold)]">{p.technique}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TRADES */}
          {activePanel === "trades" && (
            <div>
              {closedTrades.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">No closed trades yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead><tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-500">
                      <th className="px-2 py-2">Symbol</th><th className="px-2 py-2">Side</th><th className="px-2 py-2">Entry</th>
                      <th className="px-2 py-2">Exit</th><th className="px-2 py-2">P&L</th><th className="px-2 py-2">Technique</th>
                    </tr></thead>
                    <tbody>
                      {closedTrades.slice(0, 15).map(t => (
                        <tr key={t.id} className="border-b border-white/5">
                          <td className="px-2 py-2 font-bold text-white">{t.symbol}</td>
                          <td className={`px-2 py-2 font-bold ${t.side === "BUY" ? "text-emerald-400" : "text-red-400"}`}>{t.side}</td>
                          <td className="px-2 py-2 text-slate-400">${t.entry.toFixed(2)}</td>
                          <td className="px-2 py-2 text-slate-400">${t.exit.toFixed(2)}</td>
                          <td className={`px-2 py-2 font-bold ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}</td>
                          <td className="px-2 py-2 text-[var(--gold)]">{t.technique}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ANALYSIS */}
          {activePanel === "analysis" && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-slate-500">RSI (14)</p>
                <p className={`mt-2 text-2xl font-extrabold ${rsi > 70 ? "text-red-400" : rsi < 30 ? "text-emerald-400" : "text-white"}`}>{rsi.toFixed(1)}</p>
                <p className="mt-1 text-[10px] text-slate-500">{rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"}</p>
                <div className="mt-2 h-1.5 rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${rsi > 70 ? "bg-red-400" : rsi < 30 ? "bg-emerald-400" : "bg-[var(--gold)]"}`} style={{ width: `${rsi}%` }} />
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-slate-500">MA Crossover</p>
                <p className={`mt-2 text-2xl font-extrabold ${maBullish ? "text-emerald-400" : "text-red-400"}`}>{maBullish ? "BULL" : "BEAR"}</p>
                <p className="mt-1 text-[10px] text-slate-500">MA20 {maBullish ? ">" : "<"} MA50</p>
                <p className="mt-2 text-[10px] text-slate-400">MA20: ${ma20.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">MA50: ${ma50.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-slate-500">Signal Strength</p>
                <p className="mt-2 text-2xl font-extrabold text-[var(--gold)]">{signalStrength}%</p>
                <p className="mt-1 text-[10px] text-slate-500">{signalStrength > 70 ? "Strong" : signalStrength > 45 ? "Moderate" : "Weak"}</p>
                <div className="mt-2 h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" style={{ width: `${signalStrength}%` }} />
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-slate-500">Win Rate</p>
                <p className="mt-2 text-2xl font-extrabold text-white">
                  {closedTrades.length > 0 ? ((closedTrades.filter(t => t.pnl > 0).length / closedTrades.length) * 100).toFixed(0) : "—"}%
                </p>
                <p className="mt-1 text-[10px] text-slate-500">{closedTrades.length} trades closed</p>
                <p className="mt-2 text-[10px] text-emerald-400">{closedTrades.filter(t => t.pnl > 0).length} wins</p>
                <p className="text-[10px] text-red-400">{closedTrades.filter(t => t.pnl <= 0).length} losses</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
