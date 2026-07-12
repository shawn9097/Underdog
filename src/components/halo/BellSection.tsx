"use client";

import { useEffect, useState } from "react";
import { msUntilRelease } from "@/lib/album";
import { Corruptible, TruthSwap } from "./Corruptible";
import { useDecay } from "./decay";

/**
 * THE VICTORY BELL — a live "problems solved" counter. Canon: the bell
 * rings when they've decided a problem's been solved. The next citywide
 * resolution is scheduled for the album's release date.
 */

const BASE_COUNT = 88_584;

function formatLeft(ms: number): string {
  if (ms <= 0) return "00D 00:00:00";
  const s = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${pad(d)}D ${pad(h)}:${pad(m)}:${pad(s % 60)}`;
}

export default function BellSection() {
  const { spend, dropped } = useDecay();
  const [count, setCount] = useState(BASE_COUNT);
  const [ringing, setRinging] = useState(false);
  const [reported, setReported] = useState(false);
  const [left, setLeft] = useState<string | null>(null);

  // the bell rings on its own schedule
  useEffect(() => {
    let ringOff: ReturnType<typeof setTimeout> | undefined;
    const iv = setInterval(() => {
      if (document.hidden) return;
      setCount((c) => c + 1);
      setRinging(true);
      ringOff = setTimeout(() => setRinging(false), 1300);
    }, 8000);
    return () => {
      clearInterval(iv);
      if (ringOff) clearTimeout(ringOff);
    };
  }, []);

  // countdown to the next citywide resolution (release day)
  useEffect(() => {
    const tick = () => setLeft(formatLeft(msUntilRelease(Date.now())));
    tick();
    const iv = setInterval(() => {
      if (!document.hidden) tick();
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const report = () => {
    if (dropped) return;
    spend(3);
    setCount((c) => c + 1);
    setRinging(true);
    setReported(true);
    setTimeout(() => setRinging(false), 1300);
  };

  return (
    <div className="hl-wrap hl-bell-grid">
      <div className="hl-bell-side">
        <p className="hl-micro" data-reveal>
          CIVIC INSTRUMENT N°1
        </p>
        <h2 className="hl-h2" data-reveal>
          <Corruptible text="The Victory Bell" />
        </h2>
        <p className="hl-body" data-reveal>
          <TruthSwap
            lie="When a problem is solved, the Halo rings. Clean. Bright. Every citizen may take comfort in the count."
            truth="The sound they make when they've decided a problem's been solved."
          />
        </p>
        <p className="hl-body" data-reveal>
          <TruthSwap
            lie="The bell is audible in every district, in every home, at any depth."
            truth="Muffled through a mile of steel and money, the Halo is ringing its victory bell."
            minStage={3}
          />
        </p>
        <button type="button" className="hl-btn hl-btn--ghost" onClick={report} data-reveal>
          Report a Problem
        </button>
        {reported && (
          <p className="hl-micro hl-bell-reported" role="status">
            YOUR PROBLEM HAS BEEN RECORDED AS SOLVED.
          </p>
        )}
      </div>

      <div className="hl-bell-main" data-reveal data-dwell>
        <div className="hl-bell-stage">
          <span className="hl-ripple" key={count} aria-hidden="true" />
          <svg
            viewBox="0 0 64 64"
            className={ringing ? "hl-bell is-ringing" : "hl-bell"}
            aria-hidden="true"
            focusable="false"
          >
            <path d="M32 4c2.6 0 4.7 2 4.7 4.5v2C45 12.8 50.8 20.3 50.8 29.4c0 13 3.5 16.9 6.6 19.4H6.6c3.1-2.5 6.6-6.4 6.6-19.4 0-9.1 5.8-16.6 14.1-18.9v-2C27.3 6 29.4 4 32 4z" />
            <path d="M25.2 52.6a6.9 6.9 0 0 0 13.6 0z" />
          </svg>
        </div>
        <p className="hl-bell-count">{count.toLocaleString("en-US")}</p>
        <p className="hl-micro hl-bell-sub">
          <TruthSwap lie="PROBLEMS SOLVED" truth="PROBLEMS DECIDED SOLVED" />
        </p>
        <p className="hl-micro hl-bell-next">
          {left
            ? `NEXT CITYWIDE RESOLUTION — ${left}`
            : "NEXT CITYWIDE RESOLUTION — SCHEDULED"}
        </p>
      </div>
    </div>
  );
}
