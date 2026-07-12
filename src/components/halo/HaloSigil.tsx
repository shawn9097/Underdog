"use client";

import { useRef, useState } from "react";
import { useDecay } from "./decay";

/**
 * The Halo sigil — a perfect ring, serenely orbiting. Also the hidden
 * fast-path: keep touching what you were only meant to admire, and the
 * Sainted issue their determination immediately.
 */
export default function HaloSigil() {
  const { spend, judge, dropped } = useDecay();
  const clicks = useRef(0);
  const [note, setNote] = useState<string | null>(null);

  const onClick = () => {
    if (dropped) return;
    clicks.current += 1;
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
          <circle cx="300" cy="300" r="234" className="hl-sigil-halo" />
          <circle
            cx="300"
            cy="300"
            r="234"
            className="hl-sigil-ring"
            stroke="url(#hl-ring-grad)"
          />
          <circle cx="300" cy="300" r="252" className="hl-sigil-arc" />
        </svg>
      </button>
      <p className="hl-sigil-note hl-micro" role="status">
        {note ?? " "}
      </p>
    </div>
  );
}
