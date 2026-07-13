"use client";

/**
 * THE SAINTED AUDIT — a live surveillance ledger, bottom-right. Every Worth
 * deduction is filed here with a cold in-world reason. Once a visitor's decay
 * is advanced (stage >= 2), the buried truth starts bleeding into the record:
 * verbatim PROLOGUE fragments, in gold serif, where a clean number should be.
 *
 * Decorative marginalia only — aria-hidden, pointer-events none, hidden on
 * small screens so it never competes with body text or touch targets.
 */

import { useEffect, useRef, useState } from "react";
import { PROLOGUE } from "@/lib/album";
import { useDecay } from "./decay";

const REASONS = [
  "CURIOSITY IS A LIABILITY",
  "HESITATION NOTED",
  "YOU WERE ONLY MEANT TO ADMIRE",
  "THE FLOOR IS CLOSER NOW",
  "EVERY ANSWER COSTS",
  "INTEREST FILED AGAINST YOU",
  "ATTENTION IS NOT FREE",
  "GRATITUDE IS A METRIC",
];

/** Verbatim fragments from the prologue (canon source of truth). */
const TRUTHS = [
  "a man with very clean boots is being handed a medal for what he just did to me",
  "The monster crawled up out of the dark. The hero put it down. Sleep well.",
  PROLOGUE[21], // "Something gold. And patient. And very, very angry."
  PROLOGUE[23], // "But I remember the bell."
  PROLOGUE[28], // "I'll be the best one they ever made."
];

interface Entry {
  id: number;
  amount: number;
  text: string;
  truth: boolean;
}

export default function AuditLedger() {
  const { lastSpend, stage, dropped, mounted } = useDecay();
  const [entries, setEntries] = useState<Entry[]>([]);
  const seq = useRef(0);
  const rotate = useRef(0);
  const lastAt = useRef(0);
  const stageRef = useRef(stage);
  stageRef.current = stage;

  useEffect(() => {
    if (!lastSpend || lastSpend.at === lastAt.current) return;
    lastAt.current = lastSpend.at;
    const bleed = stageRef.current >= 2 && Math.random() < 0.3;
    const text = bleed
      ? TRUTHS[Math.floor(Math.random() * TRUTHS.length)]
      : REASONS[rotate.current++ % REASONS.length];
    seq.current += 1;
    const id = seq.current;
    setEntries((prev) => [
      ...prev,
      { id, amount: lastSpend.amount, text, truth: bleed },
    ].slice(-5));
  }, [lastSpend]);

  if (!mounted || dropped || entries.length === 0) return null;

  return (
    <aside className="hl-ledger" aria-hidden="true">
      <p className="hl-ledger-head">SAINTED AUDIT — LIVE</p>
      <ul>
        {entries.map((e) => (
          <li
            key={e.id}
            className={e.truth ? "hl-ledger-line is-truth" : "hl-ledger-line"}
          >
            {e.truth ? (
              <span className="hl-ledger-truth">{e.text}</span>
            ) : (
              <>
                <span className="hl-ledger-amt">−{e.amount.toFixed(2)}</span>
                <span className="hl-ledger-reason">{e.text}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
