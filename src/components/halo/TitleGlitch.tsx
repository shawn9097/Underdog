"use client";

/**
 * The corruption reaches the chrome itself. As the Worth Index falls, the
 * browser tab title occasionally flickers — glitch at first, then, once decay
 * is total, a verbatim line from the prologue. On the Drop it hardens to the
 * verdict. Runs only after mount (no SSR divergence) and never under
 * prefers-reduced-motion. Renders nothing; restores the pristine title on
 * unmount.
 */

import { useEffect, useRef } from "react";
import { PROLOGUE } from "@/lib/album";
import { useDecay } from "./decay";

const DROP_TITLE = "WORTHLESS — THE HALO";

// stage 3 — the buried truth surfaces, verbatim from canon
const TRUTH_TITLES = [
  PROLOGUE[23], // "But I remember the bell."
  PROLOGUE[27], // "They want a monster?"
  PROLOGUE[21], // "Something gold. And patient. And very, very angry."
  PROLOGUE[25], // "My eyes open in the dark."
];
const STAGE2_TITLES = ["THE H█LO — DEFICIENT", "▓ WORTH INSUFFICIENT ▓"];
const STAGE1_TITLES = ["THE H▓LO", "THE HAL░"];

export default function TitleGlitch() {
  const { stage, dropped, reduced } = useDecay();
  const baseline = useRef<string | null>(null);
  const restore = useRef<ReturnType<typeof setTimeout> | null>(null);

  // capture the pristine title once; always put it back when we leave
  useEffect(() => {
    if (baseline.current === null) baseline.current = document.title;
    return () => {
      if (restore.current) clearTimeout(restore.current);
      if (baseline.current !== null) document.title = baseline.current;
    };
  }, []);

  useEffect(() => {
    if (reduced) return;
    const base = baseline.current ?? document.title;

    if (dropped) {
      if (restore.current) clearTimeout(restore.current);
      document.title = DROP_TITLE;
      return;
    }
    if (stage < 1) {
      document.title = base;
      return;
    }

    const pool =
      stage >= 3 ? TRUTH_TITLES : stage >= 2 ? STAGE2_TITLES : STAGE1_TITLES;

    const iv = setInterval(() => {
      if (document.hidden) return;
      if (Math.random() > 0.4) return;
      document.title = pool[Math.floor(Math.random() * pool.length)];
      if (restore.current) clearTimeout(restore.current);
      restore.current = setTimeout(() => {
        document.title = base;
      }, 1200);
    }, 5200);

    return () => {
      clearInterval(iv);
      if (restore.current) clearTimeout(restore.current);
      document.title = base;
    };
  }, [stage, dropped, reduced]);

  return null;
}
