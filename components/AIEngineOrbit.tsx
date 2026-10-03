'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type OrbitPosition = {
  id: string;
  symbol: string;
  assetClass: 'crypto' | 'stocks' | 'commodities' | 'forex';
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
}

interface AIEngineOrbitProps {
  positions: OrbitPosition[];
  isRunning: boolean;
}

// Sci-fi orbital view: four dashed rings (one per asset class) with position
// nodes circling a pulsing AI core. Nodes glow class-colored; losers dim.
// All geometry hangs off the exact center point so it stays centered at any
// container width.
export function AIEngineOrbit({ positions, isRunning }: AIEngineOrbitProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTime((t) => t + 0.02);
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning]);

  const assetClassColors: Record<OrbitPosition['assetClass'], string> = {
    crypto: '#a855f7',    // Purple
    stocks: '#3b82f6',    // Blue
    commodities: '#f59e0b', // Amber
    forex: '#10b981',     // Green
  };

  return (
    <div className="relative flex items-center justify-center overflow-hidden" style={{ height: '400px' }}>
      {/* Central AI Core (framer-managed transform keeps it dead-center while pulsing) */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-10 flex items-center justify-center"
        style={{ x: '-50%', y: '-50%' }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600 shadow-[0_0_40px_rgba(168,118,10,0.5)]">
          <span className="text-[24px] font-bold text-black">AI</span>
        </div>
      </motion.div>

      {/* Orbital rings — every wrapper's origin is the exact center point */}
      {[1, 2, 3, 4].map((ring) => {
        const radius = 60 + ring * 40;
        const positionsInRing = positions.filter((p) => p.orbitRadius === ring);

        return (
          <div key={ring} className="absolute left-1/2 top-1/2">
            {/* Orbit path */}
            <svg
              width={radius * 2}
              height={radius * 2}
              style={{ position: 'absolute', left: -radius, top: -radius }}
            >
              <circle
                cx={radius}
                cy={radius}
                r={radius - 10}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.3"
              />
            </svg>
            {/* Position nodes */}
            {positionsInRing.map((pos) => {
              const angle = time * pos.orbitSpeed + pos.angle;
              const x = Math.cos(angle) * (radius - 10);
              const y = Math.sin(angle) * (radius - 10);
              const color = assetClassColors[pos.assetClass];
              return (
                <motion.div
                  key={pos.id}
                  className="absolute z-20"
                  style={{ x, y }}
                  animate={{ scale: pos.pnl >= 0 ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="h-4 w-4 -ml-2 -mt-2 cursor-pointer rounded-full transition-all hover:scale-150"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}`,
                      opacity: pos.pnl >= 0 ? 1 : 0.5,
                    }}
                    title={`${pos.symbol} ${pos.side} | P&L: ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(4)}`}
                  />
                </motion.div>
              );
            })}
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-4">
        {(Object.keys(assetClassColors) as OrbitPosition['assetClass'][]).map((assetClass) => (
          <div key={assetClass} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: assetClassColors[assetClass] }} />
            <span className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">{assetClass}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
