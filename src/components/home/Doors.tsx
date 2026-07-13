import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BRAND, CHAPTERS } from "@/lib/album";
import { BOLDONSE, MONO, SANS, SERIF_IT, SHOULDERS, TEKTUR } from "./voices";

/**
 * THE THREE DOORS — the loudest thing after the hero. Physical doorways:
 * a frame, a leaf on a left hinge, light spilling through the gap when it
 * opens (hover / keyboard focus). Mobile lays them out as a corridor of
 * three doors in a row-per-door; desktop stands them side by side.
 */

const latestLive = CHAPTERS.filter((c) => c.status === "live").reduce(
  (a, b) => (b.n > a.n ? b : a)
);

interface DoorSpec {
  href: string;
  roman: string;
  glyph: string;
  name: string;
  line: string;
  chip: string;
  chipColor: string;
  chipDot?: boolean;
  accent: string;
  leafBorder: string;
  spill: string;
  threshold: string;
  cta: string;
  art: ReactNode;
}

/* -------------------------------------------------- per-door leaf art */

function SerialArt() {
  return (
    <div aria-hidden="true">
      <p
        className="absolute inset-x-[15%] top-[9%] text-left text-[0.55rem] leading-relaxed text-[#4c4655] sm:text-[0.68rem]"
        style={SERIF_IT}
      >
        &ldquo;I&rsquo;ve got maybe a minute of blood left in me&hellip;&rdquo;
      </p>
      {/* the rest of the page, still unwritten */}
      <div
        className="absolute inset-x-[16%] bottom-[10%] top-[46%]"
        style={{
          background:
            "repeating-linear-gradient(180deg, rgba(201,210,220,0.08) 0 1px, transparent 1px 8px)",
        }}
      />
    </div>
  );
}

function MusicArt() {
  return (
    <svg
      viewBox="0 0 60 210"
      aria-hidden="true"
      className="absolute left-1/2 top-[5%] h-[68%] w-auto -translate-x-1/2 opacity-75 transition-opacity duration-500 group-hover:opacity-100"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g stroke="#d4a72c" strokeOpacity="0.22" strokeWidth="5">
        <path d="M30 0 L26 30 L35 56 L24 88 L33 122 L26 156 L31 210" />
        <path d="M35 56 L46 68" />
        <path d="M24 88 L13 100" />
      </g>
      <path
        d="M30 0 L26 30 L35 56 L24 88 L33 122 L26 156 L31 210"
        stroke="#d4a72c"
        strokeWidth="1.6"
      />
      <path d="M35 56 L46 68" stroke="#8a6a1f" strokeWidth="1" />
      <path d="M24 88 L13 100" stroke="#8a6a1f" strokeWidth="1" />
      <circle cx="33" cy="122" r="2" fill="#f5c84c" />
    </svg>
  );
}

function CommunityArt() {
  return (
    <div aria-hidden="true">
      <div
        className="udc-neon absolute inset-x-[12%] top-[10%] border px-1 py-1 text-center text-[0.5rem] tracking-[0.3em] sm:py-1.5 sm:text-[0.62rem]"
        style={{
          ...TEKTUR,
          color: "var(--neon-cyan)",
          borderColor: "rgba(41,224,212,0.5)",
          textShadow: "0 0 10px rgba(41,224,212,0.8)",
          boxShadow:
            "0 0 16px rgba(41,224,212,0.25), inset 0 0 10px rgba(41,224,212,0.12)",
        }}
      >
        VACANCY
      </div>
      <span
        className="absolute left-1/2 top-[48%] -translate-x-1/2 text-xl sm:text-3xl"
        style={{ color: "rgba(41,224,212,0.65)" }}
      >
        ⚿
      </span>
    </div>
  );
}

/* ---------------------------------------------------------- the doors */

