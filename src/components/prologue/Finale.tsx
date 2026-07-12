"use client";

/**
 * The finale line + the quiet title card. All copy is verbatim: the finale
 * line is PROLOGUE[28]; the three sung lines come from TRACKS[11].lines
 * ("Came Back Wrong"). The " / " in a line is the songbook's line-break
 * convention, rendered as two lines here.
 */

import Link from "next/link";
import { BRAND, PROLOGUE, TRACKS } from "@/lib/album";

const FINALE_TEXT = PROLOGUE[28];
const TRACK = TRACKS[11]; // Came Back Wrong

// Three verbatim lines chosen from the track for the card.
const CARD_LINES = [
  TRACK.lines[2], // "I came back wrong / Not the one you put away"
  TRACK.lines[3], // "You said goodbye to who I was — / Say hello to what's left"
  TRACK.lines[4], // "You don't get to bury what won't stay down"
];

export default function Finale() {
  return (
    <section className="pl-finale-wrap" aria-label="Finale">
      <h2 className="pl-finale" data-anchor="finale" aria-label={FINALE_TEXT}>
        {Array.from(FINALE_TEXT).map((ch, k) => (
          <span key={k} className="pl-fin-letter" aria-hidden="true">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </h2>

      <div className="pl-titlecard" data-reveal>
        <p className="pl-tc-kicker">CAME BACK WRONG</p>
        <p className="pl-tc-meta">
          Track {TRACK.n} of 14 · {BRAND.album}
        </p>
        <div className="pl-tc-lines">
          {CARD_LINES.map((line, i) => (
            <p className="pl-tc-line" key={i}>
              {line.split(" / ").map((part, j) => (
                <span key={j}>{part}</span>
              ))}
            </p>
          ))}
        </div>
        <nav className="pl-exits" aria-label="Continue through Underdog City">
          <Link className="pl-exit" href="/">
            begin the descent →
          </Link>
          <Link className="pl-exit" href="/key">
            claim your key →
          </Link>
        </nav>
      </div>
    </section>
  );
}
