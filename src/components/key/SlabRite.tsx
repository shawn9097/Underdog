"use client";

import { useEffect, useRef } from "react";
import {
  type Crack,
  type Pt,
  deriveBitting,
  fnv1a,
  growCracks,
  keyShape,
  keySvgPath,
  bowCrackSvgPath,
  mulberry32,
  resample,
} from "./ritual";

interface Props {
  reducedMotion: boolean;
  onStrike: (n: number) => void;
  onShatter: () => void;
  onGild: () => void;
  onKeyFormed: (seed: number, bitting: number[]) => void;
  fx: { strike: (n: number) => void; shatter: () => void; gild: () => void };
}

type Phase = "await" | "shatter" | "gild" | "morph" | "key";

interface Chip {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; life: number; t: number; s: number; gold: boolean;
}
interface Spark {
  x: number; y: number; vx: number; vy: number; life: number; t: number;
}
interface Impact { x: number; y: number; t: number }
interface Shard {
  poly: Pt[]; // normalized to slab
  cx: number; cy: number;
  dx: number; dy: number; spin: number;
}

const SHATTER_D = 1.5;
const GILD_D = 2.6;
const MORPH_D = 2.3;

const ease = {
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/**
 * Acts I & II on one 2D canvas: the obsidian slab, the strikes, the crack
 * propagation, the shatter, the gilding, and the fracture re-forming into
 * the visitor's unique key.
 */
export default function SlabRite({
  reducedMotion,
  onStrike,
  onShatter,
  onGild,
  onKeyFormed,
  fx,
}: Props) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cb = useRef({ onStrike, onShatter, onGild, onKeyFormed, fx });
  cb.current = { onStrike, onShatter, onGild, onKeyFormed, fx };
  const rmRef = useRef(reducedMotion);
  rmRef.current = reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let disposed = false;
    let last = performance.now();
    let clock = 0;

    const S = {
      phase: "await" as Phase,
      phaseStart: performance.now(),
      phaseT: 0,
      strikes: 0,
      seed: 0x811c9dc5,
      cracks: [] as Crack[], // pts normalized to slab 0..1
      crackLens: [] as { cum: number[]; total: number }[],
      chips: [] as Chip[],
      sparks: [] as Spark[],
      impacts: [] as Impact[],
      shards: [] as Shard[],
      shakeT: 0,
      shakeAmp: 0,
      bitting: [] as number[],
      keyPath: null as Path2D | null,
      woundPath: null as Path2D | null,
      morphSrc: [] as Pt[],
      morphDst: [] as Pt[],
      formedFired: false,
      sparkAcc: 0,
    };

    let slabTex: HTMLCanvasElement | null = null;

    const rect = () => {
      let sh = Math.min(H * 0.78, 540);
      let sw = sh * 0.64;
      if (sw > W * 0.84) {
        sw = W * 0.84;
        sh = sw / 0.64;
      }
      return { sx: (W - sw) / 2, sy: (H - sh) / 2, sw, sh };
    };

    const keyBox = () => {
      const k = Math.min(H * 0.86, W * 0.92, 520);
      return { kx: (W - k) / 2, ky: (H - k) / 2, k };
    };

    const buildSlabTex = () => {
      const { sw, sh } = rect();
      if (sw <= 0 || sh <= 0) return;
      const c = document.createElement("canvas");
      c.width = Math.max(2, Math.round(sw * dpr));
      c.height = Math.max(2, Math.round(sh * dpr));
      const t = c.getContext("2d");
      if (!t) return;
      t.scale(dpr, dpr);

      const g = t.createLinearGradient(0, 0, sw * 0.3, sh);
      g.addColorStop(0, "#17131d");
      g.addColorStop(0.45, "#0d0b11");
      g.addColorStop(1, "#070609");
      t.fillStyle = g;
      t.beginPath();
      roundRectPath(t, 0, 0, sw, sh, 10);
      t.fill();

      // mineral speckle
      const rng = mulberry32(0x0731c0de);
      for (let i = 0; i < 520; i++) {
        const x = rng() * sw;
        const y = rng() * sh;
        const a = rng();
        t.fillStyle =
          a > 0.94
            ? "rgba(212,167,44,0.10)"
            : `rgba(${a > 0.5 ? 210 : 30},${a > 0.5 ? 214 : 28},${a > 0.5 ? 222 : 36},${0.03 + rng() * 0.05})`;
        t.fillRect(x, y, rng() < 0.85 ? 1 : 2, 1);
      }

      // bevel
      t.strokeStyle = "rgba(244,246,248,0.10)";
      t.lineWidth = 1;
      t.beginPath();
      roundRectPath(t, 1, 1, sw - 2, sh - 2, 9);
      t.stroke();
      t.strokeStyle = "rgba(0,0,0,0.65)";
      t.beginPath();
      roundRectPath(t, 3.5, 3.5, sw - 7, sh - 7, 7);
      t.stroke();

      // faint diagonal sheen (static part; live sheen drawn per-frame)
      const sheen = t.createLinearGradient(0, 0, sw, sh);
      sheen.addColorStop(0.32, "rgba(244,246,248,0)");
      sheen.addColorStop(0.46, "rgba(244,246,248,0.045)");
      sheen.addColorStop(0.6, "rgba(244,246,248,0)");
      t.fillStyle = sheen;
      t.beginPath();
      roundRectPath(t, 0, 0, sw, sh, 10);
      t.fill();

      slabTex = c;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.max(2, Math.round(W * dpr));
      canvas.height = Math.max(2, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildSlabTex();
      if (rmRef.current) render();
    };

    /* ---------------- fracture + fx spawning ---------------- */

    const spawnChips = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 120 + Math.random() * 340;
        S.chips.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 120,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 9,
          life: 0.6 + Math.random() * 0.5,
          t: 0,
          s: 2 + Math.random() * 5,
          gold: Math.random() < 0.18,
        });
      }
    };

    const spawnSparks = (x: number, y: number, n: number, spread = 200) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 30 + Math.random() * spread;
        S.sparks.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 40,
          life: 0.5 + Math.random() * 0.9,
          t: 0,
        });
      }
    };

    const addCracks = (nx: number, ny: number, strike: number) => {
      const { sw, sh } = rect();
      const rng = mulberry32(S.seed);
      const local = growCracks(rng, { x: nx * sw, y: ny * sh }, sw, sh, strike);
      for (const c of local) {
        S.cracks.push({
          ...c,
          pts: c.pts.map((p) => ({ x: p.x / sw, y: p.y / sh })),
        });
      }
    };

    const buildShards = () => {
      const rng = mulberry32((S.seed ^ 0xdeadbeef) >>> 0);
      const gx = 4;
      const gy = 6;
      const verts: Pt[][] = [];
      for (let j = 0; j <= gy; j++) {
        const row: Pt[] = [];
        for (let i = 0; i <= gx; i++) {
          const bx = i / gx;
          const by = j / gy;
          const jx = i > 0 && i < gx ? ((rng() - 0.5) * 0.72) / gx : 0;
          const jy = j > 0 && j < gy ? ((rng() - 0.5) * 0.72) / gy : 0;
          row.push({ x: bx + jx, y: by + jy });
        }
        verts.push(row);
      }
      S.shards = [];
      for (let j = 0; j < gy; j++) {
        for (let i = 0; i < gx; i++) {
          const poly = [verts[j][i], verts[j][i + 1], verts[j + 1][i + 1], verts[j + 1][i]];
          const cx = poly.reduce((s, p) => s + p.x, 0) / 4;
          const cy = poly.reduce((s, p) => s + p.y, 0) / 4;
          const ang = Math.atan2(cy - 0.5, cx - 0.5) + (rng() - 0.5) * 0.6;
          const mag = 0.25 + rng() * 0.6;
          S.shards.push({
            poly, cx, cy,
            dx: Math.cos(ang) * mag,
            dy: Math.sin(ang) * mag * 0.7,
            spin: (rng() - 0.5) * 1.6,
          });
        }
      }
    };

    const buildKey = () => {
      S.bitting = deriveBitting(S.seed);
      const shape = keyShape(S.bitting);
      S.keyPath = new Path2D(keySvgPath(shape));
      S.woundPath = new Path2D(bowCrackSvgPath(S.seed));
      return shape;
    };

    const buildMorph = () => {
      const shape = keyShape(S.bitting);
      const { sx, sy, sw, sh } = rect();
      const { kx, ky, k } = keyBox();
      const N = 440;
      const nOuter = 372;
      const nHole = N - nOuter;

      // sources: actual fracture points, in canvas space
      const all: Pt[] = [];
      for (const c of S.cracks) {
        for (const p of c.pts) all.push({ x: sx + p.x * sw, y: sy + p.y * sh });
      }
      if (all.length === 0) all.push({ x: W / 2, y: H / 2 });
      const ccx = W / 2;
      const ccy = H / 2;
      all.sort(
        (a, b) => Math.atan2(a.y - ccy, a.x - ccx) - Math.atan2(b.y - ccy, b.x - ccx)
      );
      S.morphSrc = Array.from({ length: N }, (_, i) => {
        const p = all[Math.min(all.length - 1, Math.floor((i / N) * all.length))];
        return { ...p };
      });

      const toCanvas = (p: Pt): Pt => ({ x: kx + p.x * k, y: ky + p.y * k });
      const outer = resample(shape.outer, nOuter).map(toCanvas);
      const hole = resample(shape.hole, nHole).map(toCanvas);
      const dst = [...outer, ...hole];
      const kcx = kx + k * 0.5;
      const kcy = ky + k * 0.5;
      dst.sort(
        (a, b) => Math.atan2(a.y - kcy, a.x - kcx) - Math.atan2(b.y - kcy, b.x - kcx)
      );
      S.morphDst = dst;
    };

    const precomputeCrackLens = () => {
      const { sw, sh } = rect();
      S.crackLens = S.cracks.map((c) => {
        const cum: number[] = [0];
        for (let i = 1; i < c.pts.length; i++) {
          const dx = (c.pts[i].x - c.pts[i - 1].x) * sw;
          const dy = (c.pts[i].y - c.pts[i - 1].y) * sh;
          cum.push(cum[i - 1] + Math.hypot(dx, dy));
        }
        return { cum, total: cum[cum.length - 1] || 1 };
      });
    };

    /* ---------------- phase transitions ---------------- */

    const setPhase = (p: Phase) => {
      S.phase = p;
      S.phaseStart = performance.now();
      S.phaseT = 0;
    };

    const beginShatter = () => {
      if (disposed) return;
      buildShards();
      buildKey();
      precomputeCrackLens();
      spawnChips(W / 2, H / 2, 42);
      spawnSparks(W / 2, H / 2, 26, 320);
      S.shakeT = 1;
      S.shakeAmp = 14;
      setPhase("shatter");
      cb.current.onShatter();
      cb.current.fx.shatter();
    };

    const strike = (cxp: number, cyp: number) => {
      if (S.phase !== "await" || S.strikes >= 3) return;
      const { sx, sy, sw, sh } = rect();
      const px = Math.max(sx + sw * 0.1, Math.min(cxp, sx + sw * 0.9));
      const py = Math.max(sy + sh * 0.08, Math.min(cyp, sy + sh * 0.92));
      const nx = (px - sx) / sw;
      const ny = (py - sy) / sh;
      S.seed = fnv1a(`${S.seed.toString(16)}:${nx.toFixed(4)},${ny.toFixed(4)}`);
      S.strikes += 1;
      addCracks(nx, ny, S.strikes);
      S.impacts.push({ x: px, y: py, t: 0 });
      if (!rmRef.current) {
        spawnChips(px, py, 12 + S.strikes * 5);
        spawnSparks(px, py, 4 + S.strikes * 3, 140);
        S.shakeT = 1;
        S.shakeAmp = 4 + S.strikes * 3;
      }
      cb.current.onStrike(S.strikes);
      cb.current.fx.strike(S.strikes);

      if (S.strikes === 3) {
        // saturate the fracture network before the break
        const rng = mulberry32((S.seed ^ 0x777) >>> 0);
        addCracks(0.3 + rng() * 0.4, 0.25 + rng() * 0.2, 2);
        addCracks(0.3 + rng() * 0.4, 0.55 + rng() * 0.25, 2);
        wrap.style.cursor = "default";
        if (rmRef.current) {
          // reduced motion: jump straight to the formed key
          buildKey();
          setPhase("key");
          cb.current.onShatter();
          cb.current.onGild();
          if (!S.formedFired) {
            S.formedFired = true;
            const seed = S.seed;
            const bitting = S.bitting.slice();
            window.setTimeout(() => {
              if (!disposed) cb.current.onKeyFormed(seed, bitting);
            }, 120);
          }
          render();
        } else {
          window.setTimeout(beginShatter, 420);
        }
      } else if (rmRef.current) {
        render();
      }
    };

    /* ---------------- drawing ---------------- */

    function roundRectPath(
      c: CanvasRenderingContext2D,
      x: number, y: number, w: number, h: number, r: number
    ) {
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    const drawGlow = (intensity: number, radius: number) => {
      if (intensity <= 0.004) return;
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, radius);
      g.addColorStop(0, `rgba(212,167,44,${0.32 * intensity})`);
      g.addColorStop(0.5, `rgba(138,106,31,${0.12 * intensity})`);
      g.addColorStop(1, "rgba(212,167,44,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    const drawDarkCracks = (bob: number, goldSeep: number) => {
      const { sx, sy, sw, sh } = rect();
      ctx.save();
      ctx.translate(sx, sy + bob);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const c of S.cracks) {
        ctx.beginPath();
        for (let i = 0; i < c.pts.length; i++) {
          const x = c.pts[i].x * sw;
          const y = c.pts[i].y * sh;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(2,1,3,0.92)";
        ctx.lineWidth = c.w;
        ctx.stroke();
        if (goldSeep > 0.01) {
          ctx.strokeStyle = `rgba(212,167,44,${0.35 * goldSeep})`;
          ctx.lineWidth = Math.max(0.6, c.w * 0.35);
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    const drawGoldCracks = (progress: number, alpha: number) => {
      const { sx, sy, sw, sh } = rect();
      ctx.save();
      ctx.translate(sx, sy);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "lighter";
      for (let ci = 0; ci < S.cracks.length; ci++) {
        const c = S.cracks[ci];
        const lens = S.crackLens[ci];
        if (!lens) continue;
        const delay = c.depth * 0.16;
        const p = clamp01((progress - delay) / Math.max(0.001, 1 - delay));
        if (p <= 0) continue;
        const target = lens.total * ease.outCubic(p);

        ctx.beginPath();
        ctx.moveTo(c.pts[0].x * sw, c.pts[0].y * sh);
        let tipX = c.pts[0].x * sw;
        let tipY = c.pts[0].y * sh;
        for (let i = 1; i < c.pts.length; i++) {
          if (lens.cum[i] <= target) {
            tipX = c.pts[i].x * sw;
            tipY = c.pts[i].y * sh;
            ctx.lineTo(tipX, tipY);
          } else {
            const span = lens.cum[i] - lens.cum[i - 1] || 1;
            const t = (target - lens.cum[i - 1]) / span;
            tipX = (c.pts[i - 1].x + (c.pts[i].x - c.pts[i - 1].x) * t) * sw;
            tipY = (c.pts[i - 1].y + (c.pts[i].y - c.pts[i - 1].y) * t) * sh;
            ctx.lineTo(tipX, tipY);
            break;
          }
        }
        // layered strokes read as bloom without shadowBlur (software-render safe)
        ctx.strokeStyle = `rgba(138,106,31,${0.22 * alpha})`;
        ctx.lineWidth = c.w * 4.5;
        ctx.stroke();
        ctx.strokeStyle = `rgba(212,167,44,${0.85 * alpha})`;
        ctx.lineWidth = c.w * 1.05;
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,233,168,${0.9 * alpha})`;
        ctx.lineWidth = Math.max(0.5, c.w * 0.4);
        ctx.stroke();

        // molten tip
        if (p < 1 && alpha > 0.5) {
          ctx.fillStyle = "rgba(255,233,168,0.9)";
          ctx.beginPath();
          ctx.arc(tipX, tipY, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };

    const drawShards = (p: number) => {
      if (!slabTex) return;
      const { sx, sy, sw, sh } = rect();
      const move = ease.outCubic(p);
      const alpha = p < 0.55 ? 1 : clamp01(1 - (p - 0.55) / 0.42);
      for (const s of S.shards) {
        const ox = s.dx * move * sw;
        const oy = s.dy * move * sh + p * p * sh * 0.22;
        const cxp = sx + s.cx * sw;
        const cyp = sy + s.cy * sh;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cxp + ox, cyp + oy);
        ctx.rotate(s.spin * move);
        ctx.translate(-cxp, -cyp);
        ctx.beginPath();
        for (let i = 0; i < s.poly.length; i++) {
          const x = sx + s.poly[i].x * sw;
          const y = sy + s.poly[i].y * sh;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(slabTex, sx, sy, sw, sh);
        ctx.restore();
      }
    };

    const drawKey = (appear: number, t: number) => {
      if (!S.keyPath) return;
      const { kx, ky, k } = keyBox();
      const pulse = rmRef.current ? 0 : Math.sin(t * 1.5);
      drawGlow((0.5 + 0.12 * pulse) * appear, Math.min(W, H) * 0.55);

      ctx.save();
      ctx.globalAlpha = appear;
      ctx.translate(kx, ky + (rmRef.current ? 0 : Math.sin(t * 0.8) * 4 * appear));
      ctx.scale(k / 100, k / 100);

      // cheap aura: wide translucent strokes instead of shadowBlur
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgba(138,106,31,${0.07 + 0.03 * pulse})`;
      ctx.lineWidth = 11;
      ctx.stroke(S.keyPath);
      ctx.strokeStyle = `rgba(138,106,31,${0.1 + 0.04 * pulse})`;
      ctx.lineWidth = 6;
      ctx.stroke(S.keyPath);
      ctx.strokeStyle = `rgba(212,167,44,${0.16 + 0.05 * pulse})`;
      ctx.lineWidth = 2.6;
      ctx.stroke(S.keyPath);
      ctx.restore();

      const g = ctx.createLinearGradient(50, 4, 50, 98);
      g.addColorStop(0, "#ffe9a8");
      g.addColorStop(0.42, "#d4a72c");
      g.addColorStop(1, "#8a6a1f");
      ctx.fillStyle = g;
      ctx.fill(S.keyPath, "evenodd");

      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(255,233,168,0.55)";
      ctx.lineWidth = 0.6;
      ctx.stroke(S.keyPath);

      // the wound stays visible in the gold
      if (S.woundPath) {
        ctx.save();
        ctx.clip(S.keyPath, "evenodd");
        ctx.strokeStyle = "rgba(6,5,7,0.95)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke(S.woundPath);
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(255,233,168,0.35)";
        ctx.lineWidth = 3;
        ctx.stroke(S.woundPath);
        ctx.restore();
      }
      ctx.restore();
    };

    const drawParticles = (dt: number) => {
      // chips
      for (let i = S.chips.length - 1; i >= 0; i--) {
        const c = S.chips[i];
        c.t += dt;
        if (c.t >= c.life) {
          S.chips.splice(i, 1);
          continue;
        }
        c.vy += 950 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.vr * dt;
        const a = 1 - c.t / c.life;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = a;
        ctx.fillStyle = c.gold ? "#8a6a1f" : "#14111a";
        ctx.beginPath();
        ctx.moveTo(-c.s * 0.6, c.s * 0.4);
        ctx.lineTo(0, -c.s * 0.7);
        ctx.lineTo(c.s * 0.7, c.s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // sparks
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = S.sparks.length - 1; i >= 0; i--) {
        const s = S.sparks[i];
        s.t += dt;
        if (s.t >= s.life) {
          S.sparks.splice(i, 1);
          continue;
        }
        s.vy += 160 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const a = 1 - s.t / s.life;
        ctx.globalAlpha = a * 0.9;
        ctx.fillStyle = "#f5c84c";
        ctx.fillRect(s.x, s.y, 1.6, 1.6);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      // impact flashes
      for (let i = S.impacts.length - 1; i >= 0; i--) {
        const im = S.impacts[i];
        im.t += dt;
        if (im.t > 0.55) {
          S.impacts.splice(i, 1);
          continue;
        }
        const p = im.t / 0.55;
        const r = 14 + p * 70;
        const g = ctx.createRadialGradient(im.x, im.y, 0, im.x, im.y, r);
        g.addColorStop(0, `rgba(255,233,168,${0.5 * (1 - p)})`);
        g.addColorStop(1, "rgba(255,233,168,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(im.x, im.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const render = (dt = 0) => {
      ctx.clearRect(0, 0, W, H);
      ctx.save();

      if (S.shakeT > 0 && !rmRef.current) {
        S.shakeT = Math.max(0, S.shakeT - dt * 2.4);
        const a = S.shakeT * S.shakeT * S.shakeAmp;
        ctx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a);
      }

      const bob = rmRef.current || S.phase !== "await" ? 0 : Math.sin(clock * 0.85) * 5;

      if (S.phase === "await") {
        drawGlow(0.05 + S.strikes * 0.05, Math.min(W, H) * 0.5);
        if (slabTex) {
          const { sx, sy, sw, sh } = rect();
          ctx.drawImage(slabTex, sx, sy + bob, sw, sh);
        }
        drawDarkCracks(bob, S.strikes >= 2 ? 0.5 + 0.5 * Math.sin(clock * 3) * 0.4 : 0);
      } else if (S.phase === "shatter") {
        const p = clamp01(S.phaseT / SHATTER_D);
        drawGlow(0.15 + p * 0.3, Math.min(W, H) * 0.5);
        drawGoldCracks(p * 0.35, 0.4 + p * 0.4);
        drawShards(p);
        if (p >= 1) {
          setPhase("gild");
          cb.current.onGild();
          cb.current.fx.gild();
        }
      } else if (S.phase === "gild") {
        const p = clamp01(S.phaseT / GILD_D);
        drawGlow(0.35 + p * 0.3, Math.min(W, H) * 0.55);
        drawGoldCracks(0.35 + p * 0.65, 1);
        // molten sparks rising off the network
        S.sparkAcc += dt * 26;
        while (S.sparkAcc > 1) {
          S.sparkAcc -= 1;
          const { sx, sy, sw, sh } = rect();
          const c = S.cracks[Math.floor(Math.random() * S.cracks.length)];
          if (c) {
            const pt = c.pts[Math.floor(Math.random() * c.pts.length)];
            S.sparks.push({
              x: sx + pt.x * sw,
              y: sy + pt.y * sh,
              vx: (Math.random() - 0.5) * 30,
              vy: -30 - Math.random() * 60,
              life: 0.6 + Math.random() * 0.8,
              t: 0,
            });
          }
        }
        if (p >= 1) {
          buildMorph();
          setPhase("morph");
        }
      } else if (S.phase === "morph") {
        const p = clamp01(S.phaseT / MORPH_D);
        const e = ease.inOutCubic(p);
        const keyAlpha = clamp01((p - 0.78) / 0.22);
        drawGlow(0.55, Math.min(W, H) * 0.55);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const swirl = Math.sin(p * Math.PI);
        for (let i = 0; i < S.morphSrc.length; i++) {
          const a = S.morphSrc[i];
          const b = S.morphDst[i];
          const px = a.x + (b.x - a.x) * e;
          const py = a.y + (b.y - a.y) * e;
          const off = swirl * 16 * Math.sin(i * 0.13 + clock * 2.2);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ox = (-dy / len) * off;
          const oy = (dx / len) * off;
          ctx.globalAlpha = (0.5 + 0.5 * Math.sin(i * 1.7)) * (1 - keyAlpha * 0.75);
          ctx.fillStyle = i % 5 === 0 ? "#ffe9a8" : "#d4a72c";
          ctx.fillRect(px + ox - 1, py + oy - 1, 2.2, 2.2);
        }
        ctx.restore();
        ctx.globalAlpha = 1;
        if (keyAlpha > 0) drawKey(keyAlpha, clock);
        if (p >= 1) {
          setPhase("key");
          if (!S.formedFired) {
            S.formedFired = true;
            cb.current.onKeyFormed(S.seed, S.bitting.slice());
          }
        }
      } else if (S.phase === "key") {
        drawKey(1, clock);
        if (!rmRef.current) {
          S.sparkAcc += dt * 2;
          while (S.sparkAcc > 1) {
            S.sparkAcc -= 1;
            const { kx, ky, k } = keyBox();
            S.sparks.push({
              x: kx + k * (0.35 + Math.random() * 0.3),
              y: ky + k * (0.1 + Math.random() * 0.8),
              vx: (Math.random() - 0.5) * 16,
              vy: -14 - Math.random() * 26,
              life: 1 + Math.random() * 1.2,
              t: 0,
            });
          }
        }
      }

      drawParticles(dt);
      ctx.restore();
    };

    /* ---------------- loop + events ---------------- */

    const tick = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock += dt;
      // wall-clock phase time so the ceremony's pacing survives low frame rates
      S.phaseT = (now - S.phaseStart) / 1000;
      render(dt);
      if (!document.hidden && !rmRef.current) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      if (!document.hidden) start();
    };

    const onPointerDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      strike(e.clientX - r.left, e.clientY - r.top);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      const { sx, sy, sw, sh } = rect();
      const rng = mulberry32(0xabcd ^ (S.strikes * 7919));
      strike(sx + sw * (0.3 + rng() * 0.4), sy + sh * (0.3 + rng() * 0.4));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    document.addEventListener("visibilitychange", onVis);
    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("keydown", onKeyDown);
    wrap.style.cursor = "pointer";

    if (rmRef.current) render();
    else start();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("keydown", onKeyDown);
    };
    // mount-once by design; live values flow through refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      ref={wrapRef}
      type="button"
      aria-label="Strike the obsidian slab"
      aria-describedby="rite-instruction"
      className="relative block h-full w-full touch-manipulation select-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
      style={{ background: "transparent", border: "none", padding: 0 }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </button>
  );
}
