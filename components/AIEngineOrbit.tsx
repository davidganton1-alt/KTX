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

const qpStyles = `
  .qp-container {
    position: relative;
    width: 100%;
    aspect-ratio: ${W} / ${H};
    max-width: 900px;
    margin: 0 auto;
    overflow: hidden;
  }
  .qp-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .qp-ent { fill: none; stroke-width: 1; }
  .qp-pulse { filter: drop-shadow(0 0 4px rgba(255,255,255,0.8)); }
  .qp-qubit {
    position: absolute;
    width: 0;
    height: 0;
    z-index: 6;
    perspective: 220px;
    cursor: pointer;
  }
  .qp-qubit:hover { z-index: 20; }
  .qp-core {
    position: absolute;
    left: -7px;
    top: -7px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: currentColor;
    border: 2px solid rgba(255,255,255,0.8);
    box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
    transition: transform 0.2s;
  }
  .qp-qubit:hover .qp-core { transform: scale(1.5); }
  .qp-core--win { animation: qp-shimmer 2.2s ease-in-out infinite; }
  @keyframes qp-shimmer {
    0%, 100% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
    50% { box-shadow: 0 0 14px currentColor, 0 0 30px currentColor; }
  }
  .qp-ring {
    position: absolute;
    left: -19px;
    top: -19px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid currentColor;
    opacity: 0.65;
    pointer-events: none;
  }
  .qp-ring--1 { animation: qp-spin1 3.2s linear infinite; }
  .qp-ring--2 { animation: qp-spin2 4.4s linear infinite; opacity: 0.45; }
  @keyframes qp-spin1 {
    from { transform: rotateX(65deg) rotateZ(0deg); }
    to { transform: rotateX(65deg) rotateZ(360deg); }
  }
  @keyframes qp-spin2 {
    from { transform: rotateX(-65deg) rotateZ(0deg); }
    to { transform: rotateX(-65deg) rotateZ(-360deg); }
  }
  .qp-tooltip {
    position: absolute;
    bottom: 26px;
    left: 0;
    transform: translateX(-50%);
    background: rgba(10, 14, 39, 0.95);
    border: 1px solid rgba(192, 132, 252, 0.35);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12px;
    white-space: nowrap;
    color: #eef2ff;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 30;
    font-family: var(--font-inter), sans-serif;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
  }
  .qp-qubit:hover .qp-tooltip { opacity: 1; }
  .qp-center-core {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffffff, #bae6fd, #38bdf8);
    box-shadow: 0 0 16px 4px rgba(255,255,255,0.8), 0 0 40px 12px rgba(125,211,252,0.5);
    z-index: 5;
    animation: qp-center-pulse 2.8s ease-in-out infinite;
  }
  @keyframes qp-center-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  .qp-legend {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 24px;
    z-index: 10;
  }
`;

interface QNode extends OrbitPosition {
  x: number;
  y: number;
}

export function AIEngineOrbit({ positions, isRunning }: AIEngineOrbitProps) {
  const { outer, inner } = useMemo(() => {
    const mk = (pos: OrbitPosition, i: number, count: number, r: number, offset: number): QNode => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2 + offset;
      return { ...pos, x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
    };
    const outer = positions.slice(0, 6).map((p, i) => mk(p, i, 6, 195, 0));
    const inner = positions.slice(6, 12).map((p, i) => mk(p, i, 6, 105, Math.PI / 6));
    return { outer, inner };
  }, [positions]);

  const qubits = [...inner, ...outer];

  const connections = useMemo(() => {
    // Guard: the parent populates `positions` in an effect, so first render has
    // empty arrays. The fixed 6-loops would read outer[i]/inner[i] = undefined
    // and crash curve() on a.x. Wait until both hexagons are complete.
    if (outer.length < 6 || inner.length < 6) return [];
    const list: { a: QNode; b: QNode }[] = [];
    for (let i = 0; i < 6; i++) list.push({ a: outer[i], b: outer[(i + 1) % 6] });
    for (let i = 0; i < 6; i++) list.push({ a: inner[i], b: inner[(i + 1) % 6] });
    for (let i = 0; i < 6; i++) list.push({ a: outer[i], b: inner[i] });
    for (let i = 0; i < 6; i++) list.push({ a: inner[i], b: inner[(i + 2) % 6] });
    return list;
  }, [outer, inner]);

  const curve = (a: QNode, b: QNode, bend = 12) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return `M ${a.x} ${a.y} Q ${mx - (dy / len) * bend} ${my + (dx / len) * bend} ${b.x} ${b.y}`;
  };

  const dots = useMemo(() => {
    const d: { x: number; y: number }[] = [];
    for (let x = 25; x < W; x += 50) {
      for (let y = 25; y < H; y += 50) {
        d.push({ x, y });
      }
    }
    return d;
  }, []);

  return (
    <div className="qp-container">
      <style>{qpStyles}</style>

      <svg className="qp-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* processor dot grid */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1" fill="rgba(34,211,238,0.08)" />
        ))}

        {/* quantum wave ripples */}
        {isRunning &&
          [0, 1, 2].map((i) => (
            <circle key={i} cx={CX} cy={CY} fill="none" stroke="rgba(125,211,252,0.25)" strokeWidth="1">
              <animate attributeName="r" values="20;240" dur="4.5s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0" dur="4.5s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
            </circle>
          ))}

        {/* entanglement web */}
        {connections.map((c, i) => (
          <path
            key={`e-${i}`}
            id={`qp-c-${i}`}
            className="qp-ent"
            d={curve(c.a, c.b)}
            stroke="rgba(148, 163, 184, 0.18)"
          />
        ))}

        {/* quantum pulses along the web */}
        {isRunning &&
          connections.map((c, i) => {
            const color = ASSET_COLORS[c.a.assetClass];
            const dur = 2.4 + (i % 5) * 0.35;
            const reverse = i % 2 === 1;
            return (
              <circle key={`p-${i}`} className="qp-pulse" r="2.6" fill={color}>
                <animateMotion
                  dur={`${dur}s`}
                  begin={`${(i % 7) * 0.3}s`}
                  repeatCount="indefinite"
                  keyPoints={reverse ? '1;0' : '0;1'}
                  keyTimes="0;1"
                  calcMode="linear"
                >
                  <mpath href={`#qp-c-${i}`} />
                </animateMotion>
              </circle>
            );
          })}
      </svg>

      {/* central processor core */}
      <div className="qp-center-core" style={{ animationPlayState: isRunning ? 'running' : 'paused' }} />

      {/* qubits */}
      {qubits.map((q) => {
        const color = ASSET_COLORS[q.assetClass];
        const win = q.pnl >= 0;
        return (
          <div
            key={q.id}
            className="qp-qubit"
            style={{
              left: `${(q.x / W) * 100}%`,
              top: `${(q.y / H) * 100}%`,
              color,
              opacity: win ? 1 : 0.5,
            }}
          >
            {win && isRunning && (
              <>
                <span className="qp-ring qp-ring--1" />
                <span className="qp-ring qp-ring--2" />
              </>
            )}
            <span className={`qp-core ${win ? 'qp-core--win' : ''}`} />
            <div className="qp-tooltip">
              <div style={{ fontWeight: 600, color, marginBottom: 2 }}>
                {q.symbol} <span style={{ color: '#9aa3c7', fontWeight: 400 }}>{q.side}</span>
              </div>
              <div style={{ fontSize: 11 }}>
                P&L:{' '}
                <span style={{ color: win ? '#34d399' : '#f87171', fontWeight: 600 }}>
                  {win ? '+' : ''}${q.pnl.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* legend */}
      <div className="qp-legend">
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
