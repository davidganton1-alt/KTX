"use client";
import { useEffect, useRef, useState } from "react";

export type LiveCandle = { time: number; open: number; high: number; low: number; close: number; volume: number };

const CANDLE_DURATION = 5; // seconds per candle
const POLL_INTERVAL = 500; // ms between price polls

export function useLiveCandles(symbol: string) {
  const [historicalCandles, setHistoricalCandles] = useState<LiveCandle[]>([]);
  const [liveCandles, setLiveCandles] = useState<LiveCandle[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [positions, setPositions] = useState<any[]>([]);
  const [closedTrades, setClosedTrades] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [asks, setAsks] = useState<any[]>([]);
  const [source, setSource] = useState("live");
  const [isReady, setIsReady] = useState(false);

  const activeRef = useRef(true);
  const formingCandleRef = useRef<LiveCandle | null>(null);

  // Fetch historical candles + initial state
  useEffect(() => {
    activeRef.current = true;
    setIsReady(false);
    setLiveCandles([]);
    formingCandleRef.current = null;

    async function fetchInitial() {
      try {
        const res = await fetch(`/api/aitrading2?symbol=${symbol}&range=1D`, { cache: "no-store" });
        if (!res.ok || !activeRef.current) return;
        const data = await res.json();

        const hist: LiveCandle[] = (data.candles || []).map((c: any) => ({
          time: Math.floor(c.t / 1000),
          open: c.o, high: c.h, low: c.l, close: c.c,
          volume: Math.random() * 100 + 20,
        }));

        setHistoricalCandles(hist);
        setCurrentPrice(data.price || 0);
        setChange24h(data.change24h || 0);
        setPositions(data.openPositions || []);
        setClosedTrades(data.closedTrades || []);
        setBids(data.bids || []);
        setAsks(data.asks || []);
        setSource(data.source || "simulated");
        setIsReady(true);
      } catch {}
    }

    fetchInitial();
    return () => { activeRef.current = false; };
  }, [symbol]);

  // Poll live price and build candles
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/aitrading2?symbol=${symbol}&range=1D`, { cache: "no-store" });
        if (!res.ok || !activeRef.current) return;
        const data = await res.json();

        const tick = data.price;
        if (!tick || tick <= 0) return;

        setCurrentPrice(tick);
        setChange24h(data.change24h || 0);
        setPositions(data.openPositions || []);
        setClosedTrades(data.closedTrades || []);
        setBids(data.bids || []);
        setAsks(data.asks || []);

        const nowSec = Math.floor(Date.now() / 1000);
        const candleSlot = Math.floor(nowSec / CANDLE_DURATION) * CANDLE_DURATION;

        if (!formingCandleRef.current || formingCandleRef.current.time !== candleSlot) {
          // Finalize previous candle
          if (formingCandleRef.current) {
            const closed = { ...formingCandleRef.current };
            setLiveCandles(prev => [...prev.slice(-150), closed]);
          }
          // Start new candle
          formingCandleRef.current = {
            time: candleSlot,
            open: tick, high: tick, low: tick, close: tick,
            volume: Math.random() * 50 + 10,
          };
        } else {
          const c = formingCandleRef.current;
          c.high = Math.max(c.high, tick);
          c.low = Math.min(c.low, tick);
          c.close = tick;
          c.volume += Math.random() * 5;
        }

        // Emit forming candle
        setLiveCandles(prev => {
          const existing = prev.filter(x => x.time === candleSlot);
          if (existing.length > 0) {
            return [...prev.filter(x => x.time !== candleSlot), { ...formingCandleRef.current! }].sort((a, b) => a.time - b.time);
          }
          return [...prev, { ...formingCandleRef.current! }];
        });
      } catch {}
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isReady, symbol]);

  return { historicalCandles, liveCandles, currentPrice, change24h, positions, closedTrades, bids, asks, source, isReady };
}
