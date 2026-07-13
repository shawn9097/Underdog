"use client";

import { useEffect, useState } from "react";
import { BRAND, msUntilRelease } from "@/lib/album";
import { type Claim, formatTenantNo } from "./ritual";

interface Props {
  tenantCount: number | null;
  claim: Claim | null;
}

/** What a key actually buys — stated plainly, the last line is the incentive. */
const TENANCY = [
  {
    k: "YOUR NUMBER",
    v: "A sequential deed, issued by the city ledger and yours alone.",
  },
  {
    k: "YOUR NAME ON THE WALL",
    v: "Engraved into the roster of the Underdogs, down here for good.",
  },
  {
    k: "A MARK TO LEAVE",
    v: "The wall is yours to write on. Say your piece; it stays.",
  },
  {
    k: "THE ALBUM, EARLY",
    v: `Your key unlocks ${BRAND.album} on-site before it drops ${BRAND.releaseDateDisplay}.`,
  },
] as const;

export default function Arrival({ tenantCount, claim }: Props) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(Math.ceil(msUntilRelease(Date.now()) / 86_400_000));
  }, []);

  return (
    <header className="relative flex w-full flex-col items-center px-5 pt-20 text-center sm:pt-28">
      <p
        className="text-[0.6rem] tracking-[0.34em] sm:tracking-[0.5em]"
        style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
      >
        UNDERDOG CITY — THE COMMUNITY
      </p>

      {/* the hook, verbatim canon */}
      <h1
        className="mt-6 max-w-4xl text-balance text-[2.15rem] leading-[1.05] tracking-[0.01em] sm:text-6xl"
        style={{ fontFamily: "var(--font-gloock)", color: "#e8e2d6" }}
      >
        Now Accepting{" "}
        <span
          style={{
            background: "linear-gradient(180deg, #ffe9a8, #f5c84c 55%, #8a6a1f)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Tenants
        </span>{" "}
        in Underdog City.
      </h1>

      {/* the emotional thesis of the wall */}
      <p
        className="mt-7 max-w-xl text-balance text-lg italic leading-relaxed sm:text-xl"
        style={{ fontFamily: "var(--font-crimson)", color: "#c9c2d0" }}
      >
        The wall is the proof that you&rsquo;re not the only one down here.
      </p>
      <p
        className="mt-3 max-w-lg text-balance text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-crimson)", color: "#8a8494" }}
      >
        {BRAND.thesis}
      </p>

      {/* live count marker */}
      <div className="mt-10 flex items-center gap-4">
        <span aria-hidden className="h-px w-8" style={{ background: "rgba(212,167,44,0.4)" }} />
        <p
          className="flex items-baseline gap-2 text-[0.62rem] tracking-[0.3em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#8a8494" }}
        >
          <span aria-hidden style={{ color: "#8a6a1f" }}>
            №
          </span>
          <span
            aria-live="polite"
            className="text-2xl tracking-[0.04em]"
            style={{ fontFamily: "var(--font-italiana)", color: "#f5c84c" }}
          >
            {tenantCount === null ? "—" : tenantCount.toLocaleString()}
          </span>
          <span>{tenantCount === 1 ? "TENANT" : "TENANTS"} DOWN HERE</span>
        </p>
        <span aria-hidden className="h-px w-8" style={{ background: "rgba(212,167,44,0.4)" }} />
      </div>

      {/* what tenancy gets you */}
      <dl className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-px overflow-hidden border sm:grid-cols-2"
        style={{ borderColor: "rgba(212,167,44,0.2)", background: "rgba(212,167,44,0.14)" }}
      >
        {TENANCY.map((t, i) => (
          <div
            key={t.k}
            className="flex flex-col gap-2 px-6 py-6 text-left"
            style={{ background: "#0a080d" }}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="text-[0.7rem]"
                style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="text-sm font-bold tracking-[0.12em]"
                style={{ fontFamily: "var(--font-big-shoulders)", color: "#ffe9a8" }}
              >
                {t.k}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-crimson)", color: "#9a93a6" }}
            >
              {t.v}
            </p>
          </div>
        ))}
      </dl>

      {/* the call to descend */}
      <div className="mt-12 flex flex-col items-center gap-4">
        {claim ? (
          <>
            <p
              className="text-sm italic"
              style={{ fontFamily: "var(--font-crimson)", color: "#d4a72c" }}
            >
              Welcome back, Tenant No. {formatTenantNo(claim.tenantNumber)}.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#deed"
                className="inline-flex min-h-12 items-center justify-center border px-8 text-[0.7rem] tracking-[0.3em] transition-colors hover:text-[#f5c84c] focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  borderColor: "rgba(212,167,44,0.45)",
                  color: "#d4a72c",
                }}
              >
                YOUR DEED
              </a>
              <a
                href="#wall"
                className="inline-flex min-h-12 items-center justify-center border px-8 text-[0.7rem] tracking-[0.3em] transition-colors focus-visible:ring-2 focus-visible:ring-[#f5c84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  borderColor: "#d4a72c",
                  color: "#060507",
                  background: "linear-gradient(180deg, #f5c84c 0%, #d4a72c 100%)",
                }}
              >
                THE WALL
              </a>
            </div>
          </>
        ) : (
          <a
            href="#rite"
            className="group inline-flex min-h-13 items-center justify-center gap-3 border px-10 py-3 text-sm tracking-[0.32em] transition-colors focus-visible:ring-2 focus-visible:ring-[#f5c84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              borderColor: "#d4a72c",
              color: "#060507",
              background: "linear-gradient(180deg, #f5c84c 0%, #d4a72c 100%)",
            }}
          >
            CLAIM YOUR KEY
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">
              ▼
            </span>
          </a>
        )}
        <p
          className="text-[0.62rem] tracking-[0.22em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
        >
          {days !== null && days > 0
            ? `${days} DAYS UNTIL THE DOORS OPEN — ${BRAND.releaseDateDisplay}`
            : `THE DOORS ARE OPEN — ${BRAND.releaseDateDisplay}`}
        </p>
      </div>
    </header>
  );
}
