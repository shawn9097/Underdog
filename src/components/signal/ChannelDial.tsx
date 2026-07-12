"use client";

import { CHANNELS, padCh } from "./data";

interface Props {
  current: number;
  onSelect: (n: number) => void;
}

/** Frequency ladder — CH 01–14 plus the CH 00 ghost carrier ("Prey", cut). */
export default function ChannelDial({ current, onSelect }: Props) {
  const tracks = CHANNELS.filter((c) => c.track !== null);
  return (
    <nav className="sig-dial" aria-label="Channel dial">
      <div className="sig-dial-head">
        <span>FREQUENCY LADDER</span>
        <span>BAND: BELOW-FM</span>
      </div>
      <ul>
        {tracks.map((c) => {
          const sel = c.ch === current;
          return (
            <li key={c.ch}>
              <button
                type="button"
                className="sig-ch"
                aria-pressed={sel}
                onClick={() => onSelect(c.ch)}
              >
                <span className="n">CH {padCh(c.ch)}</span>
                <span className="f">{c.freq}</span>
                <span className="t">{c.track!.title}</span>
                <span className="lock" aria-hidden>
                  {sel ? "◆" : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sig-ghost-sep" aria-hidden>
        GHOST CARRIER
      </p>
      <ul>
        <li>
          <button
            type="button"
            className="sig-ch ghost"
            aria-pressed={current === 0}
            onClick={() => onSelect(0)}
          >
            <span className="n">CH 00</span>
            <span className="f">---.-</span>
            <span className="t">Prey — signal lost</span>
            <span className="lock" aria-hidden>
              {current === 0 ? "◆" : ""}
            </span>
          </button>
        </li>
      </ul>
      <p className="sig-dial-hint">TUNE: ARROWS · DIGITS · CLICK</p>
    </nav>
  );
}
