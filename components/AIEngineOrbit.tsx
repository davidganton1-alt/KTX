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

const baseStyles = `
  .ktx-atom-container { 
    perspective: 1200px; 
    width: 100%; 
    height: 500px; 
    position: relative; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    overflow: visible; 
  }
  .ktx-atom { 
    position: relative; 
    width: 400px; 
    height: 400px; 
    transform-style: preserve-3d; 
  }
  
  .ktx-nucleus {
    position: absolute; top: 50%; left: 50%; width: 90px; height: 90px; margin: -45px 0 0 -45px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffffff, #e0f2fe, #7dd3fc);
    box-shadow: 
      0 0 20px 5px rgba(255, 255, 255, 0.9),
      0 0 40px 10px rgba(125, 211, 252, 0.7),
      0 0 80px 25px rgba(125, 211, 252, 0.4),
      0 0 120px 40px rgba(56, 189, 248, 0.2);
    z-index: 2;
    animation: ktx-nucleus-pulse 3s ease-in-out infinite;
  }

  @keyframes ktx-nucleus-pulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 
        0 0 20px 5px rgba(255, 255, 255, 0.9),
        0 0 40px 10px rgba(125, 211, 252, 0.7),
        0 0 80px 25px rgba(125, 211, 252, 0.4),
        0 0 120px 40px rgba(56, 189, 248, 0.2);
    }
    50% { 
      transform: scale(1.1);
      box-shadow: 
        0 0 30px 8px rgba(255, 255, 255, 1),
        0 0 60px 15px rgba(125, 211, 252, 0.9),
        0 0 100px 35px rgba(125, 211, 252, 0.5),
        0 0 150px 50px rgba(56, 189, 248, 0.3);
    }
  }

  .ktx-orbit {
    position: absolute; top: 50%; left: 50%; width: 360px; height: 360px; margin: -180px 0 0 -180px;
    border: 1.5px solid rgba(125, 211, 252, 0.3); 
    border-radius: 50%;
    transform-style: preserve-3d;
    box-shadow: 0 0 15px rgba(125, 211, 252, 0.1);
    animation: ktx-orbit-shimmer 4s ease-in-out infinite;
  }

  @keyframes ktx-orbit-shimmer {
    0%, 100% { border-color: rgba(125, 211, 252, 0.3); box-shadow: 0 0 15px rgba(125, 211, 252, 0.1); }
    50% { border-color: rgba(125, 211, 252, 0.5); box-shadow: 0 0 25px rgba(125, 211, 252, 0.2); }
  }

  .ktx-electron-wrapper {
    position: absolute; top: 50%; left: 50%; width: 0; height: 0;
    transform-style: preserve-3d;
  }

  .ktx-electron {
    position: absolute; width: 22px; height: 22px; margin: -11px 0 0 -11px;
    border-radius: 50%; cursor: pointer; transition: transform 0.2s;
    transform-style: preserve-3d;
  }
  .ktx-electron:hover { transform: scale(1.8); z-index: 10 !important; }

  .ktx-electron-glow {
    position: absolute; top: -12px; left: -12px; width: 46px; height: 46px; border-radius: 50%;
    opacity: 0.7; filter: blur(8px); pointer-events: none;
  }
  .ktx-electron-core {
    position: absolute; top: 0; left: 0; width: 22px; height: 22px; border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 
      inset 0 0 8px rgba(255,255,255,0.6),
      0 0 12px currentColor;
  }

  .ktx-tooltip {
    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
    background: rgba(10, 14, 39, 0.95); color: #eef2ff; padding: 8px 14px;
    border-radius: 8px; font-size: 12px; white-space: nowrap;
    opacity: 0; pointer-events: none; transition: opacity 0.2s;
    border: 1px solid rgba(125, 211, 252, 0.4); box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    font-family: var(--font-inter), sans-serif;
    z-index: 20;
  }
  .ktx-electron:hover .ktx-tooltip { opacity: 1; }

  @keyframes ktx-zindex-swap {
    0%, 49.9% { z-index: 1; }
    50%, 100% { z-index: 3; }
  }
`;

export function AIEngineOrbit({ positions, isRunning }: AIEngineOrbitProps) {
  const assetClassColors: Record<OrbitPosition['assetClass'], string> = {
    crypto: '#c084fc',
    stocks: '#60a5fa',
    commodities: '#fbbf24',
    forex: '#34d399',
  };

  const orbitsConfig = [
    { tilt: -60, yRot: 70, duration: 12 },
    { tilt: 60, yRot: 70, duration: 16 },
    { tilt: 0, yRot: 75, duration: 20 },
  ];

  const dynamicStyles = useMemo(() => {
    return orbitsConfig.map((orbit, oIdx) => {
      const orbitPositions = positions.slice(oIdx * 4, (oIdx + 1) * 4);
      
      const keyframeName = `ktx-orbit-spin-${oIdx}`;
      const orbitKeyframe = `
        @keyframes ${keyframeName} {
          0% { transform: rotate(0deg) translateX(180px) rotate(0deg) rotateY(-${orbit.yRot}deg) rotateZ(-${orbit.tilt}deg); }
          100% { transform: rotate(360deg) translateX(180px) rotate(-360deg) rotateY(-${orbit.yRot}deg) rotateZ(-${orbit.tilt}deg); }
        }
      `;

      const electronStyles = orbitPositions.map((pos, eIdx) => {
        const delay = -(eIdx * (orbit.duration / 4));
        return `
          .ktx-electron-${pos.id} {
            animation: ${keyframeName} ${orbit.duration}s linear infinite, ktx-zindex-swap ${orbit.duration}s linear infinite;
            animation-delay: ${delay}s, ${delay}s;
            ${!isRunning ? 'animation-play-state: paused;' : ''}
          }
        `;
      }).join('\n');

      return orbitKeyframe + electronStyles;
    }).join('\n');
  }, [positions, isRunning]);

  return (
    <div className="ktx-atom-container">
      <style>{baseStyles + dynamicStyles}</style>
      
      <div className="ktx-atom">
        <div className="ktx-nucleus" />
        
        {orbitsConfig.map((orbit, oIdx) => {
          const orbitPositions = positions.slice(oIdx * 4, (oIdx + 1) * 4);
          return (
            <div
              key={oIdx}
              className="ktx-orbit"
              style={{ transform: `rotateZ(${orbit.tilt}deg) rotateY(${orbit.yRot}deg)` }}
            >
              {orbitPositions.map((pos) => {
                const color = assetClassColors[pos.assetClass];
                const isWinning = pos.pnl >= 0;
                
                return (
                  <div key={pos.id} className="ktx-electron-wrapper">
                    <div
                      className={`ktx-electron ktx-electron-${pos.id}`}
                      style={{ opacity: isWinning ? 1 : 0.5, color: color }}
                    >
                      <div className="ktx-electron-glow" style={{ background: color }} />
                      <div className="ktx-electron-core" style={{ background: color }} />
                      
                      <div className="ktx-tooltip">
                        <div style={{ fontWeight: 600, color: color, marginBottom: '2px' }}>
                          {pos.symbol} <span style={{ color: '#9aa3c7', fontWeight: 400 }}>{pos.side}</span>
                        </div>
                        <div style={{ fontSize: '11px' }}>
                          P&L: <span style={{ color: isWinning ? '#34d399' : '#f87171', fontWeight: 600 }}>
                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '24px',
        zIndex: 10,
      }}>
        {Object.entries(assetClassColors).map(([assetClass, color]) => (
          <div key={assetClass} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }} />
            <span style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--muted)',
              fontFamily: 'var(--font-inter), sans-serif',
            }}>
              {assetClass}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
