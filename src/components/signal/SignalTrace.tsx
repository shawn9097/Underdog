"use client";

import { useEffect, useRef } from "react";
import { mulberry32 } from "./data";

interface Props {
  seed: number;
  bpm?: number;
  ghost: boolean;
  /** Bumped on every retune — restarts the static-resolve envelope. */
  tuneStamp: number;
  reduced: boolean;
  label: string;
}

/**
 * Procedural oscilloscope trace — a deterministic visual fingerprint seeded
 * from track number + BPM + title characters. NOT audio playback.
 * Canvas 2D, dpr capped at 2, rAF paused when the tab is hidden.
 */
export default function SignalTrace({ seed, bpm, ghost, tuneStamp, reduced, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = cv.getBoundingClientRect();
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // --- deterministic fingerprint ---
    const rand = mulberry32(seed);
    const harmonics = Array.from({ length: 6 }, (_, i) => ({
      f: 1 + Math.floor(rand() * 5) + i * 2,
      a: (0.5 + rand() * 0.5) / (i + 1.6),
      p: rand() * Math.PI * 2,
      rate: (0.4 + rand() * 1.2) * (i % 2 === 0 ? 1 : -1),
      sq: rand() < 0.28,
    }));
    const gates = Array.from({ length: 2 + Math.floor(rand() * 3) }, () => ({
      at: 0.08 + rand() * 0.84,
      w: 0.03 + rand() * 0.07,
      dropout: rand() < 0.5,
    }));
    const speed = ((bpm ?? 120) / 120) * 1.15;
    const burstStart = performance.now();

    const yAt = (u: number, phase: number): number => {
      let y = 0;
      for (const hm of harmonics) {
        const s = Math.sin(u * Math.PI * 2 * hm.f + hm.p + phase * hm.rate);
        y += hm.a * (hm.sq ? Math.sign(s) * Math.abs(s) ** 0.3 : s);
      }
      let g = 1;
      for (const gt of gates) {
        if (Math.abs(u - gt.at) < gt.w) g = gt.dropout ? 0.12 : 1.7;
      }
      return y * g;
    };

    const draw = (t: number) => {
      const w = cv.width / dpr;
      const h = cv.height / dpr;
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);

      // graticule
      ctx.strokeStyle = "rgba(205,193,88,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();
      ctx.fillStyle = "rgba(205,193,88,0.16)";
      for (let x = 0; x < w; x += 36) ctx.fillRect(x, mid - 3, 1, 6);

      const env = ghost ? 1 : reduced ? 0 : Math.max(0, 1 - (t - burstStart) / 620);
      const phase = reduced ? 0 : t * 0.0016 * speed;
      const amp = h * 0.3;

      const line = (color: string, off: number, alpha: number, blur: number, glow: string) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        if (blur > 0) {
          ctx.shadowColor = glow;
          ctx.shadowBlur = blur;
        }
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const u = x / w;
          const clean = yAt(u, phase) * amp * (1 - env * 0.92);
          const n = env > 0 ? (Math.random() * 2 - 1) * env * h * 0.34 : 0;
          const y = mid + clean + n + off;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      };

      if (ghost) {
        line("rgba(217,43,63,0.55)", 3, 0.5, 0, "");
        line("rgba(217,43,63,0.95)", 0, 0.85, 7, "rgba(217,43,63,0.8)");
      } else {
        line("rgba(205,193,88,0.4)", 4, 0.55, 0, "");
        line("#f4ec9d", 0, 1, 9, "rgba(212,167,44,0.85)");
      }

      // magenta interference slices while the static resolves
      if (env > 0.05 && !reduced) {
        ctx.fillStyle = "rgba(255,47,126,0.22)";
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(0, Math.random() * h, w, 1 + Math.random() * 2.5 * env);
        }
      }
    };

    const tick = (t: number) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (reduced) {
        draw(performance.now() + 5000);
        return;
      }
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };

    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced || document.hidden) draw(performance.now() + 5000);
    });
    ro.observe(cv);
    start();

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [seed, bpm, ghost, tuneStamp, reduced]);

  return (
    <canvas
      ref={ref}
      className="sig-trace"
      role="img"
      aria-label={`Signal trace fingerprint for ${label} — procedural visualization, not audio playback`}
    />
  );
}
