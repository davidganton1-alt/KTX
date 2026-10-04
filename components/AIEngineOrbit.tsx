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

const ASSET_COLORS: Record<OrbitPosition['assetClass'], string> = {
  crypto: '#c084fc',
  stocks: '#60a5fa',
  commodities: '#fbbf24',
  forex: '#34d399',
};

const radarStyles = `
  .rd-container {
    position: relative;
    width: 100%;
    aspect-ratio: 800 / 500;
    max-width: 900px;
    margin: 0 auto;
    overflow: hidden;
  }
  .rd-scope {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 90%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    overflow: hidden;
    background: radial-gradient(circle, rgba(8, 47, 73, 0.35) 0%, rgba(2, 6, 23, 0.6) 100%);
    box-shadow:
      inset 0 0 40px rgba(34, 211, 238, 0.15),
      0 0 30px rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.3);
  }
  .rd-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .rd-beam {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      rgba(34, 211, 238, 0.5) 0deg,
      rgba(34, 211, 238, 0.22) 18deg,
      rgba(34, 211, 238, 0.06) 42deg,
      transparent 70deg,
      transparent 360deg
    );
    animation: rd-sweep 4s linear infinite;
  }
  @keyframes rd-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .rd-scanlines {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 3px,
      rgba(34, 211, 238, 0.04) 4px
    );
  }
  .rd-center {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10px;
    height: 10px;
    margin: -5px 0 0 -5px;
    border-radius: 50%;
    background: #e0f2fe;
    box-shadow: 0 0 10px 2px rgba(224, 242, 254, 0.9), 0 0 20px 6px rgba(34, 211, 238, 0.5);
    z-index: 4;
  }
  .rd-blip {
    position: absolute;
    width: 24px;
    height: 24px;
    margin: -12px 0 0 -12px;
    z-index: 5;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rd-blip:hover { z-index: 20; }
  .rd-blip-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor, 0 0 16px currentColor;
    transition: transform 0.2s;
  }
  .rd-blip:hover .rd-blip-dot { transform: scale(1.6); }
  .rd-blip-ping {
    position: absolute;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 1px solid currentColor;
    animation: rd-ping 2.6s ease-out infinite;
    pointer-events: none;
  }
  @keyframes rd-ping {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(3.6); opacity: 0; }
  }
  .rd-tooltip {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 14, 39, 0.95);
    border: 1px solid rgba(34, 211, 238, 0.35);
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
  .rd-blip:hover .rd-tooltip { opacity: 1; }
  .rd-corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border-color: rgba(251, 191, 36, 0.6);
    border-style: solid;
    border-width: 0;
    z-index: 8;
  }
  .rd-corner--tl { top: 6px; left: 6px; border-top-width: 2px; border-left-width: 2px; }
  .rd-corner--tr { top: 6px; right: 6px; border-top-width: 2px; border-right-width: 2px; }
  .rd-corner--bl { bottom: 6px; left: 6px; border-bottom-width: 2px; border-left-width: 2px; }
  .rd-corner--br { bottom: 6px; right: 6px; border-bottom-width: 2px; border-right-width: 2px; }
  .rd-readout {
    position: absolute;
    font-family: var(--font-inter), sans-serif;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    z-index: 8;
  }
  .rd-readout--top { top: 12px; left: 50%; transform: translateX(-50%); color: #fbbf24; }
  .rd-readout--bottom { bottom: 12px; left: 50%; transform: translateX(-50%); color: rgba(34, 211, 238, 0.8); }
  .rd-readout--left { left: 40px; top: 50%; transform: translateY(-50%); color: rgba(34, 211, 238, 0.6); }
  .rd-readout--right { right: 40px; top: 50%; transform: translateY(-50%); color: rgba(34, 211, 238, 0.6); }
  .rd-legend {
    position: absolute;
    bottom: 8px;
    right: 40px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 8;
  }
`;

interface Blip extends OrbitPosition {
  x: number;
  y: number;
}

export function AIEngineOrbit({ positions, isRunning }: AIEngineOrbitProps) {
  const blips = useMemo<Blip[]>(() => {
    const ringMap = [0, 18, 30, 40, 46];
    return positions.map((pos) => {
      const r = ringMap[pos.orbitRadius] ?? 38;
      return {
        ...pos,
        x: 50 + Math.cos(pos.angle) * r,
        y: 50 + Math.sin(pos.angle) * r,
      };
    });
  }, [positions]);

  const winners = positions.filter((p) => p.pnl >= 0).length;

  return (
    <div className="rd-container">
      <style>{radarStyles}</style>

      <div className="rd-corner rd-corner--tl" />
      <div className="rd-corner rd-corner--tr" />
      <div className="rd-corner rd-corner--bl" />
      <div className="rd-corner rd-corner--br" />

      <div className="rd-readout rd-readout--top">KTX · Market Surveillance Grid</div>
      <div className="rd-readout rd-readout--bottom">
        Targets: {positions.length} · Sweep 4.0s · Status: {isRunning ? 'Scanning' : 'Paused'}
      </div>
      <div className="rd-readout rd-readout--left">Sig {winners}/{positions.length}</div>
      <div className="rd-readout rd-readout--right">AI Eng 01</div>

      <div className="rd-scope">
        <svg className="rd-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(34,211,238,0.22)" strokeWidth="0.4" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(34,211,238,0.22)" strokeWidth="0.4" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(34,211,238,0.28)" strokeWidth="0.5" />
          <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(34,211,238,0.16)" strokeWidth="0.35" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(34,211,238,0.16)" strokeWidth="0.35" />
          <line x1="16" y1="16" x2="84" y2="84" stroke="rgba(34,211,238,0.08)" strokeWidth="0.3" />
          <line x1="84" y1="16" x2="16" y2="84" stroke="rgba(34,211,238,0.08)" strokeWidth="0.3" />
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            const major = i % 3 === 0;
            const r1 = major ? 44.5 : 46.5;
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * r1}
                y1={50 + Math.sin(a) * r1}
                x2={50 + Math.cos(a) * 48}
                y2={50 + Math.sin(a) * 48}
                stroke="rgba(34,211,238,0.45)"
                strokeWidth={major ? 0.6 : 0.3}
              />
            );
          })}
        </svg>

        <div className="rd-beam" style={{ animationPlayState: isRunning ? 'running' : 'paused' }} />
        <div className="rd-scanlines" />

        {blips.map((b, i) => {
          const color = ASSET_COLORS[b.assetClass];
          const win = b.pnl >= 0;
          return (
            <div
              key={b.id}
              className="rd-blip"
              style={{ left: `${b.x}%`, top: `${b.y}%`, color, opacity: win ? 1 : 0.5 }}
            >
              {isRunning && <span className="rd-blip-ping" style={{ animationDelay: `${(i % 6) * 0.45}s` }} />}
              <span className="rd-blip-dot" />
              <div className="rd-tooltip">
                <div style={{ fontWeight: 600, color, marginBottom: 2 }}>
                  {b.symbol} <span style={{ color: '#9aa3c7', fontWeight: 400 }}>{b.side}</span>
                </div>
                <div style={{ fontSize: 11 }}>
                  P&L:{' '}
                  <span style={{ color: win ? '#34d399' : '#f87171', fontWeight: 600 }}>
                    {win ? '+' : ''}${b.pnl.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div className="rd-center" />
      </div>

      <div className="rd-legend">
        {Object.entries(ASSET_COLORS).map(([assetClass, color]) => (
          <div key={assetClass} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
              {assetClass}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
