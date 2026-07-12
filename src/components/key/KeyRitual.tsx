"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { BRAND, WORLD } from "@/lib/album";
import Embers from "./Embers";
import SlabRite from "./SlabRite";
import Ledger from "./Ledger";
import DeedCard from "./DeedCard";
import { RiteSound } from "./RiteSound";
import {
  type Claim,
  clearClaim,
  deriveDeed,
  loadClaim,
  saveClaim,
  seedHex,
} from "./ritual";

type Phase = "boot" | "rite" | "ledger" | "deed";

/** Every whisper is canon — brief thesis, kintsugi rule, prologue, taglines. */
const WHISPERS = {
  awaitRite: "Hit absolute bottom. Survive the break.",
  strike1: "The world throws people away.",
  strike2: "Down here, the broken discover that broken things hold the most power.",
  shatter: "Something gold. And patient. And very, very angry.",
  gild: "Gold runs through the fracture — you gild.",
  formed: "A power tied to the exact wound that broke you. Your damage is your weapon.",
  deed: "We all rule down here.",
} as const;

const ACTS = [
  { n: "I", label: "THE BREAK" },
  { n: "II", label: "THE GILDING" },
  { n: "III", label: "THE TENANCY" },
] as const;

/** Marginalia inscriptions, sliced verbatim from canon. */
const RAIL_DROP = WORLD.drop.description;
const RAIL_WEAPON = WORLD.kintsugi.rule.slice(
  WORLD.kintsugi.rule.indexOf("Your damage")
);

