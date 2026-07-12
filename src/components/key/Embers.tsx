"use client";

import { useEffect, useRef } from "react";
import { mulberry32 } from "./ritual";

/**
 * Ember motes drifting up through the dark — the ambient breath of the rite.
 * Pauses when the tab is hidden; renders a single static frame under
 * reduced motion.
 */
export default function Embers({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let disposed = false;
    let W = 0;
    let H = 0;
    let last = performance.now();

    const rng = mulberry32(20260731);
    const motes = Array.from({ length: 64 }, () => ({
      x: rng(),
      y: rng(),
      s: 0.6 + rng() * 1.5,
      v: 7 + rng() * 16,
      sway: rng() * Math.PI * 2,
      a: 0.12 + rng() * 0.4,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(2, Math.round(W * dpr));
      canvas.height = Math.max(2, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMotion) draw(performance.now(), 0);
    };

    const draw = (now: number, dt: number) => {
      ctx.clearRect(0, 0, W, H);
      for (const m of motes) {
        if (!reducedMotion) {
          m.y -= (m.v * dt) / Math.max(H, 1);
          m.sway += dt * 0.7;
          if (m.y < -0.02) {
            m.y = 1.02;
            m.x = Math.random();
          }
        }
        const x = m.x * W + Math.sin(m.sway) * 16;
        const y = m.y * H;
        const tw = reducedMotion ? 0.8 : 0.55 + 0.45 * Math.sin(now / 640 + m.sway * 3);
        ctx.globalAlpha = m.a * tw * 0.6;
        ctx.fillStyle = m.s > 1.5 ? "#f5c84c" : "#d4a72c";
        ctx.fillRect(x, y, m.s, m.s);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(now, dt);
      if (!document.hidden && !reducedMotion) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      if (!document.hidden) start();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    document.addEventListener("visibilitychange", onVis);
    if (reducedMotion) draw(performance.now(), 0);
    else start();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 1 }}
    />
  );
}
