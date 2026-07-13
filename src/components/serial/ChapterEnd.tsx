"use client";

/**
 * End-of-chapter chrome, rendered after the finale title card:
 * the open thread (the season mystery this chapter seeds), what's next,
 * the scored track, and the exits back into the city. All story copy is
 * read verbatim from CHAPTERS / TRACKS / TRACK_ARCS — never re-typed.
 */

import Link from "next/link";
import { CHAPTERS, TRACKS, TRACK_ARCS } from "@/lib/album";

const pad = (n: number) => String(n).padStart(2, "0");

export default function ChapterEnd({
  slug,
  hookSlug,
}: {
  slug: string;
  hookSlug?: string;
}) {
  const chapter = CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) return null;
  const next = CHAPTERS.find((c) => c.n === chapter.n + 1);
  const hook = hookSlug ? CHAPTERS.find((c) => c.slug === hookSlug) : undefined;
  const track = chapter.trackSlug
    ? TRACKS.find((t) => t.slug === chapter.trackSlug)
    : undefined;
  const arc = chapter.trackSlug ? TRACK_ARCS[chapter.trackSlug] : undefined;

  return (
    <section className="pl-end" aria-label={`End of chapter ${chapter.n}`}>
      <p className="pl-end-rule" data-reveal>
        <span aria-hidden="true">✦</span> END OF CHAPTER {pad(chapter.n)}{" "}
        <span aria-hidden="true">✦</span>
      </p>

      {hook && (
        <div className="pl-end-hook" data-reveal>
          <p className="pl-end-k">
            THE OPEN THREAD · CH {pad(hook.n)} — {hook.title.toUpperCase()}
          </p>
          <p className="pl-end-hooktext">{hook.teaser}</p>
        </div>
      )}

      <div className="pl-end-grid" data-reveal>
        {next && (
          <div className="pl-end-cell">
            <p className="pl-end-k">NEXT</p>
            <p className="pl-end-big">
              CH {pad(next.n)} — {next.title.toUpperCase()}
            </p>
            <p className="pl-end-note">forthcoming — the ink is still wet</p>
          </div>
        )}
        {track && (
          <div className="pl-end-cell">
            <p className="pl-end-k">SCORED BY</p>
            <p className="pl-end-big">
              <Link
                href={`/music/${track.slug}`}
                prefetch={false}
                className="pl-end-tracklink"
              >
                TRACK {pad(track.n)} — {track.title.toUpperCase()} ↗
              </Link>
            </p>
            {arc && <p className="pl-end-note">{arc}</p>}
          </div>
        )}
      </div>

      <nav className="pl-exits" data-reveal aria-label="Continue through Underdog City">
        <Link className="pl-exit" href="/serial">
          ← the serial index
        </Link>
        <Link className="pl-exit" href="/community" prefetch={false}>
          claim your key — tenants hear the bell first →
        </Link>
      </nav>
    </section>
  );
}
