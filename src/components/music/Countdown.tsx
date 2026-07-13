"use client";

import { useEffect, useRef, useState } from "react";
import { msUntilRelease } from "@/lib/album";

interface Parts {
  d: string;
  h: string;
  m: string;
  s: string;
  done: boolean;
}

function partsAt(now: number): Parts {
  const ms = msUntilRelease(now);
  if (ms <= 0) return { d: "00", h: "00", m: "00", s: "00", done: true };
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    d: String(d).padStart(2, "0"),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    done: false,
  };
}

/**
 * Live countdown to 07.31.2026. Only rendered after gate resolution (client),
 * so it can tick real values immediately — no hydration risk. Fires onZero
 * once when the door date passes while the visitor is watching.
 */
export default function Countdown({
  onZero,
  compact = false,
}: {
  onZero?: () => void;
  compact?: boolean;
}) {
  const [p, setP] = useState<Parts>(() => partsAt(Date.now()));
  const firedRef = useRef(false);
  const onZeroRef = useRef(onZero);
  onZeroRef.current = onZero;

  useEffect(() => {
    const tick = () => {
      const np = partsAt(Date.now());
      setP(np);
      if (np.done && !firedRef.current) {
        firedRef.current = true;
        onZeroRef.current?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cells: Array<[string, string]> = [
    [p.d, "DAYS"],
    [p.h, "HRS"],
    [p.m, "MIN"],
    [p.s, "SEC"],
  ];

  return (
    <div
      className={compact ? "mu-count mu-count-compact" : "mu-count"}
      role="timer"
      aria-label={`Time until release: ${p.d} days ${p.h} hours ${p.m} minutes ${p.s} seconds`}
    >
      {cells.map(([v, l], i) => (
        <span className="mu-count-cell" key={l}>
          <span className="mu-count-num" aria-hidden>
            {v}
          </span>
          <span className="mu-count-lbl" aria-hidden>
            {l}
          </span>
          {i < 3 && (
            <span className="mu-count-sep" aria-hidden>
              :
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
