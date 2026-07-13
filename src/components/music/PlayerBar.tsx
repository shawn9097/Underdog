"use client";

import { useMemo } from "react";
import { trackBySlug, fmtTime, padN } from "./data";
import { useMusic } from "./state";

/**
 * PLAYBACK DECK — the persistent now-playing console + vault status strip.
 *
 * The vault is opened only on intent: idle shows an "OPEN THE VAULT" control
 * (or the reel play-buttons act as intent). When the masters bucket is empty
 * it says so honestly instead of faking a player; a network failure surfaces
 * as an inline "vault isn't answering" with a retry — the visitor stays in the
 * room. The left inset houses the DISTRICT MAP switch (CityNav) as deck hardware.
 */
export default function PlayerBar() {
  const {
    gate,
    vault,
    tenant,
    playable,
    current,
    playing,
    time,
    duration,
    toggle,
    seek,
    next,
    prev,
    openVault,
    retryVault,
  } = useMusic();

  const track = current ? trackBySlug(current) : undefined;
  const hasDeck = vault === "ready" && playable.length > 0;
  const mode = gate.phase === "open" ? gate.mode : "tenant";

  const status = useMemo(() => {
    if (hasDeck) {
      if (!track) return { tag: "DECK ARMED", note: "SELECT A REEL" };
      return { tag: `REEL ${padN(track.n)}`, note: track.title.toUpperCase() };
    }
    switch (vault) {
      case "opening":
        return { tag: "VAULT", note: "TURNING THE KEY…" };
      case "empty":
        return { tag: "MASTERS INCOMING", note: "THE VAULT IS BEING FILLED" };
      case "sealed":
        return { tag: "PREVIEW PASS", note: "THE ROOM, NOT THE REELS" };
      case "error":
        return { tag: "VAULT", note: "NOT ANSWERING" };
      default:
        return {
          tag:
            mode === "released"
              ? "THE DOOR IS OPEN"
              : mode === "preview"
                ? "DEV PREVIEW"
                : "EARLY ACCESS",
          note: "THE VAULT IS SEALED",
        };
    }
  }, [hasDeck, vault, track, mode]);

  return (
    <div className="mu-deck" role="region" aria-label="Playback deck">
      <div className="mu-deck-inner">
        <div className="mu-deck-navslot" aria-hidden>
          <span>DISTRICT</span>
          <span>SWITCH</span>
        </div>

        <div className="mu-deck-status">
          <span className="mu-deck-tag">{status.tag}</span>
          <span className="mu-deck-note">{status.note}</span>
        </div>

        {hasDeck ? (
          <>
            <div className="mu-deck-transport">
              <button
                type="button"
                className="mu-deck-btn"
                onClick={prev}
                aria-label="Previous track"
                disabled={playable.length < 2}
              >
                ⏮
              </button>
              <button
                type="button"
                className="mu-deck-btn mu-deck-play"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                disabled={!current}
              >
                {playing ? "❚❚" : "▶"}
              </button>
              <button
                type="button"
                className="mu-deck-btn"
                onClick={next}
                aria-label="Next track"
                disabled={playable.length < 2}
              >
                ⏭
              </button>
            </div>

            <div className="mu-deck-seek">
              <span className="mu-deck-time" aria-hidden>
                {fmtTime(time)}
              </span>
              <input
                type="range"
                className="mu-deck-range"
                min={0}
                max={duration > 0 ? duration : 1}
                step={0.5}
                value={Math.min(time, duration > 0 ? duration : 1)}
                onChange={(e) => seek(Number(e.target.value))}
                disabled={!current || duration <= 0}
                aria-label="Seek position in track"
              />
              <span className="mu-deck-time" aria-hidden>
                {duration > 0 ? fmtTime(duration) : "--:--"}
              </span>
            </div>
          </>
        ) : (
          <div className="mu-deck-action">
            {vault === "idle" && (
              <>
                <button
                  type="button"
                  className="mu-btn mu-btn-gold mu-deck-open"
                  onClick={openVault}
                >
                  ▶ OPEN THE VAULT
                </button>
                <span className="mu-deck-hint">
                  {tenant
                    ? "Early access — your key opens it on-site before release."
                    : mode === "released"
                      ? "Signed reels, straight from the masters vault."
                      : "Dev preview — the room, not the reels."}
                </span>
              </>
            )}
            {vault === "opening" && <span className="mu-deck-hint">Reaching the vault…</span>}
            {vault === "empty" && (
              <span className="mu-deck-hint">
                No fake needles here — playback lights up the moment the masters land.
              </span>
            )}
            {vault === "sealed" && (
              <span className="mu-deck-hint">
                Dev preview shows the room. Playback needs a claimed key.
              </span>
            )}
            {vault === "error" && (
              <>
                <button
                  type="button"
                  className="mu-btn mu-btn-ghost mu-deck-open"
                  onClick={retryVault}
                >
                  KNOCK AGAIN
                </button>
                <span className="mu-deck-hint">The wire to the vault dropped. The masters keep.</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
