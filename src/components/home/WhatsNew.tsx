"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { BRAND, CHAPTERS, msUntilRelease } from "@/lib/album";
import { fetchTenantCount } from "@/lib/backend";
import { MONO, SERIF_IT, SHOULDERS, TEKTUR } from "./voices";

/**
 * WHAT'S NEW — the reason to come back next week.
 * (a) latest live chapter, (b) live countdown to the album,
 * (c) live tenant count from the real ledger (Supabase).
 * Countdown + count both render after mount; no SSR/client divergence.
 */

const latest = CHAPTERS.filter((c) => c.status === "live").reduce((a, b) =>
  b.n > a.n ? b : a
);

const CTA_CLASS =
  "mt-4 inline-flex min-h-[40px] items-center gap-1 text-[0.62rem] tracking-[0.26em] text-[var(--gold-dim)] transition-colors duration-200 hover:text-[var(--gold-hot)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-hot)]";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.56rem] tracking-[0.4em] text-[#57505f]" style={MONO}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------ latest chapter */

function LatestChapter() {
  return (
    <article className="rise-in">
      <Label>
        LATEST CHAPTER ·{" "}
        <span className="text-[var(--blood-bright)]">
          <span
            aria-hidden="true"
            className="udc-live mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--blood-bright)] align-middle"
          />
          LIVE
        </span>
      </Label>
      <h3
        className="mt-4 text-xl tracking-[0.12em] text-[var(--bone)] sm:text-2xl"
        style={SHOULDERS}
      >
        CH {latest.n} — {latest.title.toUpperCase()}
      </h3>
      <blockquote
        className="mt-3 max-w-sm text-balance text-[0.98rem] leading-relaxed text-[#a9a2b3]"
        style={SERIF_IT}
      >
        &ldquo;{latest.teaser}&rdquo;
      </blockquote>
      <Link
        href={`/serial/${latest.slug}`}
        prefetch={false}
        className={CTA_CLASS}
        style={MONO}
      >
        READ CHAPTER {latest.n}{" "}
        <span aria-hidden="true" className="inline-block">
          →
        </span>
      </Link>
    </article>
  );
}

/* ----------------------------------------------------------- countdown */

interface Parts {
  d: string;
  h: string;
  m: string;
  s: string;
  out: boolean;
}

function compute(): Parts {
  const ms = msUntilRelease(Date.now());
  if (ms <= 0) return { d: "00", h: "00", m: "00", s: "00", out: true };
  const t = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    d: pad(Math.floor(t / 86400)),
    h: pad(Math.floor((t % 86400) / 3600)),
    m: pad(Math.floor((t % 3600) / 60)),
    s: pad(t % 60),
    out: false,
  };
}

