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
  chargeProgress?: number;
}

const CX = 400;
const CY = 250;
const CHARGE_R = 88;
const CHARGE_CIRC = 2 * Math.PI * CHARGE_R;

const STREAMS: Record<OrbitPosition['assetClass'], { color: string; path: string; entry: { x: number; y: number } }> = {
  crypto: { color: '#c084fc', path: 'M 70 70 C 210 90, 300 170, 400 250', entry: { x: 70, y: 70 } },
  stocks: { color: '#60a5fa', path: 'M 730 70 C 590 90, 500 170, 400 250', entry: { x: 730, y: 70 } },
  commodities: { color: '#fbbf24', path: 'M 730 430 C 590 410, 500 330, 400 250', entry: { x: 730, y: 430 } },
  forex: { color: '#34d399', path: 'M 70 430 C 210 410, 300 330, 400 250', entry: { x: 70, y: 430 } },
};

const reactorStyles = `
  .ds-container { position: relative; width: 100%; aspect-ratio: 800 / 500; max-width: 900px; margin: 0 auto; overflow: hidden; }
  .ds-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .ds-core {
    position: absolute; left: 50%; top: 50%;
    width: 84px; height: 84px; margin: -42px 0 0 -42px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 35% 35%, #ffffff, #fde68a, #f59e0b);
    z-index: 6;
    font-weight: 700; font-size: 18px; color: #78350f; letter-spacing: 0.05em;
    animation: ds-core-pulse 2.6s ease-in-out infinite;
  }
  @keyframes ds-core-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  .ds-arc { transform-box: fill-box; transform-origin: center; }
  .ds-arc--1 { animation: ds-rotate 9s linear infinite; }
  .ds-arc--2 { animation: ds-rotate 14s linear infinite reverse; }
  @keyframes ds-rotate { to { transform: rotate(360deg); } }
  .ds-particle { cursor: pointer; }
  .ds-particle:hover { filter: brightness(1.5); }
  .ds-legend { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 24px; z-index: 10; }
`;

export function AIEngineOrbit({ positions, isRunning, chargeProgress = 0 }: AIEngineOrbitProps) {
  const grouped = useMemo(() => {
    const g: Record<OrbitPosition['assetClass'], OrbitPosition[]> = { crypto: [], stocks: [], commodities: [], forex: [] };
    positions.forEach((p) => { if (g[p.assetClass]) g[p.assetClass].push(p); });
    return g;
  }, [positions]);

  const charge = Math.min(1, Math.max(0, chargeProgress));
  const coreGlow =
    `0 0 ${20 + charge * 22}px ${5 + charge * 8}px rgba(255,255,255,0.85), ` +
    `0 0 ${45 + charge * 34}px ${12 + charge * 12}px rgba(251,191,36,${0.5 + charge * 0.3}), ` +
    `0 0 ${90 + charge * 46}px ${28 + charge * 18}px rgba(245,158,11,${0.3 + charge * 0.25})`;

  return (
    <div className="ds-container">
      <style>{reactorStyles}</style>

      <svg className="ds-svg" viewBox="0 0 800 500" preserveAspectRatio="none">
        {[90, 140, 190].map((r) => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(251,191,36,0.06)" strokeWidth="1" />
        ))}

        {(Object.keys(STREAMS) as OrbitPosition['assetClass'][]).map((asset) => {
          const s = STREAMS[asset];
          const parts = grouped[asset];
          const dur = 3.6;
          return (
            <g key={asset}>
              <path d={s.path} fill="none" stroke={s.color} strokeOpacity="0.12" strokeWidth="7" strokeLinecap="round" />
              <path id={`stream-${asset}`} d={s.path} fill="none" stroke={s.color} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx={s.entry.x} cy={s.entry.y} r="6" fill={s.color} style={{ filter: `drop-shadow(0 0 8px ${s.color})` }} />

              {/* ambient energy motes for density */}
              {[0, 1].map((m) => (
                <circle key={`mote-${m}`} r="2" fill={s.color} opacity="0.45" style={{ filter: `drop-shadow(0 0 3px ${s.color})` }}>
                  {isRunning && (
                    <animateMotion dur={`${5 + m * 1.7}s`} begin={`${-m * 2.5}s`} repeatCount="indefinite">
                      <mpath href={`#stream-${asset}`} />
                    </animateMotion>
                  )}
                </circle>
              ))}

              {/* the 12 position particles */}
              {parts.map((pos, i) => {
                const win = pos.pnl >= 0;
                const begin = -(i * (dur / Math.max(parts.length, 1)));
                return (
                  <circle key={pos.id} className="ds-particle" r="5" fill={s.color} opacity={win ? 1 : 0.5} style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}>
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

        <g className="ds-arc ds-arc--1" style={{ animationPlayState: isRunning ? 'running' : 'paused' }}>
          <circle cx={CX} cy={CY} r="55" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="2.5" strokeDasharray="60 55" strokeLinecap="round" />
        </g>
        <g className="ds-arc ds-arc--2" style={{ animationPlayState: isRunning ? 'running' : 'paused' }}>
          <circle cx={CX} cy={CY} r="72" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="1.6" strokeDasharray="70 80" strokeLinecap="round" />
        </g>

        {/* charge ring reflecting progress toward daily target */}
        <circle cx={CX} cy={CY} r={CHARGE_R} fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="3" />
        <circle
          cx={CX} cy={CY} r={CHARGE_R} fill="none"
          stroke="rgba(34,211,238,0.85)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={CHARGE_CIRC} strokeDashoffset={CHARGE_CIRC * (1 - charge)}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />

        {isRunning && [0, 1, 2].map((i) => (
          <circle key={i} cx={CX} cy={CY} fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5">
            <animate attributeName="r" values="45;210" dur="3.2s" begin={`${i * 1.06}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0" dur="3.2s" begin={`${i * 1.06}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      <div className="ds-core" style={{ animationPlayState: isRunning ? 'running' : 'paused', boxShadow: coreGlow }}>AI</div>

      <div className="ds-legend">
        {Object.entries(STREAMS).map(([assetClass, s]) => (
          <div key={assetClass} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontFamily: 'var(--font-inter), sans-serif' }}>{assetClass}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
