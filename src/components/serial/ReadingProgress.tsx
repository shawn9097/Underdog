"use client";

/**
 * Reading-progress chrome for the chapter reader:
 *  - a hairline top bar (blood → gold as the chapter is read)
 *  - localStorage persistence per chapter ("uc:serial-progress:v1")
 *  - a "resume where the blood left off" offer on return visits.
 *
 * SSR-safe: nothing stateful renders until after mount, and the bar's fill is
 * driven imperatively (style.transform) so scroll never causes re-renders.
 */

import { useEffect, useRef, useState } from "react";
import { readChapterProgress, writeChapterProgress } from "./progressStore";

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export default function ReadingProgress({ slug }: { slug: string }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const showingRef = useRef(false);
  showingRef.current = resumeAt !== null;

  useEffect(() => {
    // Offer resume only for a meaningful, unfinished prior read.
    const saved = readChapterProgress(slug);
    if (saved && saved.f > 0.04 && saved.f < 0.97 && window.scrollY < 40) {
      setResumeAt(saved.f);
    }

    const maxScroll = () =>
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const fraction = () => clamp01(window.scrollY / maxScroll());

    let raf = 0;
    let lastSave = 0;
    const update = () => {
      raf = 0;
      const f = fraction();
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${f})`;
      const now = performance.now();
      if (now - lastSave > 600) {
        lastSave = now;
        writeChapterProgress(slug, f);
      }
      // Reader found their own way back down — retire the offer.
      if (showingRef.current && f > 0.3) setResumeAt(null);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const persist = () => writeChapterProgress(slug, fraction());

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", persist);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", persist);
    };
  }, [slug]);

  const resume = () => {
    if (resumeAt === null) return;
    const top =
      resumeAt *
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    setResumeAt(null);
  };

  return (
    <>
      <div className="pl-progress" aria-hidden="true">
        <div className="pl-progress-fill" ref={fillRef} />
      </div>
      {resumeAt !== null && (
        <div className="pl-resume">
          <button type="button" className="pl-resume-btn" onClick={resume}>
            <span className="pl-resume-k" aria-hidden="true">
              ⟶ {Math.round(resumeAt * 100)}%
            </span>
            resume where the blood left off
          </button>
          <button
            type="button"
            className="pl-resume-x"
            onClick={() => setResumeAt(null)}
            aria-label="Dismiss and read from the top"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
