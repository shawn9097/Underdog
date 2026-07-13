"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchTenantCount,
  subscribeEmail,
  type WallEntry,
  type WallPost,
} from "@/lib/backend";
import Embers from "./Embers";
import Arrival from "./Arrival";
import Ceremony from "./Ceremony";
import TheWall from "./TheWall";
import DescentGauge from "./DescentGauge";
import {
  type Claim,
  clearClaim,
  hasLegacyClaim,
  loadClaim,
  saveClaim,
} from "./ritual";

interface Props {
  initialWall: WallEntry[];
  initialPosts: WallPost[];
  initialCount: number | null;
  seedError: boolean;
}

/**
 * THE COMMUNITY — the home of Underdog City.
 *
 * Arrival → the rite of tenancy → the wall. All storage and network access
 * happens after mount, so the server render is a stable, empty shell. The
 * claim record (v2, with the server tenant number + key) is the single source
 * of truth for who may leave a mark on the wall.
 */
export default function CommunityRoot({
  initialWall,
  initialPosts,
  initialCount,
  seedError,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [rm, setRm] = useState(false);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [legacy, setLegacy] = useState(false);
  const [count, setCount] = useState<number | null>(initialCount);
  const [refreshToken, setRefreshToken] = useState(0);
  const [ceremonyKey, setCeremonyKey] = useState(0);

  /* boot: reduced-motion, returning tenant, stranded v1 record */
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setRm(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setRm(e.matches);
    mq.addEventListener("change", onChange);

    const existing = loadClaim();
    if (existing) setClaim(existing);
    else setLegacy(hasLegacyClaim());

    return () => mq.removeEventListener("change", onChange);
  }, []);

  /*
   * The count is seeded on the server; refetch it only after a real
   * interaction (a claim bumps refreshToken). Never on passive load — that
   * keeps the browser from touching the network just for showing the page.
   */
  useEffect(() => {
    if (!mounted || refreshToken === 0) return;
    let cancelled = false;
    fetchTenantCount()
      .then((n) => {
        if (!cancelled) setCount(n);
      })
      .catch(() => {
        /* honest: the marker simply holds its last known value */
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, refreshToken]);

  const onClaimed = useCallback((c: Claim) => {
    saveClaim(c);
    setClaim(c);
    setLegacy(false);
    // optimistic tick so the marker moves the instant the number is issued
    setCount((n) => (n ?? 0) + 1);
    // fire-and-forget Beehiiv sync; the claim already stored the email safely
    subscribeEmail(c.email);
    // the new name should appear on the wall, and the count reconciles
    setRefreshToken((t) => t + 1);
  }, []);

  const onReset = useCallback(() => {
    clearClaim();
    setClaim(null);
    setLegacy(false);
    setCeremonyKey((k) => k + 1); // remount the ceremony to a fresh slab
    setRefreshToken((t) => t + 1);
  }, []);

  return (
    <main
      className="relative flex min-h-dvh w-full flex-col items-center overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse 120% 60% at 50% 0%, #0b0910 0%, #060507 62%)",
      }}
    >
      <Embers reducedMotion={rm} />
      <DescentGauge />

      {/* kintsugi veins in the page corners — the signature, always present */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed right-0 top-0 h-40 w-40 opacity-30 sm:h-56 sm:w-56"
        viewBox="0 0 100 100"
        style={{ zIndex: 1 }}
      >
        <path
          d="M100 8 L82 14 L74 26 L61 29 L52 43 M74 26 L69 14 M61 29 L48 24"
          fill="none"
          stroke="#8a6a1f"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 h-36 w-36 opacity-25 sm:h-48 sm:w-48"
        viewBox="0 0 100 100"
        style={{ zIndex: 1 }}
      >
        <path
          d="M0 88 L16 84 L27 72 L41 70 L49 57 M27 72 L31 84 M41 70 L53 76"
          fill="none"
          stroke="#8a6a1f"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative z-10 flex w-full flex-col items-center">
        <Arrival tenantCount={count} claim={claim} />

        {/* ---- the rite of tenancy ---- */}
        <section
          id="rite"
          aria-label="The rite of tenancy"
          className="relative mt-20 flex w-full scroll-mt-16 flex-col items-center px-4 sm:mt-24"
        >
          <span id="deed" aria-hidden className="pointer-events-none absolute -top-16" />

          <div className="flex flex-col items-center text-center">
            <p
              className="text-[0.6rem] tracking-[0.4em]"
              style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
            >
              UNDERDOG CITY — RITE OF TENANCY
            </p>
            <h2
              className="mt-4 text-[2rem] leading-none tracking-[0.04em] sm:text-5xl"
              style={{ fontFamily: "var(--font-gloock)", color: "#e8e2d6" }}
            >
              CLAIM YOUR{" "}
              <span
                style={{
                  background: "linear-gradient(180deg, #ffe9a8, #d4a72c 70%, #8a6a1f)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                KEY
              </span>
            </h2>
            <p
              className="mt-4 max-w-lg text-balance text-sm italic leading-relaxed"
              style={{ fontFamily: "var(--font-crimson)", color: "#8a8494" }}
            >
              {claim
                ? "Your deed is cut and kept on this device. The wall knows your number."
                : "Strike the obsidian three times. The fracture is yours; the key is cut from where it broke."}
            </p>
          </div>

          {legacy && !claim && (
            <div
              role="status"
              className="mt-8 max-w-md border-l-2 px-5 py-4"
              style={{ borderColor: "#d4a72c", background: "rgba(212,167,44,0.06)" }}
            >
              <p
                className="text-sm italic leading-relaxed"
                style={{ fontFamily: "var(--font-crimson)", color: "#ffe9a8" }}
              >
                An older key was found on this device from before the city kept a
                ledger. It never got a number. Break the slab again to be written
                into the wall for real.
              </p>
            </div>
          )}

          <div className="mt-10 w-full">
            {mounted ? (
              <Ceremony
                key={ceremonyKey}
                reducedMotion={rm}
                claim={claim}
                onClaimed={onClaimed}
                onReset={onReset}
              />
            ) : (
              <div
                className="flex min-h-[360px] items-center justify-center text-[0.66rem] tracking-[0.3em]"
                style={{ fontFamily: "var(--font-geist-mono)", color: "#57505f" }}
                aria-hidden
              >
                PREPARING THE SLAB…
              </div>
            )}
          </div>
        </section>

        {/* ---- the wall ---- */}
        <div className="mt-24 w-full sm:mt-32">
          <TheWall
            claim={claim}
            count={count}
            refreshToken={refreshToken}
            initialWall={initialWall}
            initialPosts={initialPosts}
            seedError={seedError}
            reducedMotion={rm}
          />
        </div>

        {/* ---- foot ---- */}
        <footer className="relative flex w-full flex-col items-center gap-3 px-4 pb-28 pt-6 text-center">
          <p
            className="text-sm italic"
            style={{ fontFamily: "var(--font-crimson)", color: "#57505f" }}
          >
            &ldquo;We all rule down here.&rdquo;
          </p>
          <p
            className="text-[0.6rem] leading-loose tracking-[0.24em]"
            style={{ fontFamily: "var(--font-geist-mono)", color: "#4a4453" }}
          >
            THRONE AT THE BOTTOM — CENOTAPH RECORDS — OUT 07.31.2026
          </p>
        </footer>
      </div>
    </main>
  );
}
