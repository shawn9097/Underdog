import Link from "next/link";
import { BRAND, WORLD } from "@/lib/album";
import KintsugiCrack from "./KintsugiCrack";
import Skyline from "./Skyline";
import Countdown from "./Countdown";
import TrackLadder from "./TrackLadder";

/* ------------------------------------------------------------------ */
/* shared type voices                                                  */
/* ------------------------------------------------------------------ */
const BOLDONSE = { fontFamily: "var(--font-boldonse)" } as const;
const MONO = { fontFamily: "var(--font-geist-mono)" } as const;
const SERIF_IT = {
  fontFamily: "var(--font-instrument-serif)",
  fontStyle: "italic",
} as const;
const ITALIANA = { fontFamily: "var(--font-italiana)" } as const;
const SANS = { fontFamily: "var(--font-instrument-sans)" } as const;
const SHOULDERS = {
  fontFamily: "var(--font-big-shoulders)",
  fontWeight: 700,
} as const;
const TEKTUR = { fontFamily: "var(--font-tektur)", fontWeight: 500 } as const;

const GOLD_TEXT = {
  backgroundImage:
    "linear-gradient(180deg, var(--gold-white) 0%, var(--gold-hot) 38%, var(--gold) 62%, var(--gold-dim) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

/* ------------------------------------------------------------------ */
/* 1 · THE HALO                                                        */
/* ------------------------------------------------------------------ */
export function HaloSection() {
  return (
    <section
      id="halo"
      className="relative flex min-h-[140vh] flex-col items-center px-6 text-center"
      style={{ background: "var(--halo-white)", color: "#171a1f" }}
    >
      <p
        className="pt-10 text-[0.6rem] tracking-[0.45em] text-[#6b7683]"
        style={MONO}
      >
        CENOTAPH RECORDS PRESENTS
      </p>

      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-16 sm:gap-12">
        <div
          className="relative flex items-center justify-center"
          style={{ width: "min(82vw, 520px)", height: "min(82vw, 520px)" }}
        >
          <div
            aria-hidden="true"
            className="bell-ring absolute inset-0 rounded-full border"
            style={{ borderColor: "rgba(127,168,217,0.55)", opacity: 0 }}
          />
          <div
            aria-hidden="true"
            className="bell-ring absolute inset-0 rounded-full border"
            style={{ borderColor: "rgba(127,168,217,0.4)", opacity: 0 }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: "#b9c4d0",
              boxShadow:
                "0 0 110px rgba(127,168,217,0.4), inset 0 0 90px rgba(201,210,220,0.55)",
            }}
          />
          <div className="flex flex-col items-center gap-5 px-10">
            <h1
              style={{
                ...ITALIANA,
                fontSize: "clamp(2.9rem, 9vw, 6.2rem)",
                letterSpacing: "0.12em",
                lineHeight: 1,
              }}
            >
              THE HALO
            </h1>
            <p
              className="max-w-xs text-[0.85rem] text-[#4c5560] sm:max-w-sm sm:text-base"
              style={SANS}
            >
              {WORLD.halo.description}
            </p>
          </div>
        </div>

        <blockquote
          className="max-w-xl text-balance px-2 text-[#39404a]"
          style={{ ...SERIF_IT, fontSize: "clamp(1.1rem, 2.4vw, 1.55rem)" }}
        >
          &ldquo;High above us, muffled through a mile of steel and money, the
          Halo is ringing its victory bell. Clean. Bright. The sound they make
          when they&rsquo;ve decided a problem&rsquo;s been solved.&rdquo;
        </blockquote>

        <div
          className="verdict-stamp -rotate-3 border-2 px-6 py-4 sm:px-8"
          style={{
            ...MONO,
            borderColor: "var(--blood-bright)",
            color: "var(--blood-bright)",
          }}
        >
          <p className="text-sm font-bold tracking-[0.28em] sm:text-base">
            VERDICT · WORTHLESS
          </p>
          <p className="mt-1 text-[0.62rem] tracking-[0.3em]">
            SENTENCE · THE DROP
          </p>
        </div>

        <p
          className="max-w-sm text-[0.66rem] uppercase leading-relaxed tracking-[0.18em] text-[#828c98]"
          style={MONO}
        >
          {WORLD.drop.description}
        </p>
      </div>

      <div
        className="floor-cue flex flex-col items-center gap-2 pb-16 text-[#39404a]"
        style={MONO}
      >
        <p className="text-[0.66rem] tracking-[0.55em]">THE FLOOR OPENS</p>
        <span aria-hidden="true" className="text-base leading-none">
          ▼
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · THE FALL                                                        */
/* ------------------------------------------------------------------ */
const FALL_QUOTES = [
  {
    top: "20%",
    side: "left" as const,
    text: "The corridor lights slide from gold to white to gone.",
  },
  {
    top: "46%",
    side: "right" as const,
    text: "Here's what nobody tells you about the bottom: it isn't the end of the fall. It's just the floor of the place they're allowed to throw you.",
  },
  {
    top: "72%",
    side: "left" as const,
    text: "And some of what lands down there doesn't have the decency to stay dead.",
  },
];

export function FallSection() {
  return (
    <section id="fall" className="relative" style={{ height: "440vh" }}>
      {FALL_QUOTES.map((q, i) => (
        <figure
          key={i}
          className={`fall-q absolute w-[min(30rem,78vw)] ${
            q.side === "left" ? "left-[7%] text-left" : "right-[9%] text-right"
          }`}
          style={{ top: q.top }}
        >
          <blockquote
            className="text-balance text-[var(--halo-silver)]"
            style={{ ...SERIF_IT, fontSize: "clamp(1.3rem, 2.8vw, 2rem)" }}
          >
            &ldquo;{q.text}&rdquo;
          </blockquote>
          <figcaption
            className="mt-3 text-[0.6rem] tracking-[0.4em] text-[#57505f]"
            style={MONO}
          >
            — THE PROLOGUE
          </figcaption>
        </figure>
      ))}
      <div
        className="absolute left-1/2 w-max"
        style={{ top: "89%", transform: "translateX(-50%)" }}
      >
        <Link
          href="/prologue"
          className="fall-q block border border-[#2a2531] bg-[rgba(6,5,7,0.85)] px-6 py-3.5 text-[0.62rem] tracking-[0.3em] text-[#a9a2b3] transition-colors duration-200 hover:border-[var(--gold-dim)] hover:text-[var(--gold-hot)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-hot)]"
          style={MONO}
        >
          READ THE PROLOGUE · CAME BACK WRONG →
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · IMPACT / KINTSUGI                                               */
/* ------------------------------------------------------------------ */
export function ImpactSection() {
  return (
    <section id="impact" className="relative" style={{ height: "280vh" }}>
      <div
        id="impact-shake"
        className="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
      >
        <KintsugiCrack />
        <div
          id="impact-flash"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0,
            background:
              "radial-gradient(circle at 50% 54%, rgba(245,200,76,0.8) 0%, rgba(212,167,44,0.32) 32%, rgba(6,5,7,0) 68%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(6,5,7,0.68) 0%, rgba(6,5,7,0.3) 44%, rgba(6,5,7,0) 72%)",
          }}
        />
        <div className="relative z-10 max-w-3xl px-6 text-center">
          <p
            className="impact-line text-[0.62rem] tracking-[0.45em] text-[var(--gold-dim)]"
            style={MONO}
          >
            LV -0060 · ABSOLUTE BOTTOM
          </p>
          <h2
            className="impact-line mt-6 text-[var(--bone)]"
            style={{
              ...BOLDONSE,
              fontSize: "clamp(2.4rem, 7.5vw, 5.6rem)",
              lineHeight: 1.3,
            }}
          >
            SURVIVE THE&nbsp;BREAK
          </h2>
          <p
            className="impact-line mx-auto mt-7 max-w-xl text-balance text-[#cdd5de]"
            style={{ ...SERIF_IT, fontSize: "clamp(1.15rem, 2.6vw, 1.7rem)" }}
          >
            Gold runs through the fracture — you gild: a power tied to the
            exact wound that broke you.
          </p>
          <p
            className="impact-line mt-8"
            style={{
              ...BOLDONSE,
              ...GOLD_TEXT,
              fontSize: "clamp(1.5rem, 4.6vw, 3.3rem)",
              lineHeight: 1.3,
            }}
          >
            YOUR DAMAGE IS YOUR&nbsp;WEAPON.
          </p>
          <p
            className="impact-line mx-auto mt-9 max-w-md text-[0.64rem] leading-relaxed tracking-[0.12em] text-[#a9a2b3]"
            style={MONO}
          >
            {WORLD.kintsugi.cost}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · UNDERDOG CITY                                                   */
/* ------------------------------------------------------------------ */
export function CitySection() {
  return (
    <section id="city" className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-[16vh] text-center">
        <p
          className="rise text-[0.62rem] tracking-[0.4em] text-[var(--neon-cyan)]"
          style={MONO}
        >
          LV -0060 · THE SPRAWL BELOW · WHERE THE DROPPED LAND
        </p>
        <h2
          className="rise mt-6 text-[var(--bone)]"
          style={{
            ...BOLDONSE,
            fontSize: "clamp(2.6rem, 10vw, 8.2rem)",
            lineHeight: 1.3,
            textShadow:
              "0.035em 0 0 rgba(255,47,126,0.5), -0.035em 0 0 rgba(41,224,212,0.5)",
          }}
        >
          UNDERDOG CITY
        </h2>
        <p
          className="rise mx-auto mt-6 max-w-xl text-[0.9rem] text-[#8a8494] sm:text-base"
          style={SANS}
        >
          {WORLD.city.description}
        </p>
        <p
          className="rise mx-auto mt-8 max-w-2xl text-balance text-[var(--halo-silver)]"
          style={{ ...SERIF_IT, fontSize: "clamp(1.1rem, 2.3vw, 1.5rem)" }}
        >
          {BRAND.thesis}
        </p>

        <div className="rise mt-[13vh]">
          <p
            style={{
              ...BOLDONSE,
              fontSize: "clamp(1.5rem, 4.4vw, 3rem)",
              lineHeight: 1.25,
            }}
            className="text-[var(--bone)]"
          >
            WE ALL RULE DOWN&nbsp;HERE.
          </p>
          <p
            className="mt-4 text-[var(--halo-silver)]"
            style={{ ...SERIF_IT, fontSize: "clamp(1.05rem, 2.3vw, 1.5rem)" }}
          >
            There&rsquo;s only one rule in Underdog City:
          </p>
          <p
            className="mt-4"
            style={{
              ...BOLDONSE,
              ...GOLD_TEXT,
              fontSize: "clamp(1.9rem, 6.6vw, 5rem)",
              lineHeight: 1.3,
            }}
          >
            TURN THAT SHIT UP&nbsp;LOUD.
          </p>
        </div>

        <div className="rise mb-[4vh] mt-[11vh] flex justify-center">
          <Link
            id="tenant-sign"
            href="/key"
            className="border-2 border-[var(--neon-cyan)] px-7 py-4 text-[0.8rem] tracking-[0.3em] text-[var(--neon-cyan)] transition-colors duration-200 hover:bg-[rgba(41,224,212,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--neon-cyan)]"
            style={{
              ...TEKTUR,
              textShadow: "0 0 14px rgba(41,224,212,0.65)",
              boxShadow:
                "0 0 22px rgba(41,224,212,0.28), inset 0 0 18px rgba(41,224,212,0.1)",
            }}
          >
            NOW ACCEPTING TENANTS&thinsp;▸
          </Link>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[52vh] w-[68%]"
        style={{
          background:
            "radial-gradient(ellipse at 22% 100%, rgba(255,47,126,0.22) 0%, rgba(255,47,126,0) 62%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[52vh] w-[68%]"
        style={{
          background:
            "radial-gradient(ellipse at 78% 100%, rgba(41,224,212,0.2) 0%, rgba(41,224,212,0) 62%)",
        }}
      />
      <Skyline />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5 · THE THRONE / ALBUM                                              */
/* ------------------------------------------------------------------ */
function CrackDivider() {
  return (
    <svg
      viewBox="0 0 240 34"
      className="mx-auto mt-10 h-[34px] w-[240px]"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M4 17 L38 15 L57 21 L83 11 L104 19 L120 8 L136 20 L158 12 L182 22 L206 14 L236 17"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M83 11 L76 3 M120 8 L124 1 M158 12 L163 28 M57 21 L52 30"
        stroke="var(--gold-dim)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="120" cy="8" r="2.2" fill="var(--gold-hot)" />
    </svg>
  );
}

export function ThroneSection() {
  return (
    <section id="throne" className="relative px-5 pb-36 pt-[14vh] sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 18%, rgba(212,167,44,0.13) 0%, rgba(212,167,44,0) 60%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <p
          className="rise text-[0.62rem] tracking-[0.5em] text-[var(--gold-dim)]"
          style={MONO}
        >
          THE DEBUT ALBUM
        </p>
        <CrackDivider />
        <h2
          className="rise mt-8"
          style={{
            ...BOLDONSE,
            ...GOLD_TEXT,
            fontSize: "clamp(2.5rem, 8.6vw, 6.6rem)",
            lineHeight: 1.3,
          }}
        >
          THRONE AT THE&nbsp;BOTTOM
        </h2>
        <p
          className="rise mt-6 text-lg tracking-[0.5em] text-[var(--bone)] sm:text-xl"
          style={SHOULDERS}
        >
          UNDERDOG&nbsp;CITY
        </p>

        <blockquote
          className="rise mx-auto mt-10 max-w-xl text-balance text-[var(--halo-silver)]"
          style={{ ...SERIF_IT, fontSize: "clamp(1.15rem, 2.5vw, 1.65rem)" }}
        >
          &ldquo;In a world where kings and queens, they rule from their
          coffins — I&rsquo;m a bottom feeder, king of the orphans.&rdquo;
        </blockquote>

        <div className="rise">
          <Countdown />
        </div>
        <p
          className="rise mt-5 text-[0.64rem] tracking-[0.35em] text-[#8a8494]"
          style={MONO}
        >
          OUT {BRAND.releaseDateDisplay} · {BRAND.label.toUpperCase()}
        </p>

        <TrackLadder />

        <div className="rise mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/key"
            className="w-full border-2 border-[var(--gold)] bg-[var(--gold)] px-9 py-4 text-center text-lg uppercase tracking-[0.28em] text-[var(--void)] transition-colors duration-200 hover:border-[var(--gold-hot)] hover:bg-[var(--gold-hot)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-white)] sm:w-auto"
            style={SHOULDERS}
          >
            CLAIM YOUR KEY
          </Link>
          <Link
            href="/signal"
            className="w-full border-2 border-[var(--neon-cyan)] px-9 py-4 text-center text-lg uppercase tracking-[0.28em] text-[var(--neon-cyan)] transition-colors duration-200 hover:bg-[rgba(41,224,212,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--neon-cyan)] sm:w-auto"
            style={SHOULDERS}
          >
            TUNE THE SIGNAL
          </Link>
        </div>

        <footer className="rise mt-28 space-y-4">
          <p
            className="text-[1.15rem] text-[var(--halo-silver)]"
            style={SERIF_IT}
          >
            Now accepting tenants.
          </p>
          <p
            className="text-[0.58rem] leading-relaxed tracking-[0.32em] text-[#57505f]"
            style={MONO}
          >
            {BRAND.album.toUpperCase()} · OUT {BRAND.releaseDateDisplay} ·{" "}
            {BRAND.label.toUpperCase()}
          </p>
          <p
            className="text-[0.58rem] tracking-[0.32em] text-[#57505f]"
            style={MONO}
          >
            FOR THE UNDERDOGS · WE ALL RULE DOWN HERE.
          </p>
        </footer>
      </div>
    </section>
  );
}