function AlbumCountdown() {
  const [p, setP] = useState<Parts | null>(null);
  const secRef = useRef<HTMLSpanElement>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setP(compute());
    const id = setInterval(() => setP(compute()), 1000);
    return () => clearInterval(id);
  }, []);

  // each second the seconds cell gilds for a beat — the clock is alive
  useEffect(() => {
    if (!p || p.out || reducedRef.current || !secRef.current) return;
    const tween = gsap.fromTo(
      secRef.current,
      { color: "#ffe9a8", textShadow: "0 0 16px rgba(245,200,76,0.8)" },
      {
        color: "#f5c84c",
        textShadow: "0 0 0px rgba(245,200,76,0)",
        duration: 0.55,
        ease: "power2.out",
      }
    );
    return () => {
      tween.kill();
    };
  }, [p]);

  const cells: [string, string, boolean][] = [
    [p?.d ?? "--", "DAYS", false],
    [p?.h ?? "--", "HRS", false],
    [p?.m ?? "--", "MIN", false],
    [p?.s ?? "--", "SEC", true],
  ];

  return (
    <article className="rise-in">
      <Label>THE ALBUM</Label>
      <h3
        className="mt-4 text-xl tracking-[0.12em] text-[var(--bone)] sm:text-2xl"
        style={SHOULDERS}
      >
        {BRAND.album.toUpperCase()}
      </h3>
      {p?.out ? (
        <p
          role="status"
          className="mt-4 text-[0.7rem] tracking-[0.32em] text-[var(--gold-hot)]"
          style={MONO}
        >
          OUT NOW ON {BRAND.label.toUpperCase()}
        </p>
      ) : (
        <div
          className="mt-3 flex items-start gap-2 sm:gap-2.5"
          role="timer"
          aria-label={`Countdown to album release on ${BRAND.releaseDateDisplay}`}
        >
          {cells.map(([v, l, isSec], i) => (
            <div key={l} className="flex items-start gap-2 sm:gap-2.5">
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  className="text-[1.5rem] leading-none text-[#39323f]"
                  style={TEKTUR}
                >
                  :
                </span>
              ) : null}
              <div>
                <span
                  ref={isSec ? secRef : undefined}
                  className="block text-[1.7rem] leading-none text-[var(--gold-hot)] tabular-nums sm:text-[1.9rem]"
                  style={TEKTUR}
                >
                  {v}
                </span>
                <span
                  className="mt-1.5 block text-[0.5rem] tracking-[0.3em] text-[#57505f]"
                  style={MONO}
                >
                  {l}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p
        className="mt-3 text-[0.56rem] tracking-[0.26em] text-[#8a8494]"
        style={MONO}
      >
        OUT {BRAND.releaseDateDisplay} · {BRAND.label.toUpperCase()}
      </p>
      <Link href="/music" prefetch={false} className={CTA_CLASS} style={MONO}>
        HEAR THE MUSIC{" "}
        <span aria-hidden="true" className="inline-block">
          →
        </span>
      </Link>
    </article>
  );
}

/* --------------------------------------------------------- the tenants */

type TenantState =
  | { s: "loading" }
  | { s: "ok"; n: number }
  | { s: "open" };

function Tenants({ initialCount }: { initialCount: number | null }) {
  // Seed from the server read when we have it — the number paints instantly
  // and the browser makes no cross-origin call. Only fetch after mount when
  // the server handed us nothing (its read was slow or unreachable).
  const [state, setState] = useState<TenantState>(
    initialCount != null ? { s: "ok", n: initialCount } : { s: "loading" }
  );

  useEffect(() => {
    if (initialCount != null) return;
    let on = true;
    fetchTenantCount()
      .then((n) => {
        if (!on) return;
        const num = Number(n);
        setState(
          Number.isFinite(num) && num > 0 ? { s: "ok", n: num } : { s: "open" }
        );
      })
      .catch(() => {
        if (on) setState({ s: "open" });
      });
    return () => {
      on = false;
    };
  }, [initialCount]);

  return (
    <article className="rise-in">
      <Label>THE TENANTS</Label>
      <div aria-live="polite" className="mt-4 min-h-[4.6rem]">
        {state.s === "loading" ? (
          <p
            className="text-[0.62rem] tracking-[0.3em] text-[#57505f]"
            style={MONO}
          >
            COUNTING THE KEYS&hellip;
          </p>
        ) : null}
        {state.s === "ok" ? (
          <>
            <p
              className="text-[1.9rem] leading-none text-[var(--neon-cyan)] tabular-nums"
              style={TEKTUR}
            >
              {state.n.toLocaleString("en-US")}
            </p>
            <p
              className="mt-2 text-[0.56rem] tracking-[0.3em] text-[#8a8494]"
              style={MONO}
            >
              {state.n === 1 ? "TENANT HOLDS A KEY" : "TENANTS HOLD KEYS"}
            </p>
          </>
        ) : null}
        {state.s === "open" ? (
          <p
            className="max-w-xs text-balance text-[0.98rem] leading-relaxed text-[#a9a2b3]"
            style={SERIF_IT}
          >
            The ledger is open — be the first tenant.
          </p>
        ) : null}
      </div>
      <p
        className="mt-3 max-w-xs text-[0.56rem] leading-relaxed tracking-[0.22em] text-[#8a8494]"
        style={MONO}
      >
        {BRAND.emailHook.toUpperCase()}
      </p>
      <Link
        href="/community"
        prefetch={false}
        className={CTA_CLASS}
        style={MONO}
      >
        CLAIM YOUR KEY{" "}
        <span aria-hidden="true" className="inline-block">
          →
        </span>
      </Link>
    </article>
  );
}

/* -------------------------------------------------------------- strip */

export default function WhatsNew({
  initialTenantCount,
}: {
  initialTenantCount: number | null;
}) {
  return (
    <section
      aria-label="What's new in the city"
      className="relative border-y border-[#1a171f] bg-[rgba(14,12,17,0.55)] px-5 py-14 sm:px-8 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <header className="rise-in flex items-center gap-3">
          <span
            aria-hidden="true"
            className="udc-live h-1.5 w-1.5 rounded-full bg-[var(--gold-hot)]"
          />
          <h2
            className="text-[0.66rem] tracking-[0.5em] text-[#8a8494]"
            style={MONO}
          >
            WHAT&rsquo;S NEW IN THE CITY
          </h2>
        </header>
        <div className="mt-9 grid gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          <LatestChapter />
          <AlbumCountdown />
          <Tenants initialCount={initialTenantCount} />
        </div>
      </div>
    </section>
  );
}
