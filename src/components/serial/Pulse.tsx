"use client";

/**
 * THE PULSE — a scroll-synced EKG rendered on a fixed left rail.
 *
 * The heartbeat is a pure function of scroll position: every document pixel
 * maps to a fixed point on a virtual cardiac tape, so the reader conducts the
 * rhythm by scrolling. It beats steady blood-red in the corridor, slows and
 * decays as blood runs out, FLATLINES exactly at the death paragraph, holds
 * flat through the nothing, then restarts WRONG — irregular and gold — at the
 * return. No time-based animation drives it; it only redraws on scroll/resize,
 * so it behaves identically under reduced motion.
 */

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { PULSE } from "./beats";

export interface PulseHandle {
  /** Fire a single extra blip at the given absolute document Y (easter eggs). */
  blip: (absY: number, gold?: boolean) => void;
}

type Beat = { y: number; amp: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const easeIn = (t: number) => t * t;
const g = (x: number, mu: number, s: number) => {
  const z = (x - mu) / s;
  return Math.exp(-0.5 * z * z);
};

/** Healthy-ish QRS morphology. dy = pixels from the beat centre. */
function qrs(dy: number, amp: number): number {
  let v = 0;
  v += 0.12 * g(dy, -24, 6); // P
  v -= 0.1 * g(dy, -7, 3); // Q
  v += 1.0 * g(dy, 0, 2.8); // R
  v -= 0.26 * g(dy, 7, 3.2); // S
  v += 0.22 * g(dy, 27, 9); // T
  return v * amp;
}

/** The wrong rhythm: notched, part-inverted — it came back changed. */
function qrsWrong(dy: number, amp: number): number {
  let v = 0;
  v += 0.1 * g(dy, -26, 7);
  v -= 0.14 * g(dy, -9, 3);
  v += 1.0 * g(dy, -2, 2.6);
  v -= 0.5 * g(dy, 3, 2.4); // deep S
  v += 0.44 * g(dy, 9, 3); // extra notch — a second, wrong peak
  v += 0.26 * g(dy, 31, 10);
  return v * amp;
}

export default function Pulse({
  reduced,
  handleRef,
}: {
  reduced: boolean;
  handleRef?: Ref<PulseHandle>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const bpmRef = useRef<HTMLSpanElement>(null);
  const rhythmRef = useRef<HTMLSpanElement>(null);

  // Extra one-shot blips (easter eggs), keyed by absolute Y with decay.
  const blipsRef = useRef<
    { y: number; gold: boolean; life: number; defib?: boolean }[]
  >([]);
  const drawRef = useRef<(sy: number) => void>(() => {});

  useImperativeHandle(
    handleRef,
    () => ({
      blip: (absY: number, gold = true) => {
        blipsRef.current.push({ y: absY, gold, life: 1 });
        drawRef.current(window.scrollY);
        // brief decay so the jolt fades even without further scroll
        const started = performance.now();
        const step = () => {
          const el = blipsRef.current;
          const t = (performance.now() - started) / 520;
          for (const b of el) b.life = Math.max(0, 1 - t);
          drawRef.current(window.scrollY);
          if (t < 1) requestAnimationFrame(step);
          else blipsRef.current = [];
        };
        requestAnimationFrame(step);
      },
    }),
    [],
  );

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    // Capture as non-null consts so the hoisted helpers below narrow cleanly.
    const canvas = canvasEl;
    const ctx = context;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let Wc = 0;
    let Hc = 0;

    // measured layout
    let articleTop = 0;
    let deathY = 0;
    let returnY = 0;
    let endY = 0;
    let corridor: Beat[] = [];
    let returnBeats: Beat[] = [];

    function buildBeats() {
      corridor = [];
      returnBeats = [];
      const span = Math.max(1, deathY - articleTop);
      let y = articleTop + 46;
      let guard = 0;
      while (y < deathY - 10 && guard < 4000) {
        const p = clamp01((y - articleTop) / span);
        const amp = lerp(PULSE.corridorAmpStart, PULSE.corridorAmpEnd, easeIn(p));
        corridor.push({ y, amp });
        y += lerp(PULSE.corridorStartSpacing, PULSE.corridorEndSpacing, easeIn(p));
        guard++;
      }
      const iv = PULSE.wrongIntervals;
      const am = PULSE.wrongAmp;
      let ry = returnY + 30;
      let k = 0;
      const stop = endY + 500;
      while (ry < stop && k < 4000) {
        returnBeats.push({ y: ry, amp: am[k % am.length] });
        ry += iv[k % iv.length];
        k++;
      }
    }

    function measure() {
      const article = document.querySelector<HTMLElement>("[data-pl-article]");
      const dEl = document.querySelector<HTMLElement>('[data-anchor="death"]');
      const rEl = document.querySelector<HTMLElement>('[data-anchor="return"]');
      const fEl = document.querySelector<HTMLElement>('[data-anchor="finale"]');
      if (!article || !dEl || !rEl || !fEl) return;
      const sy = window.scrollY;
      articleTop = article.getBoundingClientRect().top + sy;
      const dr = dEl.getBoundingClientRect();
      deathY = dr.top + sy + dr.height / 2;
      returnY = rEl.getBoundingClientRect().top + sy;
      endY = fEl.getBoundingClientRect().top + sy;
      buildBeats();
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      Wc = rect.width;
      Hc = window.innerHeight;
      canvas.width = Math.round(Wc * dpr);
      canvas.height = Math.round(Hc * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function strokeTrace(
      defl: Float32Array,
      baseX: number,
      sy: number,
      fromY: number,
      toY: number,
      color: string,
      glow: number,
      width: number,
    ) {
      const r0 = Math.max(0, Math.ceil(fromY - sy));
      const r1 = Math.min(Hc, Math.floor(toY - sy));
      if (r1 <= r0) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, r0, Wc, r1 - r0);
      ctx.clip();
      ctx.beginPath();
      for (let row = 0; row <= Hc; row++) {
        const x = baseX + defl[row];
        if (row === 0) ctx.moveTo(x, row);
        else ctx.lineTo(x, row);
      }
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.lineJoin = "round";
      ctx.shadowBlur = glow;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.restore();
    }

    function draw(sy: number) {
      if (Wc === 0) return;
      ctx.clearRect(0, 0, Wc, Hc);
      const baseX = Wc * 0.46;
      const maxDefl = Wc * 0.4;

      // faint baseline down the whole rail
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(baseX, 0);
      ctx.lineTo(baseX, Hc);
      ctx.strokeStyle = "rgba(138,106,31,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // accumulate deflection per canvas row
      const defl = new Float32Array(Hc + 1);
      const win = 48;
      const addBeats = (list: Beat[], wrong: boolean) => {
        for (const b of list) {
          const cpy = b.y - sy;
          if (cpy < -win || cpy > Hc + win) continue;
          for (let d = -win; d <= win; d++) {
            const row = Math.round(cpy + d);
            if (row < 0 || row > Hc) continue;
            defl[row] += (wrong ? qrsWrong(d, b.amp) : qrs(d, b.amp)) * maxDefl;
          }
        }
      };
      addBeats(corridor, false);
      addBeats(returnBeats, true);

      // one-shot easter-egg blips
      for (const bl of blipsRef.current) {
        if (bl.life <= 0) continue;
        const cpy = bl.y - sy;
        if (cpy < -win || cpy > Hc + win) continue;
        for (let d = -win; d <= win; d++) {
          const row = Math.round(cpy + d);
          if (row < 0 || row > Hc) continue;
          defl[row] += qrsWrong(d, 1.15 * bl.life) * maxDefl;
        }
      }

      const glow = reduced ? 0 : 1;
      // corridor (dying red) → flat (dim) → return (wrong gold)
      strokeTrace(defl, baseX, sy, -1e9, deathY, "#d92b3f", glow * 6, 1.6);
      strokeTrace(defl, baseX, sy, deathY, returnY, "rgba(138,106,31,0.5)", 0, 1.3);
      strokeTrace(defl, baseX, sy, returnY, 1e9, "#f5c84c", glow * 11, 1.8);

      // Defib jolt (easter egg): a bright gold spike overlaid on the flatline.
      const defibs = blipsRef.current.filter((b) => b.defib && b.life > 0);
      if (defibs.length) {
        const dd = new Float32Array(Hc + 1);
        for (const bl of defibs) {
          const cpy = bl.y - sy;
          if (cpy < -win || cpy > Hc + win) continue;
          for (let d = -win; d <= win; d++) {
            const row = Math.round(cpy + d);
            if (row < 0 || row > Hc) continue;
            dd[row] += qrsWrong(d, 1.3 * bl.life) * maxDefl;
          }
        }
        ctx.save();
        ctx.beginPath();
        for (let row = 0; row <= Hc; row++) {
          const x = baseX + dd[row];
          if (row === 0) ctx.moveTo(x, row);
          else ctx.lineTo(x, row);
        }
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "#ffe9a8";
        ctx.shadowBlur = glow * 16;
        ctx.shadowColor = "#f5c84c";
        ctx.stroke();
        ctx.restore();
      }

      // "now" tick at viewport centre
      const midY = Hc / 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(baseX - Wc * 0.12, midY);
      ctx.lineTo(baseX + Wc * 0.12, midY);
      ctx.strokeStyle = "rgba(232,226,214,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      updateReadout(sy);
    }

    function updateReadout(sy: number) {
      const center = sy + Hc / 2;
      const bpmEl = bpmRef.current;
      const rhEl = rhythmRef.current;
      const rootEl = readoutRef.current;
      const hudSigns = document.querySelector<HTMLElement>("[data-pl-signs]");
      const hud = document.querySelector<HTMLElement>("[data-pl-hud]");
      if (!bpmEl || !rhEl || !rootEl) return;

      let phase: "sinus" | "flat" | "wrong";
      if (center < deathY) {
        const p = clamp01((center - articleTop) / Math.max(1, deathY - articleTop));
        const bpm = Math.round(lerp(PULSE.corridorBpmStart, PULSE.corridorBpmEnd, p));
        bpmEl.textContent = `${bpm} BPM`;
        rhEl.textContent = p > 0.72 ? "SINUS · FAILING" : "SINUS RHYTHM";
        phase = "sinus";
      } else if (center < returnY) {
        bpmEl.textContent = "—  —  —";
        rhEl.textContent = "ASYSTOLE";
        phase = "flat";
      } else {
        const idx = Math.floor((center - returnY) / 70);
        const bpm = PULSE.wrongBpm[((idx % PULSE.wrongBpm.length) + PULSE.wrongBpm.length) %
          PULSE.wrongBpm.length];
        bpmEl.textContent = `${bpm} BPM`;
        rhEl.textContent = "RHYTHM: UNRECOGNIZED";
        phase = "wrong";
      }
      rootEl.dataset.phase = phase;
      if (hud) hud.dataset.phase = phase;

      // Descent trauma log — telemetry that activates line by line.
      const reached = phase === "sinus" ? 1 : phase === "flat" ? 2 : 3;
      const order: Record<string, number> = { drop: 0, hem: 1, flat: 2, gild: 3 };
      const logEls = document.querySelectorAll<HTMLElement>("[data-log]");
      logEls.forEach((el) => {
        const o = order[el.dataset.log ?? ""] ?? 99;
        el.dataset.on = o <= reached ? "1" : "";
        el.dataset.now = o === reached ? "1" : "";
      });

      if (hudSigns) {
        hudSigns.textContent =
          phase === "sinus"
            ? center > articleTop + (deathY - articleTop) * 0.72
              ? "SIGNS: FAILING"
              : "SIGNS: WEAK"
            : phase === "flat"
              ? "SIGNS: NONE"
              : "SIGNS: ??? / GOLD";
      }
    }

    drawRef.current = draw;

    // Hidden easter egg: shocking the flatline during "the nothing" fires a
    // gold defibrillation jolt + a brief flash — then it goes flat again.
    function fireDefib() {
      const center = window.scrollY + Hc / 2;
      blipsRef.current.push({ y: center, gold: true, life: 1, defib: true });
      const flash = document.querySelector<HTMLElement>("[data-pl-defib]");
      if (flash) {
        flash.removeAttribute("data-flash");
        void flash.offsetWidth; // reflow so the flash can retrigger
        flash.dataset.flash = "1";
      }
      const started = performance.now();
      const step = () => {
        const t = (performance.now() - started) / 620;
        for (const b of blipsRef.current) if (b.defib) b.life = Math.max(0, 1 - t);
        draw(window.scrollY);
        if (t < 1) requestAnimationFrame(step);
        else blipsRef.current = blipsRef.current.filter((b) => !b.defib);
      };
      requestAnimationFrame(step);
    }
    const onClick = () => {
      const center = window.scrollY + Hc / 2;
      if (center >= deathY && center < returnY) fireDefib();
    };
    canvas.addEventListener("click", onClick);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        draw(window.scrollY);
      });
    };
    const onResize = () => {
      resize();
      measure();
      draw(window.scrollY);
    };

    resize();
    measure();
    draw(window.scrollY);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Re-measure once fonts settle (glyph metrics shift paragraph positions).
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        measure();
        draw(window.scrollY);
      });
      ro.observe(document.documentElement);
    }
    const remeasureT = [
      window.setTimeout(onResize, 350),
      window.setTimeout(onResize, 1200),
    ];
    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) onResize();
      });
    }

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onClick);
      ro?.disconnect();
      remeasureT.forEach(clearTimeout);
    };
  }, [reduced]);

  return (
    <>
      <canvas ref={canvasRef} className="pl-rail" aria-hidden="true" />
      <div
        ref={readoutRef}
        className="pl-readout"
        data-phase="sinus"
        aria-hidden="true"
      >
        <span className="pl-rhythm" style={{ marginBottom: "0.15rem" }}>
          CARDIAC
        </span>
        <span className="pl-bpm" ref={bpmRef}>
          78 BPM
        </span>
        <span className="pl-rhythm" ref={rhythmRef}>
          SINUS RHYTHM
        </span>
        <div className="pl-log" aria-hidden="true">
          <span data-log="drop" data-on="1">
            &gt; DROP · CONFIRMED
          </span>
          <span data-log="hem">&gt; HEMORRHAGE · SEV</span>
          <span data-log="flat">&gt; FLATLINE</span>
          <span data-log="gild">&gt; GILD · DETECTED</span>
        </div>
      </div>
    </>
  );
}