const DOORS: DoorSpec[] = [
  {
    href: "/serial",
    roman: "I",
    glyph: "✝",
    name: "THE SERIAL",
    line: "The story, chapter by chapter.",
    chip: `CH ${latestLive.n} · LIVE NOW`,
    chipColor: "var(--blood-bright)",
    chipDot: true,
    accent: "var(--halo-silver)",
    leafBorder: "#332c3c",
    spill:
      "radial-gradient(ellipse at 78% 62%, rgba(201,210,220,0.2) 0%, rgba(217,43,63,0.1) 45%, rgba(6,5,7,0) 75%)",
    threshold: "rgba(201,210,220,0.8)",
    cta: "STEP INTO THE STORY",
    art: <SerialArt />,
  },
  {
    href: "/music",
    roman: "II",
    glyph: "◍",
    name: "THE MUSIC",
    line: "The debut album — fourteen tracks, counting down.",
    chip: `OUT ${BRAND.releaseDateDisplay}`,
    chipColor: "var(--gold-hot)",
    accent: "var(--gold-hot)",
    leafBorder: "#453619",
    spill:
      "radial-gradient(ellipse at 78% 62%, rgba(245,200,76,0.24) 0%, rgba(212,167,44,0.1) 45%, rgba(6,5,7,0) 75%)",
    threshold: "rgba(245,200,76,0.8)",
    cta: "STEP INTO THE SOUND",
    art: <MusicArt />,
  },
  {
    href: "/community",
    roman: "III",
    glyph: "⚿",
    name: "THE COMMUNITY",
    line: "Claim your key. Join the tenants.",
    chip: "NOW ACCEPTING TENANTS",
    chipColor: "var(--neon-cyan)",
    accent: "var(--neon-cyan)",
    leafBorder: "#1c4a46",
    spill:
      "radial-gradient(ellipse at 78% 62%, rgba(41,224,212,0.22) 0%, rgba(41,224,212,0.08) 45%, rgba(6,5,7,0) 75%)",
    threshold: "rgba(41,224,212,0.8)",
    cta: "STEP INTO THE CITY",
    art: <CommunityArt />,
  },
];

const LEAF_CLOSED = "perspective(900px) rotateY(0deg)";
const LEAF_OPEN = "perspective(900px) rotateY(17deg)";

