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

const W = 800;
const H = 500;
const CX = W / 2;
const CY = H / 2;

const ASSET_COLORS: Record<OrbitPosition['assetClass'], string> = {
  crypto: '#c084fc',
  stocks: '#60a5fa',
  commodities: '#fbbf24',
  forex: '#34d399',
};

const nnStyles = `
  .nn-container {
    position: relative;
    width: 100%;
    aspect-ratio: ${W} / ${H};
    max-width: 880px;
    margin: 0 auto;
    overflow: hidden;
  }
  .nn-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .nn-conn { fill: none; stroke: rgba(125, 211, 252, 0.22); stroke-width: 1; }
  .nn-pulse { filter: drop-shadow(0 0 4px rgba(125,211,252,0.9)); }
  .nn-core {
    position: absolute; left: 50%; top: 50%;
    width: 74px; height: 74px; margin: -37px 0 0 -37px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 35% 35%, #ffffff, #bae6fd, #38bdf8);
    box-shadow:
      0 0 18px 4px rgba(255,255,255,0.85),
      0 0 36px 10px rgba(125,211,252,0.6),
      0 0 70px 22px rgba(56,189,248,0.35);
    z-index: 5;
    font-weight: 700; font-size: 20px; color: #0c4a6e; letter-spacing: 0.05em;
    animation: nn-core-pulse 3s ease-in-out infinite;
  }
  @keyframes nn-core-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.07); } }
  .nn-node {
    position: absolute; width: 20px; height: 20px; margin: -10px 0 0 -10px;
    border-radius: 50%; cursor: pointer; z-index: 6;
    transition: transform 0.2s;
  }
  .nn-node:hover { transform: scale(1.7); z-index: 20; }
  .nn-node-dot { width: 100%; height: 100%; border-radius: 50%; border: 2px solid rgba(255,255,255,0.75); }
  .nn-node--win .nn-node-dot { animation: nn-node-pulse 2.4s ease-in-out infinite; }
  @keyframes nn-node-pulse {
    0%,100% { box-shadow: 0 0 6px 1px var(--nn-c), 0 0 14px 3px var(--nn-c-soft); }
    50% { box-shadow: 0 0 10px 3px var(--nn-c), 0 0 22px 6px var(--nn-c-soft); }
  }
  .nn-tooltip {
    position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: rgba(10,14,39,0.95); border: 1px solid rgba(125,211,252,0.35);
    border-radius: 8px; padding: 8px 14px; font-size: 12px; white-space: nowrap;
    color: #eef2ff; opacity: 0; pointer-events: none; transition: opacity 0.2s;
    z-index: 30; font-family: var(--font-inter), sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.55);
  }
  .nn-node:hover .nn-tooltip { opacity: 1; }
  .nn-legend {
    position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 24px; z-index: 10;
  }
`;

interface Node extends OrbitPosition {
  x: number;
  y: number;
}

interface Conn {
  id: string;
  d: string;
  pulses: { dur: number; delay: number; reverse: boolean; color: string }[];
}

export function AIEngineOrbit({ positions, isRunning }: AIEngineOrbitProps) {
  const { inner, outer } = useMemo(() => {
    const inner: Node[] = positions.slice(0, 4).map((pos, i) => {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
      return { ...pos, x: CX + Math.cos(a) * 130, y: CY + Math.sin(a) * 130 };
    });
    const outer: Node[] = positions.slice(4, 12).map((pos, i) => {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + Math.PI / 8;
      return { ...pos, x: CX + Math.cos(a) * 225, y: CY + Math.sin(a) * 225 };
    });
    return { inner, outer };
  }, [positions]);

  const allNodes = [...inner, ...outer];

  const connections = useMemo(() => {
    const conns: Conn[] = [];
    const curvePath = (x1: number, y1: number, x2: number, y2: number, bend = 18) => {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      return `M ${x1} ${y1} Q ${mx + nx * bend} ${my + ny * bend} ${x2} ${y2}`;
    };

    outer.forEach((n, i) => {
      const t = inner[i % 4];
      conns.push({
        id: `oi-${n.id}`,
        d: curvePath(n.x, n.y, t.x, t.y, 14),
        pulses: [{ dur: 3.2, delay: i * 0.4, reverse: false, color: ASSET_COLORS[n.assetClass] }],
      });
    });

    inner.forEach((n, i) => {
      conns.push({
        id: `ic-${n.id}`,
        d: curvePath(n.x, n.y, CX, CY, 12),
        pulses: [
          { dur: 2.6, delay: i * 0.5, reverse: false, color: ASSET_COLORS[n.assetClass] },
          { dur: 2.6, delay: i * 0.5 + 1.3, reverse: true, color: '#e0f2fe' },
        ],
      });
    });

    inner.forEach((n, i) => {
      const next = inner[(i + 1) % 4];
      conns.push({
        id: `xx-${n.id}`,
        d: curvePath(n.x, n.y, next.x, next.y, -22),
        pulses: [{ dur: 4, delay: i * 0.7, reverse: false, color: 'rgba(125,211,252,0.8)' }],
      });
    });

    return conns;
  }, [inner, outer]);

  const pct = (x: number, y: number) => ({
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
  });

  return (
    <div className="nn-container">
      <style>{nnStyles}</style>

      <svg className="nn-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={CX} cy={CY} fill="none" stroke="rgba(125,211,252,0.15)" strokeWidth="1">
            <animate attributeName="r" values="30;240" dur="4s" begin={`${i * 1.33}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0" dur="4s" begin={`${i * 1.33}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {connections.map((c) => (
          <path key={c.id} id={`path-${c.id}`} className="nn-conn" d={c.d} />
        ))}

        {isRunning &&
          connections.map((c) =>
            c.pulses.map((p, pi) => (
              <circle key={`${c.id}-${pi}`} className="nn-pulse" r="3" fill={p.color}>
                <animateMotion
                  dur={`${p.dur}s`}
                  begin={`${p.delay}s`}
                  repeatCount="indefinite"
                  keyPoints={p.reverse ? '1;0' : '0;1'}
                  keyTimes="0;1"
                  calcMode="linear"
                >
                  <mpath href={`#path-${c.id}`} />
                </animateMotion>
              </circle>
            ))
          )}
      </svg>

      <div className="nn-core" style={{ animationPlayState: isRunning ? 'running' : 'paused' }}>
        AI
      </div>

      {allNodes.map((n) => {
        const color = ASSET_COLORS[n.assetClass];
        const win = n.pnl >= 0;
        return (
          <div
            key={n.id}
            className={`nn-node ${win ? 'nn-node--win' : ''}`}
            style={{
              ...pct(n.x, n.y),
              opacity: win ? 1 : 0.5,
              ['--nn-c' as any]: color,
              ['--nn-c-soft' as any]: `${color}66`,
            }}
          >
            <div className="nn-node-dot" style={{ background: color }} />
            <div className="nn-tooltip">
              <div style={{ fontWeight: 600, color, marginBottom: 2 }}>
                {n.symbol} <span style={{ color: '#9aa3c7', fontWeight: 400 }}>{n.side}</span>
              </div>
              <div style={{ fontSize: 11 }}>
                P&L:{' '}
                <span style={{ color: win ? '#34d399' : '#f87171', fontWeight: 600 }}>
                  {win ? '+' : ''}${n.pnl.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="nn-legend">
        {Object.entries(ASSET_COLORS).map(([assetClass, color]) => (
          <div key={assetClass} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
              {assetClass}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
