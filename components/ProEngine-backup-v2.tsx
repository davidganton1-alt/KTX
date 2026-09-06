"use client";
import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, Time, CandlestickData } from "lightweight-charts";

type Candle = { t: number; o: number; h: number; l: number; c: number };
type Position = { id: string; symbol: string; side: string; entry: number; qty: number; openedAt: number; technique: string };

export function ProEngine({ symbol = "BTC" }: { symbol?: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const initializedRef = useRef(false);
  const prevSymbolRef = useRef(symbol);
  
  const [price, setPrice] = useState(0);
  const [change, setChange] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [source, setSource] = useState("live");
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Initialize Chart (once)
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#94a3b8" },
      grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
      crosshair: { mode: 0, vertLine: { color: "#F5C97B", width: 1, style: 2 }, horzLine: { color: "#F5C97B", width: 1, style: 2 } },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
      timeScale: { borderColor: "rgba(255,255,255,0.1)", timeVisible: true, rightOffset: 5 },
      width: chartContainerRef.current.clientWidth,
      height: 350,
    });
    
    const series = chart.addCandlestickSeries({
      upColor: "#10b981", downColor: "#ef4444",
      borderUpColor: "#10b981", borderDownColor: "#ef4444",
      wickUpColor: "#10b981", wickDownColor: "#ef4444",
    });
    
    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  // Data Polling (500ms) — FIXED: uses update() instead of setData()
  useEffect(() => {
    let active = true;
    
    // Reset initialization flag when symbol changes
    if (prevSymbolRef.current !== symbol) {
      initializedRef.current = false;
      prevSymbolRef.current = symbol;
    }

    async function pull() {
      try {
        const res = await fetch(`/api/aitrading2?symbol=${symbol}&range=1D`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !seriesRef.current || !data.candles?.length) return;
        
        setPrice(data.price);
        setChange(data.change24h);
        setPositions(data.openPositions || []);
        setSource(data.source);
        setLastUpdate(Date.now());

        const mappedCandles: CandlestickData<Time>[] = data.candles.map((c: Candle) => ({
          time: (c.t / 1000) as Time,
          open: c.o, high: c.h, low: c.l, close: c.c,
        }));

        if (!initializedRef.current) {
          // First load or symbol change: set all data
          seriesRef.current.setData(mappedCandles);
          chartRef.current?.timeScale().fitContent();
          initializedRef.current = true;
        } else {
          // Subsequent updates: only update the LAST candle (smooth, no flicker)
          const lastCandle = mappedCandles[mappedCandles.length - 1];
          if (lastCandle) {
            seriesRef.current.update(lastCandle);
          }
        }
      } catch {
        // Silently keep last good data
      }
    }
    
    pull(); // Initial fetch
    const t = setInterval(pull, 500); // Poll every 500ms
    
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [symbol]);

  const up = change >= 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Chart Area */}
      <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#0B0F19] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">{symbol}/USD</span>
            <span className={`text-sm font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
              {up ? "▲" : "▼"} {change.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className={`h-2 w-2 rounded-full ${source === "live" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            {source === "live" ? "Live Feed" : "Simulated"} · {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </div>
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Right Panel: Positions */}
      <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-4 flex flex-col">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Open Positions ({positions.length})</h3>
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px]">
          {positions.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">Engine scanning for entries...</p>
          ) : (
            positions.map(p => {
              const pnl = p.side === "BUY" ? (price - p.entry) * p.qty : (p.entry - price) * p.qty;
              const held = Math.floor((Date.now() - p.openedAt) / 1000);
              return (
                <div key={p.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{p.symbol} <span className={p.side === "BUY" ? "text-emerald-400" : "text-red-400"}>{p.side}</span></span>
                    <span className={`font-mono text-sm font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                    <span>Entry: ${p.entry.toFixed(2)}</span>
                    <span>Held: {held}s</span>
                  </div>
                  <div className="mt-1 text-[10px] text-[var(--gold)]">{p.technique}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
