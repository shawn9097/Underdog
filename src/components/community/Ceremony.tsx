"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { WORLD } from "@/lib/album";
import SlabRite from "./SlabRite";
import Ledger from "./Ledger";
import DeedCard from "./DeedCard";
import { RiteSound } from "./RiteSound";
import { type Claim, seedHex } from "./ritual";

interface Props {
  reducedMotion: boolean;
  claim: Claim | null;
  onClaimed: (claim: Claim) => void;
  onReset: () => void;
}

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

type Phase = "rite" | "ledger";

/** Canon inscriptions witnessing the rite, verbatim from the world bible. */
const RAIL_DROP = WORLD.drop.description;
const RAIL_WEAPON = WORLD.kintsugi.rule.slice(
  WORLD.kintsugi.rule.indexOf("Your damage")
);

/** A ceremonial marginalia rail — vertical canon flanking the slab. */
function Rail({ text, lit }: { text: string; lit: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="hidden shrink-0 flex-col items-center justify-center gap-3 lg:flex"
      style={{ width: "1.5rem" }}
    >
      <span
        className="block h-1.5 w-1.5 rotate-45 transition-colors duration-1000"
        style={{ background: lit ? "#d4a72c" : "#3a3542" }}
      />
      <span
        className="block w-px flex-1"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(138,106,31,0.5) 20%, rgba(138,106,31,0.5) 80%, transparent)",
        }}
      />
      <p
        className="text-[0.55rem] uppercase leading-none tracking-[0.34em] transition-colors duration-1000 [writing-mode:vertical-rl]"
        style={{
          fontFamily: "var(--font-geist-mono)",
          color: lit ? "#8a6a1f" : "#4a4453",
          transform: "rotate(180deg)",
        }}
      >
        {text}
      </p>
      <span
        className="block w-px flex-1"
        style={{
          background:
            "linear-gradient(0deg, transparent, rgba(138,106,31,0.5) 20%, rgba(138,106,31,0.5) 80%, transparent)",
        }}
      />
      <span
        className="block h-1.5 w-1.5 rotate-45 transition-colors duration-1000"
        style={{ background: lit ? "#d4a72c" : "#3a3542" }}
      />
    </div>
  );
}

/**
 * The rite of tenancy — Acts I–III on one canvas plus the ledger and deed.
 * Absorbed from the former /key surface and rewired: the ledger signs the
 * real city ledger, and the deed carries a server-issued tenant number.
 * Claim persistence lives in the parent so the wall knows who holds a key.
 */
export default function Ceremony({ reducedMotion, claim, onClaimed, onReset }: Props) {
  const [phase, setPhase] = useState<Phase>("rite");
  const [act, setAct] = useState(1);
  const [strikes, setStrikes] = useState(0);
  const [whisper, setWhisper] = useState<string>(WHISPERS.awaitRite);
  const [keySeed, setKeySeed] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const whisperRef = useRef<HTMLParagraphElement>(null);
  const ledgerRef = useRef<HTMLDivElement>(null);
  const deedRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<RiteSound | null>(null);
  const pendingRef = useRef<{ seed: number; bitting: number[] } | null>(null);
  const timerRef = useRef<number | null>(null);

  const rm = reducedMotion;
  const showDeed = claim !== null;

  /* if we mount already holding a key (returning tenant), sit at the deed */
  useEffect(() => {
    if (claim) {
      setAct(3);
      setWhisper(WHISPERS.deed);
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      soundRef.current?.dispose();
    };
    // mount-once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* whisper crossfade */
  useEffect(() => {
    const el = whisperRef.current;
    if (!el || showDeed) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: rm ? 0.01 : 1.3, ease: "power2.out" }
    );
  }, [whisper, rm, showDeed]);

  /* ledger + deed reveals */
  useEffect(() => {
    if (phase === "ledger" && !showDeed && ledgerRef.current) {
      gsap.fromTo(
        ledgerRef.current,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: rm ? 0.01 : 1.1, ease: "power2.out", delay: rm ? 0 : 0.2 }
      );
      ledgerRef.current.scrollIntoView({
        behavior: rm ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [phase, rm, showDeed]);

  useEffect(() => {
    if (showDeed && deedRef.current) {
      gsap.fromTo(
        deedRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: rm ? 0.01 : 1.2, ease: "power2.out" }
      );
    }
  }, [showDeed, rm]);

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

  const onShatter = useCallback(() => setWhisper(WHISPERS.shatter), []);

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

  const handleClaimed = useCallback(
    (c: Claim) => {
      setWhisper(WHISPERS.deed);
      onClaimed(c);
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [onClaimed]
  );

  const pending = pendingRef.current;

  return (
    <div className="relative flex w-full flex-col items-center">
      {/* acts indicator */}
      <ol
        className="mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.6rem] tracking-[0.28em] sm:gap-x-5"
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

      {/* stage */}
      <section
        aria-label="The ritual stage"
        className="relative flex w-full max-w-4xl flex-col items-center px-1"
      >
        {!showDeed && (
          <>
            <div className="mt-4 flex w-full items-stretch justify-center gap-6 xl:gap-12">
              <Rail text={RAIL_DROP} lit={act === 1} />
              <div
                className={`w-full max-w-2xl ${
                  phase === "ledger"
                    ? "h-[min(34vh,300px)] min-h-[220px]"
                    : "h-[min(52vh,500px)] min-h-[320px]"
                }`}
              >
                <SlabRite
                  reducedMotion={rm}
                  onStrike={onStrike}
                  onShatter={onShatter}
                  onGild={onGild}
                  onKeyFormed={onKeyFormed}
                  fx={fx}
                />
              </div>
              <Rail text={RAIL_WEAPON} lit={act >= 2} />
            </div>

            <p
              id="rite-instruction"
              className="mt-2 flex min-h-6 flex-wrap items-center justify-center gap-3 text-[0.62rem] tracking-[0.34em] sm:gap-4"
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
        {!showDeed && (
          <p
            ref={whisperRef}
            aria-live="polite"
            className="mt-6 min-h-[4.5rem] max-w-xl text-balance px-2 text-center text-lg italic leading-relaxed sm:text-xl"
            style={{ fontFamily: "var(--font-crimson)", color: "#c9c2d0" }}
          >
            {whisper}
          </p>
        )}

        {phase === "ledger" && !showDeed && pending && (
          <div ref={ledgerRef} className="mt-8 flex w-full justify-center pb-2">
            <Ledger seed={pending.seed} bitting={pending.bitting} onClaimed={handleClaimed} />
          </div>
        )}

        {showDeed && claim && (
          <div ref={deedRef} className="mt-2 flex w-full justify-center pb-2">
            <DeedCard claim={claim} onReset={onReset} />
          </div>
        )}
      </section>

      {/* rite sound toggle — only meaningful during the ceremony itself */}
      {!showDeed && (
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className="mt-9 min-h-11 cursor-pointer border px-5 text-[0.62rem] tracking-[0.3em] transition-colors hover:text-[#f5c84c] focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            borderColor: soundOn ? "#d4a72c" : "rgba(212,167,44,0.35)",
            color: soundOn ? "#d4a72c" : "#8a8494",
            background: "transparent",
          }}
        >
          RITE SOUND — {soundOn ? "ON" : "OFF"}
        </button>
      )}
    </div>
  );
}