export default function KeyRitual() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [act, setAct] = useState(1);
  const [strikes, setStrikes] = useState(0);
  const [whisper, setWhisper] = useState<string>(WHISPERS.awaitRite);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [keySeed, setKeySeed] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [rm, setRm] = useState(false);
  const [nonce, setNonce] = useState(0);

  const whisperRef = useRef<HTMLParagraphElement>(null);
  const ledgerRef = useRef<HTMLDivElement>(null);
  const deedRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<RiteSound | null>(null);
  const pendingRef = useRef<{ seed: number; bitting: number[] } | null>(null);
  const timerRef = useRef<number | null>(null);

  /* boot: reduced-motion preference + returning tenants */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setRm(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setRm(e.matches);
    mq.addEventListener("change", onChange);

    const existing = loadClaim();
    if (existing) {
      setClaim(existing);
      setKeySeed(existing.seed);
      setAct(3);
      setWhisper(WHISPERS.deed);
      setPhase("deed");
    } else {
      setPhase("rite");
    }
    return () => {
      mq.removeEventListener("change", onChange);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      soundRef.current?.dispose();
    };
  }, []);

  /* whisper crossfade */
  useEffect(() => {
    const el = whisperRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: rm ? 0.01 : 1.3, ease: "power2.out" }
    );
  }, [whisper, rm]);

  /* ledger + deed reveals */
  useEffect(() => {
    if (phase === "ledger" && ledgerRef.current) {
      gsap.fromTo(
        ledgerRef.current,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: rm ? 0.01 : 1.1, ease: "power2.out", delay: rm ? 0 : 0.2 }
      );
      // align the ledger's foot with the viewport so the freshly cut key
      // stays visible above it — the reward presides over the signing
      ledgerRef.current.scrollIntoView({
        behavior: rm ? "auto" : "smooth",
        block: "end",
      });
    }
    if (phase === "deed" && deedRef.current) {
      gsap.fromTo(
        deedRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: rm ? 0.01 : 1.2, ease: "power2.out" }
      );
    }
  }, [phase, rm]);

  const getSound = () => {
    if (!soundRef.current) soundRef.current = new RiteSound();
    return soundRef.current;
  };

  const toggleSound = () => {
    const s = getSound();
    if (soundOn) {
      s.disable();
      setSoundOn(false);
    } else {
      s.enable();
      setSoundOn(true);
    }
  };

  const fx = useMemo(
    () => ({
      strike: (n: number) => soundRef.current?.strike(n),
      shatter: () => soundRef.current?.shatter(),
      gild: () => soundRef.current?.gild(),
    }),
    []
  );

  const onStrike = useCallback((n: number) => {
    setStrikes(n);
    if (n === 1) setWhisper(WHISPERS.strike1);
    if (n === 2) setWhisper(WHISPERS.strike2);
  }, []);

  const onShatter = useCallback(() => {
    setWhisper(WHISPERS.shatter);
  }, []);

  const onGild = useCallback(() => {
    setAct(2);
    setWhisper(WHISPERS.gild);
  }, []);

  const onKeyFormed = useCallback((seed: number, bitting: number[]) => {
    pendingRef.current = { seed, bitting };
    setKeySeed(seed);
    setWhisper(WHISPERS.formed);
    timerRef.current = window.setTimeout(() => {
      setAct(3);
      setPhase("ledger");
    }, 1200);
  }, []);

  const onClaim = useCallback((alias: string, email: string) => {
    const pending = pendingRef.current;
    if (!pending) return;
    const { deedId, depth } = deriveDeed(alias, email);
    const c: Claim = {
      alias,
      email,
      seed: pending.seed,
      bitting: pending.bitting,
      deedId,
      depth,
      issuedISO: new Date().toISOString(),
    };
    saveClaim(c);
    setClaim(c);
    setWhisper(WHISPERS.deed);
    setPhase("deed");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const onReset = useCallback(() => {
    clearClaim();
    pendingRef.current = null;
    setClaim(null);
    setStrikes(0);
    setKeySeed(null);
    setAct(1);
    setWhisper(WHISPERS.awaitRite);
    setNonce((n) => n + 1);
    setPhase("rite");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const showStage = phase === "boot" || phase === "rite" || phase === "ledger";

  return (
    <main
      className="relative flex min-h-dvh w-full flex-col items-center overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse 120% 70% at 50% 0%, #0b0910 0%, #060507 60%)" }}
    >
      <Embers reducedMotion={rm} />

      {/* kintsugi veins in the page corners — the signature, always present */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed right-0 top-0 h-48 w-48 opacity-40 sm:h-64 sm:w-64"
        viewBox="0 0 100 100"
        style={{ zIndex: 2 }}
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
        className="pointer-events-none fixed bottom-0 left-0 h-40 w-40 opacity-30 sm:h-56 sm:w-56"
        viewBox="0 0 100 100"
        style={{ zIndex: 2 }}
      >
        <path
          d="M0 88 L16 84 L27 72 L41 70 L49 57 M27 72 L31 84 M41 70 L53 76"
          fill="none"
          stroke="#8a6a1f"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </svg>

      {/* ceremonial marginalia — canon inscriptions witnessing the rite */}
      <aside
        aria-hidden="true"
        className="pointer-events-none fixed left-6 top-1/2 z-[2] hidden -translate-y-1/2 flex-col items-center gap-3 [@media(min-width:1280px)_and_(min-height:640px)]:flex"
      >
        <span
          className="block h-1.5 w-1.5 rotate-45 transition-colors duration-1000"
          style={{ background: act === 1 ? "#d4a72c" : "#3a3542" }}
        />
        <span
          className="block h-10 w-px"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(138,106,31,0.55))",
          }}
        />
        <p
          className="rotate-180 text-[0.55rem] uppercase leading-none tracking-[0.34em] transition-colors duration-1000 [writing-mode:vertical-rl]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: act === 1 ? "#8a6a1f" : "#4a4453",
          }}
        >
          {RAIL_DROP}
        </p>
        <span
          className="block h-10 w-px"
          style={{
            background: "linear-gradient(0deg, transparent, rgba(138,106,31,0.55))",
          }}
        />
        <span
          className="block h-1.5 w-1.5 rotate-45 transition-colors duration-1000"
          style={{ background: act === 1 ? "#d4a72c" : "#3a3542" }}
        />
      </aside>
      <aside
        aria-hidden="true"
        className="pointer-events-none fixed right-6 top-1/2 z-[2] hidden -translate-y-1/2 flex-col items-center gap-3 [@media(min-width:1280px)_and_(min-height:640px)]:flex"
      >
        <span
          className="block h-1.5 w-1.5 rotate-45 transition-colors duration-1000"
          style={{ background: act >= 2 ? "#d4a72c" : "#3a3542" }}
        />
        <span
          className="block h-10 w-px"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(138,106,31,0.55))",
          }}
        />
        <p
          className="text-[0.55rem] uppercase leading-none tracking-[0.34em] transition-colors duration-1000 [writing-mode:vertical-rl]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: act >= 2 ? "#8a6a1f" : "#4a4453",
          }}
        >
          {RAIL_WEAPON}
        </p>
        <span
          className="block h-10 w-px"
          style={{
            background: "linear-gradient(0deg, transparent, rgba(138,106,31,0.55))",
          }}
        />
        <span
          className="block h-1.5 w-1.5 rotate-45 transition-colors duration-1000"
          style={{ background: act >= 2 ? "#d4a72c" : "#3a3542" }}
        />
      </aside>

      {/* ------------------------------------------------ header */}
      <header className="relative z-10 px-4 pt-10 text-center sm:pt-14">
        <p
          className="text-[0.6rem] tracking-[0.32em] sm:tracking-[0.5em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
        >
          UNDERDOG CITY — RITE OF TENANCY
        </p>
        <h1
          className="mt-4 text-[2.4rem] leading-none tracking-[0.06em] sm:text-6xl"
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
        </h1>

        <ol
          className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.6rem] tracking-[0.28em] sm:gap-x-5"
          style={{ fontFamily: "var(--font-geist-mono)" }}
          aria-label="The three acts of the rite"
        >
          {ACTS.map((a, i) => (
            <li
              key={a.n}
              aria-current={act === i + 1 ? "step" : undefined}
              className="flex items-center gap-3 sm:gap-5"
              style={{ color: act >= i + 1 ? "#d4a72c" : "#57505f" }}
            >
              {/* separator leads the item so a wrapped line never ends on a dangling dash */}
              {i > 0 && (
                <span aria-hidden style={{ color: "#3a3542" }}>
                  —
                </span>
              )}
              <span>
                {a.n} · {a.label}
              </span>
            </li>
          ))}
        </ol>
      </header>

      {/* ------------------------------------------------ stage */}
      <section
        aria-label="The ritual stage"
        className="relative z-10 flex w-full max-w-4xl flex-col items-center px-4"
      >
        {showStage && (
          <>
            <div
              className={`mt-3 w-full ${
                phase === "ledger"
                  ? "h-[min(38vh,340px)] min-h-[240px]"
                  : "h-[min(58vh,540px)] min-h-[340px]"
              }`}
            >
              {phase !== "boot" && (
                <SlabRite
                  key={nonce}
                  reducedMotion={rm}
                  onStrike={onStrike}
                  onShatter={onShatter}
                  onGild={onGild}
                  onKeyFormed={onKeyFormed}
                  fx={fx}
                />
              )}
            </div>

            <p
              id="rite-instruction"
              className="mt-2 flex min-h-6 items-center justify-center gap-4 text-[0.62rem] tracking-[0.34em]"
              style={{ fontFamily: "var(--font-geist-mono)", color: "#8a8494" }}
            >
              {keySeed !== null ? (
                <span className="text-center" style={{ color: "#d4a72c" }}>
                  FRACTURE SEED {seedHex(keySeed)} — CUT FOR YOU ALONE
                </span>
              ) : strikes < 3 ? (
                <>
                  <span>STRIKE THE SLAB</span>
                  <span aria-label={`${strikes} of 3 strikes landed`} className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 rotate-45"
                        style={{
                          background: strikes >= i ? "#d4a72c" : "transparent",
                          border: "1px solid #8a6a1f",
                        }}
                      />
                    ))}
                  </span>
                  <span>THREE BLOWS</span>
                </>
              ) : (
                <span style={{ color: "#8a6a1f" }}>THE BREAK IS STRUCK</span>
              )}
            </p>
          </>
        )}

        {/* the whisper — canon lines, spoken low */}
        <p
          ref={whisperRef}
          aria-live="polite"
          className="mt-6 min-h-[4.5rem] max-w-xl text-balance px-2 text-center text-lg italic leading-relaxed sm:text-xl"
          style={{ fontFamily: "var(--font-crimson)", color: "#c9c2d0" }}
        >
          {whisper}
        </p>

        {phase === "ledger" && (
          <div ref={ledgerRef} className="mt-10 flex w-full justify-center pb-6">
            <Ledger onClaim={onClaim} />
          </div>
        )}

        {phase === "deed" && claim && (
          <div ref={deedRef} className="mt-8 flex w-full justify-center pb-6">
            <DeedCard claim={claim} onReset={onReset} />
          </div>
        )}
      </section>

      {/* ------------------------------------------------ footer */}
      <footer className="relative z-10 mt-auto flex flex-col items-center gap-5 px-4 pb-28 pt-14 text-center">
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className="min-h-11 cursor-pointer border px-5 text-[0.62rem] tracking-[0.3em] transition-colors hover:text-[#f5c84c] focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            borderColor: soundOn ? "#d4a72c" : "rgba(212,167,44,0.35)",
            color: soundOn ? "#d4a72c" : "#8a8494",
            background: "transparent",
          }}
        >
          RITE SOUND — {soundOn ? "ON" : "OFF"}
        </button>
        <p
          className="text-[0.62rem] leading-loose tracking-[0.24em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
        >
          {BRAND.album.toUpperCase()} — 14 TRACKS
          <span className="hidden sm:inline"> — </span>
          <br className="sm:hidden" />
          {BRAND.label.toUpperCase()} —{" "}
          <span style={{ color: "#8a6a1f" }}>OUT {BRAND.releaseDateDisplay}</span>
        </p>
        <p
          className="text-sm italic"
          style={{ fontFamily: "var(--font-crimson)", color: "#57505f" }}
        >
          “{BRAND.taglines[2]}”
        </p>
      </footer>
    </main>
  );
}
