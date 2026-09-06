"use client";
import { useEffect, useRef } from "react";

export function Starfield({ density = 140, className = "" }: { density?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const stars = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.04 + 0.008,
      gold: Math.random() < 0.12,
    }));

    let shooting: any = null;
    let raf = 0;
    let frame = 0;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(frame * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold
          ? `rgba(245, 201, 123, ${0.25 + tw * 0.6})`
          : `rgba(255, 255, 255, ${0.2 + tw * 0.55})`;
        ctx.fill();
        s.y += s.drift;
        if (s.y > h + 2) {
          s.y = -2;
          s.x = Math.random() * w;
        }
      }

      if (!shooting && Math.random() < 0.004) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        shooting = {
          x: Math.random() * w,
          y: Math.random() * h * 0.4,
          vx: (Math.random() * 4 + 3) * dir,
          vy: Math.random() * 2 + 1,
          life: 1,
        };
      }
      if (shooting) {
        shooting.x += shooting.vx;
        shooting.y += shooting.vy;
        shooting.life -= 0.02;
        ctx.strokeStyle = `rgba(245, 201, 123, ${Math.max(0, shooting.life)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(shooting.x - shooting.vx * 7, shooting.y - shooting.vy * 7);
        ctx.stroke();
        if (shooting.life <= 0) shooting = null;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}
