"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Terminal boot — fast, skippable on click or any key.
 * Tone derived from canon: Cenotaph Records relay, hijacked Halo carrier,
 * "sixty levels under the Halo" (prologue), the manifesto's one rule.
 */
const LINES: { text: string; cls?: string }[] = [
  { text: "CENOTAPH RELAY // UNLICENSED BOOT 0.14" },
  { text: "TAPPING HALO CARRIER ............... OK" },
  { text: "REROUTING THROUGH THE SPRAWL ....... OK" },
  { text: "SOURCE LOCK: SIXTY LEVELS UNDER THE HALO" },
  { text: "BAND SCAN: 14 CHANNELS FOUND / 1 GHOST" },
  { text: "SIGNAL ACQUIRED", cls: "big" },
  { text: "NOW BROADCASTING FROM BELOW", cls: "big" },
  {
    text: "THERE'S ONLY ONE RULE IN UNDERDOG CITY: TURN THAT SHIT UP LOUD.",
    cls: "loud",
  },
];

export default function BootSequence({
  reduced,
  onDone,
}: {
  reduced: boolean;
  onDone: () => void;
}) {
  const [n, setN] = useState(reduced ? LINES.length : 0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDoneRef.current();
    };
    const timers: number[] = [];
    if (reduced) {
      setN(LINES.length);
      timers.push(window.setTimeout(finish, 1200));
    } else {
      LINES.forEach((_, i) => {
        timers.push(window.setTimeout(() => setN(i + 1), 175 * (i + 1)));
      });
      timers.push(window.setTimeout(finish, 175 * LINES.length + 1150));
    }
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", onKey);
    };
  }, [reduced]);

  return (
    <button
      type="button"
      className="sig-boot"
      aria-label="Skip boot sequence"
      onClick={() => {
        if (doneRef.current) return;
        doneRef.current = true;
        onDoneRef.current();
      }}
    >
      <span className="sig-boot-inner">
        {LINES.slice(0, n).map((l, i) => (
          <span key={i} className={`sig-boot-line${l.cls ? ` ${l.cls}` : ""}`}>
            {l.text}
          </span>
        ))}
        <span className="sig-boot-skip">
          <i className="cur" aria-hidden>
            ▮
          </i>{" "}
          CLICK / ANY KEY TO SKIP
        </span>
      </span>
    </button>
  );
}
