"use client";

import { useRef, useState } from "react";
import { useDecay } from "./decay";

/**
 * The Halo sigil — a perfect ring, serenely orbiting, ticked like a
 * precision instrument (the Sainted measure worth exactly). Also the
 * hidden fast-path: keep touching what you were only meant to admire,
 * and the Sainted issue their determination immediately.
 */

const CX = 300;
const CY = 300;
const R = 234;

/** Measurement ticks around the ring — every sixth is a major graduation. */
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const major = i % 6 === 0;
  const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
  const rInner = major ? 246 : 251;
  const rOuter = 258;
  const round = (n: number) => Number(n.toFixed(2));
  return {
    x1: round(CX + Math.cos(a) * rInner),
    y1: round(CY + Math.sin(a) * rInner),
    x2: round(CX + Math.cos(a) * rOuter),
    y2: round(CY + Math.sin(a) * rOuter),
    major,
  };
});

export default function HaloSigil() {
  const { spend, judge, dropped } = useDecay();
  const clicks = useRef(0);
  const [note, setNote] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  const onClick = () => {
    if (dropped) return;
    clicks.current += 1;
    setPulse((p) => p + 1);
    spend(1.2);
    if (clicks.current === 3) setNote("REPEATED CONTACT LOGGED");
    if (clicks.current === 4) setNote("FINAL WARNING");
    if (clicks.current >= 5) judge();
  };

  return (
    <div className="hl-sigil-wrap" data-reveal>
      <button
        type="button"
        className="hl-sigil"
        aria-label="The Halo sigil"
        onClick={onClick}
      >
        <svg
          viewBox="0 0 600 600"
          className="hl-sigil-svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="hl-ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7fa8d9" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#c9d2dc" stopOpacity="0.5" />
              <stop offset="1" stopColor="#7fa8d9" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* soft halo bloom behind the ring */}
          <circle cx={CX} cy={CY} r={R} className="hl-sigil-halo" />

          {/* concentric measurement rings */}
          <circle cx={CX} cy={CY} r={186} className="hl-sigil-inner" />
          <circle cx={CX} cy={CY} r={132} className="hl-sigil-inner" />

          {/* graduated tick ring */}
          <g className="hl-sigil-ticks">
            {TICKS.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                className={t.major ? "is-major" : undefined}
              />
            ))}
          </g>

          {/* the ring itself */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            className="hl-sigil-ring"
            stroke="url(#hl-ring-grad)"
          />

          {/* kintsugi — the perfect ring fractures and gilds as worth is spent */}
          <g className="hl-sigil-cracks">
            <g className="hl-sigil-cg1">
              <path pathLength={100} d="M 300 62 L 314 140 L 296 210 L 322 292" />
              <path pathLength={100} d="M 540 288 L 452 302 L 388 286 L 312 300" />
            </g>
            <g className="hl-sigil-cg2">
              <path pathLength={100} d="M 300 540 L 288 456 L 306 388 L 284 312" />
              <path pathLength={100} d="M 60 312 L 150 298 L 214 312 L 290 300" />
              <path pathLength={100} className="is-fine" d="M 314 140 L 372 122 L 410 150" />
            </g>
            <g className="hl-sigil-cg3">
              <path pathLength={100} d="M 322 292 L 360 352 L 430 392 L 500 452" />
              <path pathLength={100} d="M 296 210 L 232 172 L 168 132" />
              <path pathLength={100} d="M 284 312 L 220 352 L 150 372" />
              <path pathLength={100} className="is-fine" d="M 306 388 L 356 420 L 384 470" />
            </g>
          </g>

          {/* per-click ripple — a serene surface, disturbed */}
          {pulse > 0 && (
            <circle
              key={pulse}
              cx={CX}
              cy={CY}
              r={R}
              className="hl-sigil-pulse"
            />
          )}

          {/* orbiting index arc */}
          <circle cx={CX} cy={CY} r={252} className="hl-sigil-arc" />

          {/* center crosshair — the point of judgment */}
          <g className="hl-sigil-cross">
            <line x1={CX - 16} y1={CY} x2={CX + 16} y2={CY} />
            <line x1={CX} y1={CY - 16} x2={CX} y2={CY + 16} />
            <circle cx={CX} cy={CY} r={3.2} className="hl-sigil-dot" />
          </g>
        </svg>
      </button>
      <p className="hl-sigil-note hl-micro" role="status">
        {note ?? " "}
      </p>
    </div>
  );
}
