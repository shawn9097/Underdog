"use client";

import { Fragment } from "react";
import Link from "next/link";
import { BRAND, LINKS, SOCIALS, TRACKS } from "@/lib/album";
import Countdown from "./Countdown";
import { Seam, WallVein } from "./Kintsugi";
import Trace from "./Trace";
import { padN, seedFor, styleChips } from "./data";
import { useMusic, useReducedMotion } from "./state";

/** One seed standing for the whole record — the album's collective signal. */
const ALBUM_SEED = TRACKS.reduce((s, t) => (s + seedFor(t)) >>> 0, 0x7a1b);

/**
 * THE MUSIC ROOM — the full experience. The city's listening room:
 * fourteen master reels racked on the shelf, each carrying the oscilloscope
 * fingerprint it has had since the pirate-console days.
 *
 * Entrance reveals are CSS-driven (see .mu-reveal in music.css): they default
 * to fully visible and cannot freeze under React StrictMode's double-invoke —
 * unlike gsap.from, whose staggered targets could stick mid-fade.
 */
export default function MusicHome() {
  const { gate, vault, tenant, playable, current, playing, play } = useMusic();
  const armed = vault !== "idle";
  const reduced = useReducedMotion();

  const preRelease = gate.phase === "open" && gate.mode !== "released";

  return (
    <div className="mu-room">
      <WallVein className="mu-room-vein" />
      <div className="mu-room-glow" aria-hidden />

      {/* ---------------- hero ---------------- */}
      <header className="mu-hero">
        <p className="mu-eyebrow">
          {BRAND.artist.toUpperCase()} · THE MUSIC ROOM · {BRAND.label.toUpperCase()}
        </p>
        <h1 className="mu-lockup">
          <span>THRONE</span>
          <span className="mu-lockup-mid">
            <em>at the</em>
          </span>
          <span>BOTTOM</span>
        </h1>
        <p className="mu-hero-manifesto">
          &ldquo;{BRAND.manifesto}&rdquo;
        </p>

        <div className="mu-hero-meta">
          <span className="mu-chip-meta">14 MASTERS</span>
          <span className="mu-chip-meta">{BRAND.label.toUpperCase()}</span>
          <span className="mu-chip-meta">
            {preRelease ? `OUT ${BRAND.releaseDateDisplay}` : "OUT NOW"}
          </span>
          <AccessChip />
        </div>

        {preRelease && <Countdown compact />}

        <div className="mu-hero-ctas">
          <a className="mu-btn mu-btn-gold" href={LINKS.presave} target="_blank" rel="noopener">
            PRESAVE THE ALBUM ↗
          </a>
          <ul className="mu-socials mu-socials-row" aria-label="Underdog City elsewhere">
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a href={s.url} target="_blank" rel="noopener">
                  <span className="mu-socials-name">{s.name}</span>
                  <span className="mu-socials-handle">{s.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Ambient album-master signal — the record's collective fingerprint,
            behind the lockup, filling the hero's right field. Decorative. */}
        <div className="mu-hero-signal" aria-hidden>
          <span className="mu-hero-signal-tag">THRONE AT THE BOTTOM — MASTER SIGNAL ▪ 14 REELS</span>
          <Trace seed={ALBUM_SEED} reduced={reduced} label="the album master signal" />
        </div>
      </header>

      <Seam className="mu-seam mu-seam-wide" />

      {/* ---------------- vault status ---------------- */}
      {vault === "empty" && (
        <aside className="mu-vaultnote" role="status">
          <span className="mu-vaultnote-tag">
            {tenant ? "VAULT OPEN — EARLY ACCESS" : "VAULT OPEN"}
          </span>
          <p>
            <b>MASTERS INCOMING.</b> The vault answered the key — the shelves are racked,
            the reels are labeled, and the masters are still being carried down. The
            moment they land, every reel below lights up. Nothing here pretends to play.
          </p>
        </aside>
      )}
      {vault === "sealed" && (
        <aside className="mu-vaultnote is-sealed" role="status">
          <span className="mu-vaultnote-tag">DEV PREVIEW</span>
          <p>
            Page view unlocked with <code>?asif=released</code>. The vault itself still
            wants a claimed key — playback stays dark in preview.
          </p>
        </aside>
      )}
      {vault === "error" && (
        <aside className="mu-vaultnote is-down" role="status">
          <span className="mu-vaultnote-tag">THE VAULT ISN&rsquo;T ANSWERING</span>
          <p>
            The wire between the room and the vault dropped. Nothing is lost — the masters
            keep. Use <b>KNOCK AGAIN</b> on the deck below to try the door once more.
          </p>
        </aside>
      )}

      {/* ---------------- the shelf ---------------- */}
      <main className="mu-shelf" aria-label="Track list">
        <div className="mu-shelf-head">
          <h2>THE SHELF</h2>
          <span>
            14 REELS · SIDE A 01–07 · SIDE B 08–14
          </span>
        </div>

        <ol className="mu-shelf-list">
          {TRACKS.map((t) => {
            const canPlay = playable.includes(t.slug);
            const isCurrent = current === t.slug;
            const chipCount = styleChips(t).length;
            return (
              <Fragment key={t.slug}>
                {t.n === 8 && (
                  <li className="mu-shelf-flip" aria-hidden>
                    <span className="mu-shelf-flip-side">SIDE B</span>
                    <span className="mu-shelf-flip-rule" />
                    <span className="mu-shelf-flip-note">FLIP THE RECORD</span>
                  </li>
                )}
              <li className={`mu-shelf-row${isCurrent ? " is-current" : ""}`}>
                <span className="mu-shelf-n" aria-hidden>
                  {padN(t.n)}
                </span>
                <span className="mu-shelf-trace" aria-hidden>
                  <Trace
                    seed={seedFor(t)}
                    bpm={t.bpm}
                    live={isCurrent && playing}
                    reduced={reduced}
                    label={t.title}
                    compact
                  />
                </span>
                <Link href={`/music/${t.slug}`} className="mu-shelf-link">
                  <span className="mu-shelf-title">{t.title}</span>
                  <span className="mu-shelf-role">{t.role}</span>
                  <span className="mu-shelf-hook">&ldquo;{t.hook}&rdquo;</span>
                </Link>
                <span className="mu-shelf-meta" aria-hidden>
                  <span>{t.bpm ? `${t.bpm} BPM` : "BPM UNLOGGED"}</span>
                  <span>{padN(chipCount)} COMPONENTS</span>
                </span>
                {canPlay ? (
                  <button
                    type="button"
                    className={`mu-playbtn${isCurrent && playing ? " is-on" : ""}`}
                    onClick={() => play(t.slug)}
                    aria-label={isCurrent && playing ? `Pause ${t.title}` : `Play ${t.title}`}
                  >
                    {isCurrent && playing ? "❚❚" : "▶"}
                  </button>
                ) : !armed ? (
                  <button
                    type="button"
                    className="mu-playbtn mu-playbtn-listen"
                    onClick={() => play(t.slug)}
                    aria-label={`Open the vault and play ${t.title}`}
                    title="Open the vault"
                  >
                    ▶
                  </button>
                ) : vault === "opening" ? (
                  <span className="mu-incoming" aria-label="Opening the vault">
                    <span aria-hidden>◍</span> OPENING
                  </span>
                ) : (
                  <span
                    className="mu-incoming"
                    title="Masters incoming — the vault is being filled"
                  >
                    <span aria-hidden>◌</span> INCOMING
                  </span>
                )}
              </li>
              </Fragment>
            );
          })}
        </ol>
      </main>

      {/* ---------------- footer ---------------- */}
      <footer className="mu-room-foot">
        <Seam className="mu-seam mu-seam-wide" />
        <p className="mu-room-foot-rule">
          There&rsquo;s only one rule in Underdog City: <b>turn that shit up loud.</b>
        </p>
        <p className="mu-room-foot-label">
          {BRAND.album.toUpperCase()} ▪ {BRAND.artist.toUpperCase()} ▪{" "}
          {BRAND.label.toUpperCase()} ▪ {BRAND.releaseDateDisplay}
        </p>
      </footer>
    </div>
  );
}

function AccessChip() {
  const { gate, tenant } = useMusic();
  if (gate.phase !== "open") return null;
  if (gate.mode === "released") {
    return <span className="mu-chip-meta is-open">THE DOOR IS OPEN</span>;
  }
  if (gate.mode === "tenant" && tenant) {
    return (
      <span className="mu-chip-meta is-tenant">
        TENANT №{String(tenant.tenantNumber).padStart(4, "0")} — {tenant.alias.toUpperCase()} — KEYED IN
      </span>
    );
  }
  return <span className="mu-chip-meta is-preview">DEV PREVIEW PASS</span>;
}