function Door({ d, idx }: { d: DoorSpec; idx: number }) {
  return (
    <Link
      href={d.href}
      prefetch={false}
      aria-label={`${d.name} — ${d.line} ${d.chip}`}
      className="rise-in group flex items-stretch gap-5 focus-visible:outline-2 focus-visible:outline-offset-4 sm:block"
      style={{ outlineColor: d.accent } as CSSProperties}
    >
      {/* doorway */}
      <div className="relative h-44 w-28 shrink-0 overflow-hidden border border-[#221d29] bg-[#0a080e] sm:h-[380px] sm:w-auto">
        {/* something alive behind the door — a slow breath of light, always on,
            so the doorway reads as lit-from-within even at rest */}
        <div
          aria-hidden="true"
          className="udc-door-breath absolute inset-0"
          style={
            {
              background: d.spill,
              animationDelay: `${idx * 1.15}s`,
            } as CSSProperties
          }
        />
        {/* light behind the door — floods in on approach */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ background: d.spill }}
        />
        {/* lintel */}
        <div
          className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-2.5 py-1.5 text-[0.5rem] tracking-[0.28em] text-[#57505f] sm:px-3.5 sm:py-2.5 sm:text-[0.58rem]"
          style={MONO}
        >
          <span>DOOR {d.roman}</span>
          <span aria-hidden="true">{d.glyph}</span>
        </div>
        {/* the leaf, hinged left */}
        <div
          className="absolute inset-x-[12%] bottom-0 top-[17%] origin-left border transition-transform duration-500 ease-out"
          style={{
            borderColor: d.leafBorder,
            background: "linear-gradient(180deg, #14101a 0%, #0b090f 100%)",
            transform: LEAF_CLOSED,
            // custom-property trick keeps hover/focus transforms in CSS below
          }}
          data-door-leaf
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-[13%] top-[6%] h-[32%] border border-[#221d29]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-[13%] bottom-[7%] top-[44%] border border-[#221d29]"
          />
          <span
            aria-hidden="true"
            className="absolute right-[8%] top-[52%] h-2 w-2 rounded-full border"
            style={{
              borderColor: d.accent,
              boxShadow: `0 0 8px ${d.threshold}`,
            }}
          />
          {d.art}
        </div>
        {/* light under the threshold */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[12%] bottom-0 h-[2px] opacity-40 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            background: d.threshold,
            boxShadow: `0 0 14px ${d.threshold}`,
          }}
        />
      </div>

      {/* nameplate */}
      <div className="flex min-w-0 flex-1 flex-col justify-center sm:mt-5 sm:block">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3
            className="text-xl tracking-[0.14em] text-[var(--bone)] sm:text-2xl"
            style={SHOULDERS}
          >
            {d.name}
          </h3>
          <p
            className="flex items-center gap-1.5 text-[0.55rem] tracking-[0.22em]"
            style={{ ...MONO, color: d.chipColor }}
          >
            {d.chipDot ? (
              <span
                aria-hidden="true"
                className="udc-live inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: d.chipColor }}
              />
            ) : null}
            {d.chip}
          </p>
        </div>
        <p className="mt-2 text-[0.88rem] text-[#8a8494]" style={SANS}>
          {d.line}
        </p>
        <p
          className="mt-3 text-[0.6rem] tracking-[0.26em] text-[#57505f] transition-colors duration-300 group-hover:text-[var(--bone)]"
          style={MONO}
        >
          {d.cta}{" "}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
          >
            →
          </span>
        </p>
      </div>
    </Link>
  );
}

export default function Doors() {
  return (
    <section
      id="doors"
      aria-label="The three doors of Underdog City"
      className="relative px-5 py-20 sm:px-8 sm:py-24"
    >
      {/* hover/focus door swing — scoped here since globals.css is off-limits */}
      <style>{`
        #doors .udc-door-breath { opacity: 0.22; }
        #doors .group:hover .udc-door-breath,
        #doors .group:focus-visible .udc-door-breath {
          animation: none !important;
          opacity: 0;
        }
        #doors .group:hover [data-door-leaf],
        #doors .group:focus-visible [data-door-leaf] {
          transform: ${LEAF_OPEN} !important;
        }
        @media (prefers-reduced-motion: no-preference) {
          #doors .udc-door-breath {
            animation: udcDoorBreath 5.5s ease-in-out infinite;
          }
        }
        @keyframes udcDoorBreath {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.42; }
        }
        @media (prefers-reduced-motion: reduce) {
          #doors .group:hover [data-door-leaf],
          #doors .group:focus-visible [data-door-leaf] {
            transform: ${LEAF_CLOSED} !important;
          }
        }
      `}</style>
      <div className="mx-auto max-w-6xl">
        <header className="rise-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[0.6rem] tracking-[0.45em] text-[var(--gold-dim)]"
              style={MONO}
            >
              THE FRONT HALL
            </p>
            <h2
              className="mt-3 text-[var(--bone)]"
              style={{
                ...BOLDONSE,
                fontSize: "clamp(1.8rem, 4.4vw, 3.2rem)",
                lineHeight: 1.25,
              }}
            >
              THREE DOORS
            </h2>
          </div>
          <p
            className="max-w-xs text-balance text-[var(--halo-silver)] sm:text-right"
            style={{ ...SERIF_IT, fontSize: "clamp(1rem, 1.8vw, 1.25rem)" }}
          >
            Start anywhere. It all leads down.
          </p>
        </header>
        <div className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-6 lg:gap-9">
          {DOORS.map((d, i) => (
            <Door key={d.href} d={d} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
