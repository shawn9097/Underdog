"use client";

import Link from "next/link";
import { BRAND, TRACK_ARCS } from "@/lib/album";
import { FULL_LYRICS } from "@/lib/lyrics";
import { Seam } from "./Kintsugi";
import Trace from "./Trace";
import {
  lyricSections,
  neighborsOf,
  padN,
  parseLyrics,
  seedFor,
  styleChips,
  trackBySlug,
} from "./data";
import { useMusic, useReducedMotion } from "./state";

/**
 * A single master reel pulled off the shelf: title, role, hook, the verbatim
 * style plate as composition data, the FULL verbatim lyric sheet (stage
 * directions as marginalia), and the reel's tie into the serial.
 *
 * Entrance reveals are CSS-driven (.mu-reel-head in music.css) — StrictMode-safe.
 */
export default function TrackView({ slug }: { slug: string }) {
  const track = trackBySlug(slug);
  const { vault, playable, current, playing, play } = useMusic();
  const reduced = useReducedMotion();
  const armed = vault !== "idle";

  if (!track) return null;
  const chips = styleChips(track);
  const lyrics = parseLyrics(FULL_LYRICS[track.slug] ?? "");
  const sections = lyricSections(lyrics);
  const arc = TRACK_ARCS[track.slug];
  const { prev, next } = neighborsOf(track.slug);
  const canPlay = playable.includes(track.slug);
  const isCurrent = current === track.slug;

  return (
    <div className="mu-reel">
      <nav className="mu-reel-topnav" aria-label="Music room">
        <Link href="/music" className="mu-backlink">
          ← THE SHELF
        </Link>
        <span className="mu-reel-count" aria-hidden>
          REEL {padN(track.n)} / 14
        </span>
      </nav>

      <header className="mu-reel-head">
        <p className="mu-eyebrow">
          {BRAND.album.toUpperCase()} · TRACK {padN(track.n)}
        </p>
        <h1 className="mu-reel-title">{track.title}</h1>
        <p className="mu-reel-role">{track.role}</p>
        <p className="mu-reel-hook">&ldquo;{track.hook}&rdquo;</p>

        <div className="mu-reel-meta">
          <span>
            RATE <b>{track.bpm ? `${track.bpm} BPM` : "UNLOGGED"}</b>
          </span>
          <span>
            COMPONENTS <b>{padN(chips.length)}</b>
          </span>
          <span>
            SOURCE <b>{BRAND.label.toUpperCase()}</b>
          </span>
          {canPlay ? (
            <button
              type="button"
              className={`mu-playbtn mu-playbtn-lg${isCurrent && playing ? " is-on" : ""}`}
              onClick={() => play(track.slug)}
              aria-label={isCurrent && playing ? `Pause ${track.title}` : `Play ${track.title}`}
            >
              {isCurrent && playing ? "❚❚ PAUSE" : "▶ PLAY"}
            </button>
          ) : !armed ? (
            <button
              type="button"
              className="mu-playbtn mu-playbtn-lg mu-playbtn-listen"
              onClick={() => play(track.slug)}
              aria-label={`Open the vault and play ${track.title}`}
            >
              ▶ OPEN THE VAULT
            </button>
          ) : vault === "opening" ? (
            <span className="mu-incoming" aria-label="Opening the vault">
              <span aria-hidden>◍</span> OPENING THE VAULT
            </span>
          ) : (
            <span className="mu-incoming" title="Masters incoming — the vault is being filled">
              <span aria-hidden>◌</span> MASTERS INCOMING
            </span>
          )}
        </div>
      </header>

      <div className="mu-reel-tracewrap">
        <span className="mu-trace-tag">MASTER TRACE ▪ REEL {padN(track.n)}</span>
        <span className="mu-trace-tag right">VISUAL FINGERPRINT — NOT PLAYBACK</span>
        <Trace
          seed={seedFor(track)}
          bpm={track.bpm}
          live={isCurrent && playing}
          reduced={reduced}
          label={track.title}
        />
      </div>

      <section className="mu-reel-sec" aria-label="Composition data">
        <h2 className="mu-sec-h">
          COMPOSITION DATA
          <span className="cnt">{padN(chips.length)} COMPONENTS — VERBATIM STYLE PLATE</span>
        </h2>
        <ul className="mu-chips">
          {chips.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      <Seam className="mu-seam" />

      <section className="mu-reel-sec" aria-label="Lyrics">
        <h2 className="mu-sec-h">
          THE SHEET
          <span className="cnt">FULL LYRIC — VERBATIM</span>
        </h2>
        <div className={`mu-lyric-grid${sections.length > 1 ? " has-rail" : ""}`}>
          <div className="mu-sheet">
            {lyrics.map((item, i) =>
              item.t === "gap" ? (
                <div className="mu-sheet-gap" key={i} aria-hidden />
              ) : item.t === "dir" ? (
                <p className="mu-sheet-dir" key={i} id={`sec-${i}`}>
                  {item.s}
                </p>
              ) : (
                <p className="mu-sheet-ln" key={i}>
                  {item.s}
                </p>
              ),
            )}
          </div>
          {sections.length > 1 && (
            <nav className="mu-structure" aria-label={`${track.title} structure`}>
              <p className="mu-structure-h" aria-hidden>
                STRUCTURE
              </p>
              <ol>
                {sections.map((s) => (
                  <li key={s.idx}>
                    <button
                      type="button"
                      className="mu-structure-btn"
                      onClick={() => {
                        const el = document.getElementById(`sec-${s.idx}`);
                        el?.scrollIntoView({
                          behavior: reduced ? "auto" : "smooth",
                          block: "center",
                        });
                      }}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      </section>

      {arc && (
        <aside className="mu-arc">
          <span className="mu-arc-tag">IN THE SERIAL</span>
          <p>{arc}</p>
          <Link href="/serial" className="mu-arc-link">
            READ THE SERIAL →
          </Link>
        </aside>
      )}

      <nav className="mu-reel-nav" aria-label="Adjacent tracks">
        {prev ? (
          <Link href={`/music/${prev.slug}`} className="mu-reel-nav-a prev">
            <span className="dirn">← PREV · REEL {padN(prev.n)}</span>
            <span className="ttl">{prev.title}</span>
          </Link>
        ) : (
          <span className="mu-reel-nav-a is-edge" aria-hidden>
            <span className="dirn">SIDE A BEGINS</span>
            <span className="ttl">—</span>
          </span>
        )}
        {next ? (
          <Link href={`/music/${next.slug}`} className="mu-reel-nav-a next">
            <span className="dirn">NEXT · REEL {padN(next.n)} →</span>
            <span className="ttl">{next.title}</span>
          </Link>
        ) : (
          <span className="mu-reel-nav-a is-edge next" aria-hidden>
            <span className="dirn">SIDE B ENDS</span>
            <span className="ttl">—</span>
          </span>
        )}
      </nav>
    </div>
  );
}
