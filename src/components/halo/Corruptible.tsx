"use client";

/**
 * Text that the decay layer is allowed to attack — but only after its
 * section has been read at least once (useSectionSeen), and never for
 * screen readers (the stable copy stays in an sr-only span).
 */

import { useEffect, useState } from "react";
import { useDecay, useSectionSeen } from "./decay";

/** The corruption only escalates from stage 1 upward. */
type MinStage = 1 | 2 | 3;

const GLITCH = "█▓▒░/¦×—∅";

export function Corruptible({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { stage, reduced, dropped } = useDecay();
  const seen = useSectionSeen();
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (reduced || dropped || stage < 1 || !seen) {
      setDisplay(null);
      return;
    }
    let revert: ReturnType<typeof setTimeout> | undefined;
    const iv = setInterval(
      () => {
        if (document.hidden) return;
        if (Math.random() > 0.34) return;
        const chars = text.split("");
        const hits = 1 + Math.floor(Math.random() * (stage * 2));
        for (let i = 0; i < hits; i++) {
          const at = Math.floor(Math.random() * chars.length);
          if (chars[at] !== " ") {
            chars[at] = GLITCH[Math.floor(Math.random() * GLITCH.length)];
          }
        }
        setDisplay(chars.join(""));
        revert = setTimeout(() => setDisplay(null), 160);
      },
      2800 - stage * 550,
    );
    return () => {
      clearInterval(iv);
      if (revert) clearTimeout(revert);
      setDisplay(null);
    };
  }, [text, stage, seen, reduced, dropped]);

  return (
    <span className={className}>
      <span className="hl-sr">{text}</span>
      <span aria-hidden="true">{display ?? text}</span>
    </span>
  );
}

/**
 * Corporate copy that flickers to a verbatim canon truth once decay is
 * advanced enough AND the lie has already been read. Under reduced
 * motion the truth simply replaces the lie (no flashing).
 */
export function TruthSwap({
  lie,
  truth,
  minStage = 2,
  className,
}: {
  lie: string;
  truth: string;
  minStage?: MinStage;
  className?: string;
}) {
  const { stage, reduced, dropped } = useDecay();
  const seen = useSectionSeen();
  const active = stage >= minStage && seen && !dropped;
  const [showTruth, setShowTruth] = useState(false);

  useEffect(() => {
    if (!active) {
      setShowTruth(false);
      return;
    }
    if (reduced) {
      setShowTruth(true);
      return;
    }
    let t: ReturnType<typeof setTimeout> | undefined;
    const iv = setInterval(() => {
      if (document.hidden) return;
      const p = stage >= 3 ? 0.68 : 0.42;
      if (Math.random() < p) {
        setShowTruth(true);
        t = setTimeout(
          () => setShowTruth(stage >= 3 && Math.random() < 0.45),
          stage >= 3 ? 2600 : 1500,
        );
      }
    }, 4200);
    return () => {
      clearInterval(iv);
      if (t) clearTimeout(t);
    };
  }, [active, reduced, stage]);

  return (
    <span className={className}>
      <span className="hl-sr">{lie}</span>
      <span aria-hidden="true" className={showTruth ? "hl-truthtext" : undefined}>
        {showTruth ? truth : lie}
      </span>
    </span>
  );
}
