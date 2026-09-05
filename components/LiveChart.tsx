"use client";
import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from "lightweight-charts";

type Candle = { t: number; o: number; h: number; l: number; c: number };

export function LiveChart({ candles, price }: { candles: Candle[]; price: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: { background: { color: "transparent" }, textColor: "var(--muted)" },
      grid: { vertLines: { color: "rgba(255,255,255,0.05)" }, horzLines: { color: "rgba(255,255,255,0.05)" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "var(--border)" },
      timeScale: { borderColor: "var(--border)", timeVisible: true },
    });
    const series = chart.addCandlestickSeries({
      upColor: "var(--profit)",
      downColor: "var(--loss)",
      borderUpColor: "var(--profit)",
      borderDownColor: "var(--loss)",
      wickUpColor: "var(--profit)",
      wickDownColor: "var(--loss)",
    });
    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      const data: CandlestickData<Time>[] = candles.map((c) => ({
        time: (c.t / 1000) as Time,
        open: c.o, high: c.h, low: c.l, close: c.c,
      }));
      seriesRef.current.setData(data);
    }
  }, [candles]);

  return <div ref={containerRef} className="w-full" />;
}
