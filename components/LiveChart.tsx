"use client";
import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CrosshairMode } from "lightweight-charts";

type Candle = { t: number; o: number; h: number; l: number; c: number };

export function LiveChart({ candles, price }: { candles: Candle[]; price: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "transparent" },
        textColor: "#9aa3c7",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        mode: CrosshairMode.Hidden, // Remove wobbly crosshair
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#34D399",
      downColor: "#F87171",
      borderUpColor: "#34D399",
      borderDownColor: "#F87171",
      wickUpColor: "#34D399",
      wickDownColor: "#F87171",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      const data: CandlestickData<Time>[] = candles.map((c) => ({
        time: (c.t / 1000) as Time,
        open: c.o,
        high: c.h,
        low: c.l,
        close: c.c,
      }));
      seriesRef.current.setData(data);
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
        chartRef.current.timeScale().scrollToPosition(5, false);
      }
    }
  }, [candles]);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full" />
      {price > 0 && (
        <div className="absolute right-4 top-4 rounded-lg border border-[var(--gold)] bg-[var(--gold)]/10 px-3 py-1.5 backdrop-blur-sm">
          <p className="text-xs text-[var(--gold)]">Current Price</p>
          <p className="text-lg font-bold text-[var(--gold)]">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      )}
    </div>
  );
}
