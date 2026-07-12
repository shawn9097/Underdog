"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/album";
import { type Channel, padCh, seedFor } from "./data";
import SignalTrace from "./SignalTrace";
import { KintsugiSeam } from "./Kintsugi";

/**
 * CH 00 relay record. Truthful to docs: "Prey" is the track that was cut and
 * did not make the final 14 — no lyrics on hand.
 */
const GHOST_LINES = [
  "CARRIER PRESENT. CONTENT NULL.",
  "RELAY LOG: TRACK 'PREY' CUT FROM THE FINAL FOURTEEN.",
  "NO LYRICS RECOVERED. NO STYLE DATA ON HAND.",
  "SIGNAL LOST — TRACK RECLAIMED.",
];

function Corners() {
  return (
    <span aria-hidden>
      <i className="sig-c tl" />
      <i className="sig-c tr" />
      <i className="sig-c bl" />
      <i className="sig-c br" />
    </span>
  );
}

/**
 * Character-by-character teletype. SSR/no-JS renders the full text (shown
 * starts at MAX); with JS it resets and types in, honoring reduced motion.
 */
function Teletype({
  lines,
  tkey,
  reduced,
  cps = 120,
}: {
  lines: readonly string[];
  tkey: string;
  reduced: boolean;
  cps?: number;
}) {
  const total = lines.reduce((a, l) => a + l.length, 0);
  const [shown, setShown] = useState<number>(Number.MAX_SAFE_INTEGER);

  useEffect(() => {
    if (reduced) {
      setShown(Number.MAX_SAFE_INTEGER);
      return;
    }
    setShown(0);
    let raf = 0;
    const start = performance.now() + 300; // let the static burst clear first
    const step = (t: number) => {
      const c = Math.max(0, Math.floor(((t - start) / 1000) * cps));
      setShown(c);
      if (c < total) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [tkey, reduced, total, cps]);

  let acc = 0;
  return (
    <ol className="sig-lines">
      {lines.map((l, i) => {
        const startAt = acc;
        acc += l.length;
        const visible = Math.max(0, Math.min(l.length, shown - startAt));
        const typing = shown >= startAt && shown < acc;
        return (
          <li key={i}>
            <span className="ln" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              {l.slice(0, visible)}
              {typing && <span className="sig-cursor" aria-hidden />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

interface Props {
  channel: Channel;
  tuneStamp: number;
  reduced: boolean;
}

export default function ChannelCard({ channel, tuneStamp, reduced }: Props) {
  const t = channel.track;
  const ghost = t === null;
  const tkey = `${channel.ch}:${tuneStamp}`;
  const comps = t ? t.style.split(", ") : [];

  // Phosphor burn-in: the previous frequency lingers as a dim afterimage
  // behind the new readout for a beat after each retune.
  const [burn, setBurn] = useState<{ freq: string; ghost: boolean } | null>(null);
  const prevRef = useRef<{ freq: string; ghost: boolean }>({
    freq: channel.freq,
    ghost,
  });
  useEffect(() => {
    const prev = prevRef.current;
    if (prev.freq === channel.freq) return;
    prevRef.current = { freq: channel.freq, ghost };
    if (reduced) return;
    setBurn(prev);
    const id = window.setTimeout(() => setBurn(null), 800);
    return () => window.clearTimeout(id);
  }, [channel.freq, ghost, reduced]);

  return (
    <article
      className={`sig-card${ghost ? " is-ghost" : ""}`}
      aria-label={ghost ? "Channel 00 — ghost carrier" : `Channel ${padCh(channel.ch)} — ${t.title}`}
    >
      <Corners />

      <div className="sig-trace-wrap">
        <span className="sig-trace-tag">OSC TRACE ▪ CH {padCh(channel.ch)}</span>
        <span className="sig-trace-tag right">VISUAL FINGERPRINT — NOT PLAYBACK</span>
        <SignalTrace
          seed={seedFor(t)}
          bpm={t?.bpm}
          ghost={ghost}
          tuneStamp={tuneStamp}
          reduced={reduced}
          label={ghost ? "ghost carrier CH 00" : t.title}
        />
      </div>

      <div className="sig-readout">
        <div className="sig-freq">
          {channel.freq}
          <small>MHz</small>
          {burn && (
            <span
              className={`sig-freq-burn${burn.ghost ? " was-ghost" : ""}`}
              aria-hidden
            >
              {burn.freq}
            </span>
          )}
        </div>
        <div className="sig-readout-meta">
          <span>
            CHANNEL <b>{padCh(channel.ch)} / 14</b>
          </span>
          <span>
            RATE <b>{t?.bpm ? `${t.bpm} BPM` : ghost ? "NULL" : "UNLOGGED"}</b>
          </span>
          <span>
            SOURCE <b>{BRAND.label.toUpperCase()}</b>
          </span>
        </div>
      </div>

      <h2 className="sig-title">{ghost ? "PREY" : t.title}</h2>
      {t ? (
        <p className="sig-hook">&ldquo;{t.hook}&rdquo;</p>
      ) : (
        <p className="sig-hook">dead air where a track used to stand</p>
      )}
      <p className="sig-note">
        RELAY NOTE: {t ? t.role : "DEAD CHANNEL — HOLDING THE FREQUENCY OPEN."}
      </p>

      <KintsugiSeam />

      <section>
        <h3 className="sig-sec-h">
          SIGNAL COMPOSITION
          {t ? (
            <span className="cnt">
              {String(comps.length).padStart(2, "0")} COMPONENTS ISOLATED
            </span>
          ) : (
            <span className="cnt">UNRESOLVED</span>
          )}
        </h3>
        {t ? (
          <ul className="sig-chips">
            {comps.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        ) : (
          <p className="sig-null">ANALYSIS RETURNS NOTHING. THE COMPOSITION WAS NEVER FILED.</p>
        )}
      </section>

      <section>
        <h3 className="sig-sec-h">
          {t ? "TRANSMISSION LOG — VERBATIM INTERCEPT" : "TRANSMISSION LOG — RELAY RECORD"}
        </h3>
        <Teletype lines={t ? t.lines : GHOST_LINES} tkey={tkey} reduced={reduced} />
      </section>

      <Link href="/key" className="sig-cta">
        <span className="sig-cta-tag">INTERCEPTED INSTRUCTION — APPENDED TO EVERY BROADCAST</span>
        <span className="sig-cta-body">
          NOW ACCEPTING TENANTS IN UNDERDOG CITY — CLAIM YOUR{" "}
          <span className="nw">
            KEY <span className="arr">→</span>
          </span>
        </span>
      </Link>
    </article>
  );
}
