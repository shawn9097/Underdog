"use client";

/**
 * THE SERIAL — the front page of the living story.
 *
 * The chapter ladder from CHAPTERS in @/lib/album: Chapter 0 is LIVE and
 * inviting; chapters 1–5 hang below it sealed in kintsugi wax. No dates, no
 * countdowns — the forthcoming chapters are honestly "unwritten". All story
 * copy (teasers, hooks, arcs) is read verbatim from the canon data layer.
 */

import "./index.css";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BRAND, CHAPTERS, TRACKS, TRACK_ARCS, type Chapter } from "@/lib/album";
import WaxSeal from "./WaxSeal";
import { readChapterProgress } from "./progressStore";

const pad = (n: number) => String(n).padStart(2, "0");
const trackOf = (slug?: string) => TRACKS.find((t) => t.slug === slug);

// "The Old Song" — its hook is the canon source for "the unwritten".
const OLD_SONG = TRACKS[8];

function SealedRow({ chapter }: { chapter: Chapter }) {
  const track = trackOf(chapter.trackSlug);
  // Hidden easter egg: cracking the wax lets the scoring track bleed through.
  // The chapter stays sealed — only its music leaks. Verbatim canon hook.
  const [cracked, setCracked] = useState(false);
  return (
    <li className="si-row si-row-sealed" data-reveal>
      <article className="si-sealed">
        <span className="si-folio" aria-hidden="true">
          {pad(chapter.n)}
        </span>
        <div className="si-seal-holder">
          <button
            type="button"
            className="si-seal-btn"
            data-cracked={cracked ? "1" : undefined}
            aria-pressed={cracked}
            aria-label={
              cracked
                ? `Reseal Chapter ${chapter.n}`
                : `Crack the wax on Chapter ${chapter.n} — let the track that scores it bleed through`
            }
            onClick={() => setCracked((v) => !v)}
          >
            <WaxSeal className="si-seal" />
          </button>
        </div>
        <div className="si-sealed-body">
          <header className="si-row-head">
            <span className="si-num">CH {pad(chapter.n)}</span>
            <span className="si-sealed-status">
              {cracked ? "SEAL CRACKED · STILL UNWRITTEN" : "SEALED · UNWRITTEN"}
            </span>
          </header>
          <h3 className="si-sealed-title">{chapter.title.toUpperCase()}</h3>
          <p className="si-sealed-teaser">{chapter.teaser}</p>
          {track && cracked && (
            <p className="si-whisper" role="note">
              <span className="si-whisper-q">“{track.hook}”</span>
              <span className="si-whisper-cite">
                — {track.title.toUpperCase()} bleeds through the wax
              </span>
            </p>
          )}
          {track && (
            <p className="si-sealed-meta">
              <span className="si-meta-k">TO BE SCORED BY</span>
              <Link
                className="si-tracklink"
                href={`/music/${track.slug}`}
                prefetch={false}
              >
                TRACK {pad(track.n)} — {track.title.toUpperCase()} ↗
              </Link>
            </p>
          )}
        </div>
      </article>
    </li>
  );
}

