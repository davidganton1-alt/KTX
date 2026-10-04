'use client';

import { useMemo } from 'react';

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
};

interface AIEngineOrbitProps {
  positions: OrbitPosition[];
  isRunning: boolean;
}

const CX = 400;
const CY = 250;

const STREAMS: Record<
  OrbitPosition['assetClass'],
  { color: string; path: string; entry: { x: number; y: number } }
> = {
  crypto: { color: '#c084fc', path: 'M 70 70 C 210 90, 300 170, 400 250', entry: { x: 70, y: 70 } },
  stocks: { color: '#60a5fa', path: 'M 730 70 C 590 90, 500 170, 400 250', entry: { x: 730, y: 70 } },
  commodities: { color: '#fbbf24', path: 'M 730 430 C 590 410, 500 330, 400 250', entry: { x: 730, y: 430 } },
  forex: { color: '#34d399', path: 'M 70 430 C 210 410, 300 330, 400 250', entry: { x: 70, y: 430 } },
};

const reactorStyles = `
  .ds-container {
    position: relative;
    width: 100%;
    aspect-ratio: 800 / 500;
    max-width: 900px;
    margin: 0 auto;
    overflow: hidden;
  }
  .ds-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .ds-core {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 84px;
    height: 84px;
    margin: -42px 0 0 -42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 35% 35%, #ffffff, #fde68a, #f59e0b);
    box-shadow:
      0 0 20px 5px rgba(255, 255, 255, 0.85),
      0 0 45px 12px rgba(251, 191, 36, 0.65),
      0 0 90px 28px rgba(245, 158, 11, 0.35);
    z-index: 6;
    font-weight: 700;
    font-size: 18px;
    color: #78350f;
    letter-spacing: 0.05em;
    animation: ds-core-pulse 2.6s ease-in-out infinite;
  }
  @keyframes ds-core-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
  .ds-arc { transform-box: fill-box; transform-origin: center; }
  .ds-arc--1 { animation: ds-rotate 9s linear infinite; }
  .ds-arc--2 { animation: ds-rotate 14s linear infinite reverse; }
  @keyframes ds-rotate { to { transform: rotate(360deg); } }
  .ds-particle { cursor: pointer; }
  .ds-particle:hover { filter: brightness(1.5); }
  .ds-legend {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 24px;
    z-index: 10;
  }
`;

export function AIEngineOrbit({ positions, isRunning }: AIEngineOrbitProps) {
  const grouped = useMemo(() => {
    const g: Record<OrbitPosition['assetClass'], OrbitPosition[]> = {
      crypto: [],
      stocks: [],
      commodities: [],
      forex: [],
    };
    positions.forEach((p) => {
      if (g[p.assetClass]) g[p.assetClass].push(p);
    });
    return g;
  }, [positions]);

  return (
    <div className="ds-container">
      <style>{reactorStyles}</style>

      <svg className="ds-svg" viewBox="0 0 800 500" preserveAspectRatio="none">
        {/* ambient concentric field */}
        {[90, 140, 190].map((r) => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(251,191,36,0.06)" strokeWidth="1" />
        ))}

        {/* stream channels + particles */}
        {(Object.keys(STREAMS) as OrbitPosition['assetClass'][]).map((asset) => {
          const s = STREAMS[asset];
          const parts = grouped[asset];
          const dur = 3.6;
          return (
            <g key={asset}>
              {/* soft under-glow of the channel */}
              <path d={s.path} fill="none" stroke={s.color} strokeOpacity="0.12" strokeWidth="7" strokeLinecap="round" />
              {/* crisp channel line */}
              <path id={`stream-${asset}`} d={s.path} fill="none" stroke={s.color} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
              {/* entry source node */}
              <circle cx={s.entry.x} cy={s.entry.y} r="6" fill={s.color} style={{ filter: `drop-shadow(0 0 8px ${s.color})` }} />

              {/* particles flowing into the core */}
              {parts.map((pos, i) => {
                const win = pos.pnl >= 0;
                const begin = -(i * (dur / Math.max(parts.length, 1)));
                return (
                  <circle
                    key={pos.id}
                    className="ds-particle"
                    r="5"
                    fill={s.color}
                    opacity={win ? 1 : 0.5}
                    style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}
                  >
                    <title>{`${pos.symbol} ${pos.side} | P&L: ${win ? '+' : ''}$${pos.pnl.toFixed(4)}`}</title>
                    {isRunning && (
                      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" rotate="0">
                        <mpath href={`#stream-${asset}`} />
                      </animateMotion>
                    )}
                  </circle>
                );
              })}
            </g>
          );
        })}

        {/* rotating containment arcs */}
        <g className="ds-arc ds-arc--1" style={{ animationPlayState: isRunning ? 'running' : 'paused' }}>
          <circle cx={CX} cy={CY} r="55" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="2.5" strokeDasharray="60 55" strokeLinecap="round" />
        </g>
        <g className="ds-arc ds-arc--2" style={{ animationPlayState: isRunning ? 'running' : 'paused' }}>
          <circle cx={CX} cy={CY} r="72" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="1.6" strokeDasharray="70 80" strokeLinecap="round" />
        </g>

        {/* energy burst rings emitted by the core */}
        {isRunning &&
          [0, 1, 2].map((i) => (
            <circle key={i} cx={CX} cy={CY} fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5">
              <animate attributeName="r" values="45;210" dur="3.2s" begin={`${i * 1.06}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0" dur="3.2s" begin={`${i * 1.06}s`} repeatCount="indefinite" />
            </circle>
          ))}
      </svg>

      {/* reactor core */}
      <div className="ds-core" style={{ animationPlayState: isRunning ? 'running' : 'paused' }}>
        AI
      </div>

      {/* legend */}
      <div className="ds-legend">
        {Object.entries(STREAMS).map(([assetClass, s]) => (
          <div key={assetClass} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
              {assetClass}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
