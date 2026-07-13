"use client";

import { useEffect, useState } from "react";

/**
 * The descent gauge — a persistent readout of how deep you've gone. Scroll
 * position maps to the city's sublevels: the top sits just under the Halo
 * (−61), the bottom is the throne (−99), matching the deed depths and the
 * prologue's "sixty levels under the Halo." Purely a scroll ornament, so it
 * is hidden from assistive tech and only shown where the gutter is wide.
 */
export default function DescentGauge() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const sublevel = 61 + Math.round(p * 38);
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <aside
      aria-hidden="true"
      className="pointer-events-none fixed right-3 top-1/2 z-[5] hidden -translate-y-1/2 flex-col items-center min-[1360px]:flex"
      style={{ height: "48vh", fontFamily: "var(--font-geist-mono)" }}
    >
      <span
        className="mb-2 text-[0.5rem] tracking-[0.2em]"
        style={{ color: "#4a4453" }}
      >
        −61
      </span>
      <div className="relative w-6 flex-1">
        {/* the shaft */}
        <span
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
          style={{
            background:
              "linear-gradient(180deg, rgba(138,106,31,0.15), rgba(138,106,31,0.55) 50%, rgba(138,106,31,0.15))",
          }}
        />
        {/* the gilded fall — filled from the top down to the marker */}
        <span
          className="absolute left-1/2 top-0 w-px -translate-x-1/2"
          style={{
            height: `${p * 100}%`,
            background: "linear-gradient(180deg, rgba(212,167,44,0.2), #d4a72c)",
          }}
        />
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute left-1/2 h-px w-1.5 -translate-x-1/2"
            style={{ top: `${t * 100}%`, background: "rgba(138,106,31,0.45)" }}
          />
        ))}
        {/* the marker + the live sublevel readout */}
        <span
          className="absolute left-1/2 flex -translate-x-1/2 items-center"
          style={{ top: `${p * 100}%`, transform: "translate(-50%, -50%)" }}
        >
          <span
            className="block h-2 w-2 rotate-45"
            style={{ background: "#f5c84c", boxShadow: "0 0 8px rgba(245,200,76,0.6)" }}
          />
        </span>
        <span
          className="absolute right-full mr-2 whitespace-nowrap text-[0.5rem] uppercase tracking-[0.24em] [writing-mode:vertical-rl]"
          style={{ top: `${p * 100}%`, transform: "translateY(-50%) rotate(180deg)", color: "#d4a72c" }}
        >
          SUBLEVEL −{sublevel}
        </span>
      </div>
      <span
        className="mt-2 text-[0.5rem] tracking-[0.2em]"
        style={{ color: "#4a4453" }}
      >
        −99
      </span>
    </aside>
  );
}
