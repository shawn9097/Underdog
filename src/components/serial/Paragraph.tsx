"use client";

/**
 * Renders one chapter paragraph with its assigned cinematic treatment.
 * Text is always real, selectable DOM (verbatim from @/lib/album). Where
 * letters are split for animation, the paragraph carries an aria-label with
 * the full text so screen readers still read the sentence intact.
 */

import { useEffect, useRef, useState } from "react";
import type { BeatDef } from "./beats";

/** Split a string into per-letter spans, preserving whitespace. */
function letters(text: string, cls: string) {
  return Array.from(text).map((ch, k) => (
    <span key={k} className={cls} aria-hidden="true">
      {ch === " " ? " " : ch}
    </span>
  ));
}

export default function Paragraph({
  def,
  text,
  onBell,
}: {
  def: BeatDef;
  text: string;
  onBell?: () => void;
}) {
  const [ringing, setRinging] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Bell auto-rings once when it first scrolls into view (motion allowed only).
  useEffect(() => {
    if (def.t !== "bell") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = bellRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRinging(true);
            window.setTimeout(() => setRinging(false), 900);
            io.disconnect();
          }
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [def.t]);

  switch (def.t) {
    case "dialogue":
      return (
        <p className="pl-dialogue" data-reveal>
          {text}
        </p>
      );

    case "bell": {
      const ring = () => {
        setRinging(true);
        onBell?.();
        window.setTimeout(() => setRinging(false), 900);
      };
      return (
        <div className="pl-bell" ref={bellRef}>
          <span
            className="pl-bell-ring"
            data-ringing={ringing ? "1" : undefined}
            aria-hidden="true"
          />
          <button
            type="button"
            className="pl-bell-btn"
            data-reveal
            onClick={ring}
            aria-label="Ring the victory bell again"
          >
            <p className="pl-p">{text}</p>
            <span className="pl-bell-hint" aria-hidden="true">
              ↻ ring it again
            </span>
          </button>
        </div>
      );
    }

    case "fracture":
      return (
        <p className="pl-p pl-fracture" data-reveal data-fracture>
          <span className="pl-fracture-line" aria-hidden="true" />
          {text}
        </p>
      );

    case "fade": {
      const mark = def.dissolveFrom ?? "";
      const idx = mark ? text.indexOf(mark) : -1;
      if (idx === -1) {
        return (
          <p className="pl-p pl-fade-p" data-reveal>
            {text}
          </p>
        );
      }
      const head = text.slice(0, idx);
      const tail = text.slice(idx);
      return (
        <p
          className="pl-p pl-fade-p"
          data-reveal
          data-anchor={def.anchor}
          aria-label={text}
        >
          <span aria-hidden="true">{head}</span>
          <span aria-hidden="true">{letters(tail, "pl-diss-letter")}</span>
        </p>
      );
    }

    case "death":
      return (
        <p className="pl-death" data-reveal data-anchor="death">
          {text}
        </p>
      );

    case "void":
      return (
        <p className="pl-void" data-reveal>
          {text}
        </p>
      );

    case "beat":
      return (
        <p
          className="pl-beat"
          data-reveal
          data-warm={def.scale && def.scale >= 1.7 ? "1" : undefined}
          style={{ ["--pl-beat-scale" as string]: String(def.scale ?? 1) }}
        >
          {text}
        </p>
      );

    case "ignite":
      return (
        <p className="pl-ignite" data-reveal data-anchor="return">
          {text}
        </p>
      );

    case "return":
      return (
        <p className="pl-return" data-reveal>
          {text}
        </p>
      );

    default:
      return (
        <p className="pl-p" data-reveal>
          {text}
        </p>
      );
  }
}