export default function SerialIndex() {
  const rootRef = useRef<HTMLElement>(null);
  const veinRef = useRef<HTMLDivElement>(null);
  const [liveCta, setLiveCta] = useState<{ label: string; f: number | null }>({
    label: "BEGIN READING",
    f: null,
  });

  const live = CHAPTERS.find((c) => c.status === "live");
  const sealed = CHAPTERS.filter((c) => c.status === "forthcoming");
  const liveTrack = trackOf(live?.trackSlug);
  const liveArc = live?.trackSlug ? TRACK_ARCS[live.trackSlug] : undefined;

  // Resume state for the live chapter (localStorage, after mount only).
  useEffect(() => {
    if (!live) return;
    const p = readChapterProgress(live.slug);
    if (!p) return;
    if (p.f >= 0.97) setLiveCta({ label: "READ IT AGAIN", f: 1 });
    else if (p.f > 0.04)
      setLiveCta({ label: `RESUME — ${Math.round(p.f * 100)}%`, f: p.f });
  }, [live]);

  // Scroll reveals: hidden states only exist once JS marks the root, so the
  // page is fully readable with JS off or reduced motion on.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.dataset.anim = "1";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "1";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // The kintsugi vein inks itself as the ladder scrolls through the viewport:
  // gold pours from the top and its molten tip rides the reader's progress.
  useEffect(() => {
    const vein = veinRef.current;
    if (!vein) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = vein.getBoundingClientRect();
      // Fraction of the vein that has passed a reading line ~62% down the view.
      const line = window.innerHeight * 0.62;
      const f = clamp01((line - rect.top) / Math.max(1, rect.height));
      vein.style.setProperty("--si-ink", f.toFixed(4));
      vein.style.setProperty("--si-ink-tip", f > 0.003 && f < 0.997 ? "1" : "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <main className="si" ref={rootRef}>
      <div className="si-atmo" aria-hidden="true" />
      <div className="si-grain" aria-hidden="true" />

      <header className="si-head">
        <p className="si-kicker" data-reveal>
          UNDERDOG CITY · SEASON ONE · WEB SERIAL
        </p>
        <h1 className="si-title" data-reveal>
          THE SERIAL
        </h1>
        <p className="si-lede" data-reveal>
          The story of the masked one — the most thrown-away person in the
          city. Dropped by the Halo. Dead at the bottom. Back wrong. Told
          chapter by chapter, each one scored by a track from{" "}
          <em>{BRAND.album}</em>.
        </p>
        <blockquote className="si-thesis" data-reveal>
          “{BRAND.thesis}”
        </blockquote>
      </header>

      <section className="si-ladder-wrap" aria-label="The chapter ladder">
        <div className="si-vein" ref={veinRef} aria-hidden="true">
          <div className="si-vein-ink" />
          <div className="si-vein-tip" />
        </div>
        <ol className="si-ladder">
          {live && (
            <li className="si-row si-row-live" data-reveal>
              <article className="si-live">
                <span className="si-folio si-folio-live" aria-hidden="true">
                  {pad(live.n)}
                </span>
                <header className="si-row-head">
                  <span className="si-num">CH {pad(live.n)}</span>
                  <span className="si-live-badge">
                    <i aria-hidden="true" />
                    LIVE
                  </span>
                </header>
                <h2 className="si-live-title">{live.title.toUpperCase()}</h2>
                <p className="si-live-teaser">“{live.teaser}”</p>
                <p className="si-live-cta">
                  <span className="si-live-read">
                    {liveCta.label} <span aria-hidden="true">→</span>
                  </span>
                  {liveCta.f !== null && liveCta.f < 1 && (
                    <span className="si-live-bar" aria-hidden="true">
                      <span
                        className="si-live-bar-fill"
                        style={{ width: `${Math.round(liveCta.f * 100)}%` }}
                      />
                    </span>
                  )}
                </p>
                <footer className="si-live-meta">
                  <span className="si-meta-k">SCORED BY</span>
                  {liveTrack && (
                    <Link
                      className="si-tracklink"
                      href={`/music/${liveTrack.slug}`}
                      prefetch={false}
                    >
                      TRACK {pad(liveTrack.n)} — {liveTrack.title.toUpperCase()} ↗
                    </Link>
                  )}
                  {liveArc && <span className="si-arc">{liveArc}</span>}
                </footer>
                <Link
                  className="si-stretch"
                  href={`/serial/${live.slug}`}
                  aria-label={`Read Chapter ${live.n} — ${live.title}`}
                />
              </article>
            </li>
          )}

          <li className="si-row si-row-divider" data-reveal aria-hidden="true">
            <div className="si-unwritten">
              <p className="si-unwritten-quote">“{OLD_SONG.hook}”</p>
              <p className="si-unwritten-cite">
                {OLD_SONG.title.toUpperCase()} · TRACK {pad(OLD_SONG.n)}
              </p>
            </div>
          </li>

          {sealed.map((c) => (
            <SealedRow chapter={c} key={c.slug} />
          ))}
        </ol>
      </section>

      <footer className="si-foot" data-reveal>
        <p className="si-foot-k">NO DATES · NO COUNTDOWNS · THE INK IS STILL WET</p>
        <p className="si-foot-hook">{BRAND.emailHook}</p>
        <p className="si-foot-note">
          When a chapter unseals, tenants hear the bell first.
        </p>
        <nav className="si-foot-links" aria-label="Serial exits">
          <Link className="si-foot-link" href="/community" prefetch={false}>
            claim your key →
          </Link>
          {live && (
            <Link className="si-foot-link" href={`/serial/${live.slug}`}>
              read chapter {pad(live.n)} →
            </Link>
          )}
        </nav>
      </footer>
    </main>
  );
}
