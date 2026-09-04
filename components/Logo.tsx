"use client";

/**
 * Final KingdomTradeX logo: round emblem (cropped to the golden coin boundary,
 * original colors) flipping inside a cyan/gold orbit with a breathing halo.
 */
export function Logo({
  size = 360,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const s = Math.max(220, size);
  return (
    <div
      className={`logo-stage ${className}`}
      style={{ width: s, height: s }}
    >
      <div className="logo-halo" />
      <div className="logo-ring back" />
      <div className="logo-flip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="KingdomTradeX" className="front" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="back" />
      </div>
      <div className="logo-ring front" />
    </div>
  );
}
