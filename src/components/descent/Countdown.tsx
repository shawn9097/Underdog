"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { BRAND, msUntilRelease } from "@/lib/album";

const MONO = { fontFamily: "var(--font-geist-mono)" } as const;

interface Parts {
  d: string;
  h: string;
  m: string;
  s: string;
  out: boolean;
}

function compute(): Parts {
  const ms = msUntilRelease(Date.now());
  if (ms <= 0) return { d: "00", h: "00", m: "00", s: "00", out: true };
  const t = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    d: pad(Math.floor(t / 86400)),
    h: pad(Math.floor((t % 86400) / 3600)),
    m: pad(Math.floor((t % 3600) / 60)),
    s: pad(t % 60),
    out: false,
  };
}

/**
 * Live countdown to 07.31.2026. Renders placeholder digits on the server,
 * hydrates to the real clock in an effect — no SSR/client divergence.
 */
export default function Countdown() {
  const [p, setP] = useState<Parts | null>(null);
  const secRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setP(compute());
    const id = setInterval(() => setP(compute()), 1000);
    return () => clearInterval(id);
  }, []);

  // each second the last cell gilds for a beat — the clock is alive
  useEffect(() => {
    if (!p || p.out || reducedRef.current || !secRef.current) return;
    const tween = gsap.fromTo(
      secRef.current,
      { color: "#ffe9a8", textShadow: "0 0 18px rgba(245,200,76,0.85)" },
      {
        color: "#f5c84c",
        textShadow: "0 0 0px rgba(245,200,76,0)",
        duration: 0.55,
        ease: "power2.out",
      }
    );
    return () => {
      tween.kill();
    };
  }, [p]);

  if (p?.out) {
    return (
      <p
        role="status"
        className="mt-10 text-sm tracking-[0.4em] text-[var(--gold-hot)]"
        style={MONO}
      >
        OUT NOW ON {BRAND.label.toUpperCase()}
      </p>
    );
  }

  const cells: [string, string][] = [
    [p?.d ?? "--", "DAYS"],
    [p?.h ?? "--", "HOURS"],
    [p?.m ?? "--", "MINUTES"],
    [p?.s ?? "--", "SECONDS"],
  ];

  return (
    <div
      className="mt-10 flex justify-center gap-2 sm:gap-4"
      role="timer"
      aria-label={`Countdown to album release on ${BRAND.releaseDateDisplay}`}
    >
      {cells.map(([v, l]) => (
        <div
          key={l}
          className="min-w-[4.6rem] border border-[#2a2531] bg-[rgba(14,12,17,0.72)] px-2 py-3 sm:min-w-[6rem] sm:py-4"
        >
          <div
            ref={l === "SECONDS" ? secRef : undefined}
            className="text-[clamp(1.7rem,4.5vw,2.8rem)] leading-none text-[var(--gold-hot)] tabular-nums"
            style={{ fontFamily: "var(--font-tektur)", fontWeight: 500 }}
          >
            {v}
          </div>
          <div
            className="mt-2 text-[0.55rem] tracking-[0.28em] text-[#8a8494]"
            style={MONO}
          >
            {l}
          </div>
        </div>
      ))}
    </div>
  );
}
