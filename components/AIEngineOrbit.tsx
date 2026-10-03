'use client';

import { useState, useEffect, useMemo } from 'react';
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
};

interface AIEngineOrbitProps {
  positions: OrbitPosition[];
  isRunning: boolean;
}

// Phase L.1.5: atomic/nuclear physics visualization. Pulsing energy nucleus,
// tilted 3D orbital planes, electron-style particle trails, energy
// connections from winning positions, background star field, 60fps rAF clock.
export function AIEngineOrbit({ positions, isRunning }: AIEngineOrbitProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    let animationId: number;
    const animate = () => {
      setTime((t) => t + 0.016); // ~60fps
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isRunning]);

  const bgParticles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  const assetClassColors: Record<OrbitPosition['assetClass'], string> = {
    crypto: '#a855f7',
    stocks: '#3b82f6',
    commodities: '#f59e0b',
    forex: '#10b981',
  };

  const orbitalPlanes = [
    { tilt: 0, radius: 120, speed: 0.8 },
    { tilt: 25, radius: 160, speed: 0.6 },
    { tilt: -30, radius: 200, speed: 0.4 },
    { tilt: 45, radius: 240, speed: 0.3 },
  ];

  return (
    <div className="relative flex items-center justify-center overflow-hidden" style={{ height: '500px' }}>
      {/* Background particle field */}
      <div className="absolute inset-0 overflow-hidden">
        {bgParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            }}
            transition={{
              duration: 3 / particle.speed,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Central nucleus with energy waves */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[1, 2, 3].map((wave) => (
          <motion.div
            key={wave}
            className="absolute left-1/2 top-1/2 rounded-full border-2 border-[var(--gold)]"
            style={{
              x: '-50%',
              y: '-50%',
              width: 96,
              height: 96,
            }}
            animate={{
              // expand outward and fade, then restart (a true ripple, not a bounce back)
              width: [96, 96 + wave * 60],
              height: [96, 96 + wave * 60],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: wave * 0.8,
              ease: 'easeOut',
            }}
          />
        ))}

        <motion.div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 96,
            height: 96,
            background: 'radial-gradient(circle at 30% 30%, #fbbf24, #d97706, #92400e)',
            boxShadow: '0 0 60px rgba(251, 191, 36, 0.8), 0 0 120px rgba(251, 191, 36, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.3)',
          }}
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              '0 0 60px rgba(251, 191, 36, 0.8), 0 0 120px rgba(251, 191, 36, 0.4)',
              '0 0 80px rgba(251, 191, 36, 1), 0 0 160px rgba(251, 191, 36, 0.6)',
              '0 0 60px rgba(251, 191, 36, 0.8), 0 0 120px rgba(251, 191, 36, 0.4)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span className="text-[28px] font-bold text-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">AI</span>
        </motion.div>
      </div>

      {/* Orbital planes */}
      {orbitalPlanes.map((plane, planeIndex) => {
        const planePositions = positions.filter((p) => p.orbitRadius === planeIndex + 1);

        return (
          <div
            key={planeIndex}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) rotateX(${plane.tilt}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <svg
              width={plane.radius * 2}
              height={plane.radius * 1.6}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ opacity: 0.2 }}
            >
              <ellipse
                cx={plane.radius}
                cy={plane.radius * 0.8}
                rx={plane.radius}
                ry={plane.radius * 0.7}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
            </svg>

            {planePositions.map((pos) => {
              const angle = time * plane.speed + pos.angle;
              const x = Math.cos(angle) * plane.radius;
              const y = Math.sin(angle) * plane.radius * 0.7;
              const color = assetClassColors[pos.assetClass];
              const isWinning = pos.pnl >= 0;

              return (
                <div key={pos.id}>
                  {/* Particle trail */}
                  {[1, 2, 3, 4, 5].map((trailIndex) => {
                    const trailAngle = angle - trailIndex * 0.15;
                    const trailX = Math.cos(trailAngle) * plane.radius;
                    const trailY = Math.sin(trailAngle) * plane.radius * 0.7;
                    const trailOpacity = 0.3 - trailIndex * 0.05;

                    return (
                      <motion.div
                        key={trailIndex}
                        className="absolute rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          width: 8,
                          height: 8,
                          x: trailX - 4,
                          y: trailY - 4,
                          backgroundColor: color,
                          opacity: trailOpacity,
                          filter: `blur(${trailIndex * 0.5}px)`,
                          boxShadow: `0 0 10px ${color}`,
                        }}
                      />
                    );
                  })}

                  {/* Main particle */}
                  <motion.div
                    className="absolute cursor-pointer"
                    style={{
                      left: '50%',
                      top: '50%',
                      x: x - 8,
                      y: y - 8,
                    }}
                    animate={{
                      scale: isWinning ? [1, 1.3, 1] : 0.8,
                    }}
                    transition={{
                      // losing particles hold a static 0.8 scale; no infinite loop needed
                      scale: { duration: 1.5, repeat: isWinning ? Infinity : 0, ease: 'easeInOut' },
                    }}
                    title={`${pos.symbol} ${pos.side} | P&L: ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(4)}`}
                  >
                    <div
                      className="rounded-full transition-all hover:scale-150"
                      style={{
                        width: 16,
                        height: 16,
                        background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`,
                        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80, inset 0 0 10px rgba(255,255,255,0.5)`,
                        opacity: isWinning ? 1 : 0.6,
                      }}
                    />
                  </motion.div>

                  {/* Energy connection */}
                  {isWinning && (
                    <motion.div
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: Math.sqrt(x * x + y * y),
                        height: 1,
                        transformOrigin: 'left center',
                        transform: `rotate(${Math.atan2(y, x)}rad)`,
                        background: `linear-gradient(90deg, ${color}00, ${color}40, ${color}00)`,
                        opacity: 0.3,
                      }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-6">
        {(Object.keys(assetClassColors) as OrbitPosition['assetClass'][]).map((assetClass) => (
          <div key={assetClass} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: assetClassColors[assetClass],
                boxShadow: `0 0 10px ${assetClassColors[assetClass]}`,
              }}
            />
            <span className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">
              {assetClass}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
