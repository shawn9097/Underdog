"use client";

import { useState } from "react";
import { TRACKS } from "@/lib/album";

const MONO = { fontFamily: "var(--font-geist-mono)" } as const;
const SHOULDERS = {
  fontFamily: "var(--font-big-shoulders)",
  fontWeight: 700,
} as const;
const SERIF_IT = {
  fontFamily: "var(--font-instrument-serif)",
  fontStyle: "italic",
} as const;

const styleExcerpt = (s: string) =>
  s.split(",").slice(0, 7).join(",").trim() + " …";

/**
 * The 14-track ladder. Hover (mouse) or tap a rung to reveal the track's
 * verbatim hook line and a style excerpt from the songbook.
 */
export default function TrackLadder() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ol className="mt-14 border-t border-[#2a2531] text-left" aria-label="Track list">
      {TRACKS.map((t) => {
        const isOpen = open === t.n;
        return (
          <li key={t.n} className="rise border-b border-[#2a2531]">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`track-${t.n}`}
              onClick={() => setOpen(isOpen ? null : t.n)}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setOpen(t.n);
              }}
              className="group flex min-h-12 w-full cursor-pointer items-baseline gap-3 px-2 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-hot)] sm:gap-5"
            >
              <span
                className={`w-8 shrink-0 text-xs ${
                  isOpen ? "text-[var(--gold-hot)]" : "text-[var(--gold-dim)]"
                }`}
                style={MONO}
              >
                {String(t.n).padStart(2, "0")}
              </span>
              <span
                className={`flex-1 uppercase leading-[0.95] tracking-[0.02em] text-[clamp(1.55rem,3.6vw,2.5rem)] transition-colors duration-200 ${
                  isOpen
                    ? "text-[var(--gold-hot)]"
                    : "text-[var(--bone)] group-hover:text-[var(--gold-white)]"
                }`}
                style={SHOULDERS}
              >
                {t.title}
              </span>
              {t.bpm ? (
                <span
                  className="hidden text-[0.6rem] tracking-[0.2em] text-[#57505f] sm:inline"
                  style={MONO}
                >
                  {t.bpm} BPM
                </span>
              ) : null}
              <span
                aria-hidden="true"
                className="text-sm text-[var(--gold-dim)]"
                style={MONO}
              >
                {isOpen ? "—" : "+"}
              </span>
            </button>
            <div
              id={`track-${t.n}`}
              aria-hidden={!isOpen}
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="mb-4 ml-2 border-l-2 border-[var(--gold)] bg-[rgba(212,167,44,0.05)] px-4 py-4 sm:ml-13 sm:px-6">
                  <p
                    className="text-[1.05rem] leading-snug text-[var(--gold-white)] sm:text-[1.3rem]"
                    style={SERIF_IT}
                  >
                    &ldquo;{t.hook}&rdquo;
                  </p>
                  <p
                    className="mt-3 text-[0.62rem] uppercase leading-relaxed tracking-[0.08em] text-[#8a8494]"
                    style={MONO}
                  >
                    {styleExcerpt(t.style)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
