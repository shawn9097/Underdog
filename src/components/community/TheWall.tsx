"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  fetchPosts,
  fetchWall,
  type WallEntry,
  type WallPost,
} from "@/lib/backend";
import { type Claim, formatIssued, formatTenantNo } from "./ritual";
import Compose from "./Compose";

interface Props {
  claim: Claim | null;
  /** Live tenant count, owned by the parent (shared with the arrival). */
  count: number | null;
  /** Bumped by the parent after a claim so the roster refetches. */
  refreshToken: number;
  /** Server-seeded roster + marks so nothing fetches on a passive load. */
  initialWall: WallEntry[];
  initialPosts: WallPost[];
  /** True when the server couldn't reach the roster — show it honestly. */
  seedError: boolean;
  reducedMotion: boolean;
}

type Status = "loading" | "ready" | "error";

function relTime(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.floor((now - t) / 1000));
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatIssued(iso);
}

/** Newest tenants first — the freshest name presides over the wall. */
function sortWall(rows: WallEntry[]): WallEntry[] {
  return [...rows].sort((a, b) => b.tenant_number - a.tenant_number);
}

export default function TheWall({
  claim,
  count,
  refreshToken,
  initialWall,
  initialPosts,
  seedError,
  reducedMotion,
}: Props) {
  const [status, setStatus] = useState<Status>(seedError ? "error" : "ready");
  const [wall, setWall] = useState<WallEntry[]>(() => sortWall(initialWall));
  const [posts, setPosts] = useState<WallPost[]>(initialPosts);
  const [now, setNow] = useState<number>(0);
  const loadedRef = useRef(!seedError);
  const rosterRef = useRef<HTMLUListElement>(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  /* the wall comes alive: the roster gilds itself into view, plaque by plaque */
  useEffect(() => {
    if (reducedMotion) return;
    const ul = rosterRef.current;
    if (!ul || revealedRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !revealedRef.current) {
            revealedRef.current = true;
            const items = ul.querySelectorAll(":scope > li");
            gsap.from(items, {
              autoAlpha: 0,
              y: 20,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.05,
              clearProps: "opacity,visibility,transform",
            });
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(ul);
    return () => io.disconnect();
  }, [reducedMotion, status]);

  /*
   * Refetch only after an interaction (a claim bumps refreshToken). The
   * roster is server-seeded, so nothing touches the network on passive load.
   */
  useEffect(() => {
    if (refreshToken === 0) return;
    let cancelled = false;
    (async () => {
      const [w, p] = await Promise.allSettled([fetchWall(), fetchPosts()]);
      if (cancelled) return;
      if (w.status === "fulfilled") {
        setWall(sortWall(w.value));
        loadedRef.current = true;
        setStatus("ready");
      } else if (!loadedRef.current) {
        setStatus("error");
      }
      if (p.status === "fulfilled") setPosts(p.value);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const onPosted = (post: WallPost) => setPosts((prev) => [post, ...prev]);

  const isTenant = claim !== null;
  const mine = claim?.tenantNumber;

  /*
   * Fold the caller's own claim into the roster so their name shows the
   * instant it is issued, even before the post-claim refetch resolves.
   */
  const displayWall = useMemo(() => {
    if (!claim) return wall;
    if (wall.some((t) => t.tenant_number === claim.tenantNumber)) return wall;
    return sortWall([
      {
        tenant_number: claim.tenantNumber,
        alias: claim.alias,
        deed_id: claim.deedId,
        depth: claim.depth,
        created_at: claim.issuedISO,
      },
      ...wall,
    ]);
  }, [wall, claim]);

  const empty = status === "ready" && displayWall.length === 0;
  const marksToShow = useMemo(() => posts.slice(0, 40), [posts]);

  /*
   * "Now Accepting Tenants" — while the roster is young, show vacant niches
   * so the wall reads as a living ledger with room, never an empty box. They
   * taper away as real names fill in.
   */
  const vacancies = useMemo(() => {
    const n = displayWall.length;
    if (n === 0) return 0; // the true-empty state has its own invitation
    return Math.max(0, Math.min(6, 9 - n));
  }, [displayWall.length]);

  return (
    <section
      id="wall"
      aria-labelledby="wall-heading"
      className="relative mx-auto flex w-full max-w-6xl scroll-mt-20 flex-col items-center px-4 pb-24"
    >
      <style>{`@keyframes ucWallGlint{0%{transform:translateX(-140%)}55%{transform:translateX(320%)}100%{transform:translateX(320%)}}`}</style>

      {/* heading */}
      <div className="flex flex-col items-center text-center">
        <p
          className="text-[0.6rem] tracking-[0.4em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
        >
          THE ROSTER OF THE UNDERDOGS
        </p>
        <h2
          id="wall-heading"
          className="mt-4 text-[2.2rem] leading-none tracking-[0.04em] sm:text-5xl"
          style={{ fontFamily: "var(--font-gloock)", color: "#e8e2d6" }}
        >
          THE{" "}
          <span
            style={{
              background: "linear-gradient(180deg, #ffe9a8, #d4a72c 65%, #8a6a1f)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            WALL
          </span>
        </h2>
        <p
          className="mt-4 flex items-baseline justify-center gap-2 text-[0.62rem] tracking-[0.3em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#8a8494" }}
        >
          <span aria-hidden style={{ color: "#8a6a1f" }}>
            №
          </span>
          <span
            aria-live="polite"
            className="text-xl tracking-[0.04em]"
            style={{ fontFamily: "var(--font-italiana)", color: "#f5c84c" }}
          >
            {count === null ? "—" : count.toLocaleString()}
          </span>
          <span>{count === 1 ? "NAME DOWN HERE" : "NAMES DOWN HERE"}</span>
        </p>
      </div>

      {/* the wall panel */}
      <div
        className="relative mt-10 w-full overflow-hidden border"
        style={{
          borderColor: "rgba(212,167,44,0.22)",
          background:
            "radial-gradient(120% 80% at 50% 0%, #14111a 0%, #0a080d 55%, #070609 100%)",
          boxShadow: "inset 0 1px 0 rgba(244,246,248,0.04), inset 0 0 90px rgba(0,0,0,0.6)",
        }}
      >
        {/* stone grain — the wall is poured concrete and obsidian, not a table */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "140px 140px",
            opacity: 0.045,
            mixBlendMode: "overlay",
          }}
        />

        {/* kintsugi seam overlay — the wall is cracked and gilded */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.5]"
          preserveAspectRatio="none"
          viewBox="0 0 400 300"
        >
          <path
            d="M0 62 L54 70 L96 58 L150 74 L206 60 L260 78 L320 64 L400 80"
            fill="none"
            stroke="#8a6a1f"
            strokeWidth="0.6"
            strokeOpacity="0.5"
          />
          <path
            d="M0 196 L60 188 L118 202 L176 190 L238 206 L300 192 L360 204 L400 196"
            fill="none"
            stroke="#8a6a1f"
            strokeWidth="0.6"
            strokeOpacity="0.4"
          />
          <path
            d="M132 0 L140 60 L128 120 L146 190 L134 300"
            fill="none"
            stroke="#8a6a1f"
            strokeWidth="0.5"
            strokeOpacity="0.35"
          />
          <path
            d="M286 0 L278 66 L292 130 L280 200 L290 300"
            fill="none"
            stroke="#8a6a1f"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
        </svg>

        <div className="relative p-4 sm:p-6">
          {status === "loading" && (
            <div
              className="flex min-h-[180px] items-center justify-center text-[0.66rem] tracking-[0.3em]"
              style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
            >
              READING THE WALL…
            </div>
          )}

          {status === "error" && (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-center">
              <p
                className="text-lg italic"
                style={{ fontFamily: "var(--font-crimson)", color: "#c9c2d0" }}
              >
                The wall is out of reach right now.
              </p>
              <p
                className="text-[0.62rem] tracking-[0.24em]"
                style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
              >
                THE NAMES ARE STILL DOWN HERE — TRY AGAIN IN A MOMENT
              </p>
            </div>
          )}

          {empty && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-5 px-4 text-center">
              <span aria-hidden className="block h-px w-40" style={{ background: "linear-gradient(90deg, transparent, #d4a72c, transparent)" }} />
              <p
                className="text-balance text-2xl italic leading-snug sm:text-3xl"
                style={{ fontFamily: "var(--font-crimson)", color: "#e8e2d6" }}
              >
                The wall is bare. Be the first name on it.
              </p>
              <p
                className="max-w-md text-balance text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-crimson)", color: "#8a8494" }}
              >
                No one has claimed a key yet. The first strike on the slab writes
                the first name into the stone.
              </p>
              {!isTenant && (
                <a
                  href="#rite"
                  className="mt-1 inline-flex min-h-12 items-center justify-center border px-8 text-[0.68rem] tracking-[0.3em] transition-colors focus-visible:ring-2 focus-visible:ring-[#f5c84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a080d]"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    borderColor: "#d4a72c",
                    color: "#060507",
                    background: "linear-gradient(180deg, #f5c84c 0%, #d4a72c 100%)",
                  }}
                >
                  CLAIM THE FIRST KEY
                </a>
              )}
              <span aria-hidden className="block h-px w-40" style={{ background: "linear-gradient(90deg, transparent, #d4a72c, transparent)" }} />
            </div>
          )}

          {status === "ready" && displayWall.length > 0 && (
            <ul
              ref={rosterRef}
              className="flex flex-wrap justify-center gap-3"
              aria-label="Tenants of Underdog City"
            >
              {displayWall.map((t, i) => {
                const isMine = mine === t.tenant_number;
                const fresh = i === 0;
                return (
                  <li
                    key={t.deed_id + t.tenant_number}
                    className="group relative flex w-[calc(50%-0.375rem)] flex-col justify-between overflow-hidden border px-4 py-4 sm:w-[184px]"
                    style={{
                      borderColor: isMine
                        ? "rgba(245,200,76,0.7)"
                        : fresh
                          ? "rgba(212,167,44,0.5)"
                          : "rgba(212,167,44,0.18)",
                      background: isMine
                        ? "linear-gradient(160deg, rgba(212,167,44,0.16), rgba(10,8,13,0.9))"
                        : "linear-gradient(160deg, rgba(26,23,31,0.9), rgba(10,8,13,0.92))",
                      boxShadow: isMine
                        ? "0 0 26px rgba(212,167,44,0.18), inset 0 0 0 1px rgba(245,200,76,0.15)"
                        : "inset 0 1px 0 rgba(244,246,248,0.03)",
                    }}
                  >
                    {fresh && !reducedMotion && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(245,200,76,0.16), transparent)",
                          mixBlendMode: "screen",
                          animation: "ucWallGlint 4.6s ease-in-out infinite",
                        }}
                      />
                    )}
                    <div className="relative flex items-center justify-between gap-2">
                      <span
                        className="text-[0.62rem] tracking-[0.14em]"
                        style={{
                          fontFamily: "var(--font-geist-mono)",
                          color: isMine || fresh ? "#f5c84c" : "#8a6a1f",
                        }}
                      >
                        No. {formatTenantNo(t.tenant_number)}
                      </span>
                      {isMine && (
                        <span
                          className="text-[0.5rem] tracking-[0.2em]"
                          style={{ fontFamily: "var(--font-geist-mono)", color: "#060507", background: "#f5c84c", padding: "1px 5px" }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                    <p
                      className="relative mt-3 break-words text-xl font-bold leading-tight tracking-[0.02em] sm:text-2xl"
                      style={{
                        fontFamily: "var(--font-big-shoulders)",
                        color: isMine ? "#ffe9a8" : "#e8e2d6",
                      }}
                    >
                      {t.alias}
                    </p>
                    <div
                      className="relative mt-3 flex flex-col gap-0.5 text-[0.54rem] tracking-[0.12em]"
                      style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
                    >
                      <span>{t.deed_id}</span>
                      <span>
                        SUBLEVEL −{t.depth} · {formatIssued(t.created_at)}
                      </span>
                    </div>
                  </li>
                );
              })}

              {/* unclaimed niches — the wall is still accepting tenants */}
              {Array.from({ length: vacancies }).map((_, i) => (
                <li
                  key={`vacant-${i}`}
                  aria-hidden="true"
                  className="flex w-[calc(50%-0.375rem)] flex-col justify-between border border-dashed px-4 py-4 sm:w-[184px]"
                  style={{
                    borderColor: "rgba(212,167,44,0.14)",
                    background:
                      "repeating-linear-gradient(135deg, rgba(212,167,44,0.015) 0 6px, transparent 6px 12px), rgba(8,7,11,0.5)",
                  }}
                >
                  <span
                    className="text-[0.62rem] tracking-[0.14em]"
                    style={{ fontFamily: "var(--font-geist-mono)", color: "#4a4453" }}
                  >
                    No. ——
                  </span>
                  <span
                    className="my-2 text-2xl leading-none"
                    style={{ color: "#3a3542" }}
                  >
                    ⚿
                  </span>
                  <span
                    className="text-[0.54rem] leading-relaxed tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-geist-mono)", color: "#4a4453" }}
                  >
                    AWAITING
                    <br />A NAME
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ---- the marks ---- */}
      <div className="mt-16 w-full max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <p
            className="text-[0.6rem] tracking-[0.4em]"
            style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
          >
            WHAT THE TENANTS ARE SAYING
          </p>
          <h3
            className="mt-3 text-2xl tracking-[0.04em] sm:text-3xl"
            style={{ fontFamily: "var(--font-gloock)", color: "#e8e2d6" }}
          >
            MARKS ON THE WALL
          </h3>
        </div>

        {/* compose (tenants) or the seal (everyone else) */}
        <div className="mt-8">
          {isTenant ? (
            <Compose claim={claim} onPosted={onPosted} />
          ) : (
            <div
              className="relative flex flex-col items-center gap-4 border border-dashed px-6 py-10 text-center"
              style={{ borderColor: "rgba(212,167,44,0.3)", background: "rgba(10,8,13,0.6)" }}
            >
              <span aria-hidden className="text-2xl" style={{ color: "#8a6a1f" }}>
                ⚿
              </span>
              <p
                className="max-w-md text-balance text-lg italic leading-relaxed"
                style={{ fontFamily: "var(--font-crimson)", color: "#c9c2d0" }}
              >
                The wall is sealed to strangers. Claim your key to leave your mark.
              </p>
              <a
                href="#rite"
                className="inline-flex min-h-12 items-center justify-center border px-8 text-[0.68rem] tracking-[0.3em] transition-colors hover:text-[#f5c84c] focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  borderColor: "rgba(212,167,44,0.5)",
                  color: "#d4a72c",
                }}
              >
                CLAIM YOUR KEY
              </a>
            </div>
          )}
        </div>

        {/* the stream */}
        <ul className="mt-8 flex flex-col gap-4">
          {marksToShow.length === 0 && status !== "loading" && (
            <li
              className="border-l-2 py-6 pl-5 text-center text-base italic"
              style={{
                borderColor: "rgba(212,167,44,0.3)",
                fontFamily: "var(--font-crimson)",
                color: "#8a8494",
              }}
            >
              No marks yet — the wall is still wet. Leave the first.
            </li>
          )}
          {marksToShow.map((p) => (
            <li
              key={p.id}
              className="border-l-2 py-3 pl-5"
              style={{ borderColor: "rgba(212,167,44,0.35)" }}
            >
              <p
                className="text-balance text-lg italic leading-relaxed"
                style={{ fontFamily: "var(--font-crimson)", color: "#e8e2d6" }}
              >
                {p.body}
              </p>
              <p
                className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.56rem] tracking-[0.18em]"
                style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
              >
                <span style={{ color: "#8a6a1f" }}>— {p.alias.toUpperCase()}</span>
                <span aria-hidden>·</span>
                <span>No. {formatTenantNo(p.tenant_number)}</span>
                <span aria-hidden>·</span>
                <span>{now ? relTime(p.created_at, now) : ""}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- outbound: the vault and the serial ---- */}
      <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/music"
          className="group flex flex-col gap-2 border px-6 py-6 transition-colors focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
          style={{ borderColor: "rgba(212,167,44,0.28)", background: "rgba(10,8,13,0.6)" }}
        >
          <span
            className="text-[0.58rem] tracking-[0.3em]"
            style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
          >
            THE MUSIC ◍
          </span>
          <span
            className="text-lg tracking-[0.02em] transition-colors group-hover:text-[#f5c84c]"
            style={{ fontFamily: "var(--font-big-shoulders)", color: "#e8e2d6" }}
          >
            Your key opens the vault — hear it early.
          </span>
        </Link>
        <Link
          href="/serial"
          className="group flex flex-col gap-2 border px-6 py-6 transition-colors focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
          style={{ borderColor: "rgba(212,167,44,0.28)", background: "rgba(10,8,13,0.6)" }}
        >
          <span
            className="text-[0.58rem] tracking-[0.3em]"
            style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
          >
            THE SERIAL ✝
          </span>
          <span
            className="text-lg tracking-[0.02em] transition-colors group-hover:text-[#f5c84c]"
            style={{ fontFamily: "var(--font-big-shoulders)", color: "#e8e2d6" }}
          >
            Read how the throne got built at the bottom.
          </span>
        </Link>
      </div>
    </section>
  );
}
