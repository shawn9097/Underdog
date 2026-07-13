import Link from "next/link";
import { BRAND, SOCIALS } from "@/lib/album";
import Skyline from "./Skyline";
import { ITALIANA, MONO, SERIF_IT } from "./voices";

/**
 * The street level — socials, the label line, and a quiet door up to
 * THE HALO lore page, with the sprawl glowing behind it all.
 */

function CrackDivider() {
  return (
    <svg
      viewBox="0 0 240 34"
      className="h-[34px] w-[240px]"
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

export default function HomeFooter() {
  return (
    <footer className="relative overflow-hidden pt-16 sm:pt-20">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 pb-44 text-center sm:pb-48">
        <CrackDivider />
        <p
          className="text-balance text-[1.15rem] text-[var(--halo-silver)]"
          style={SERIF_IT}
        >
          {BRAND.taglines[0]}
        </p>

        <ul className="flex flex-wrap items-center justify-center" style={MONO}>
          {SOCIALS.map((s) => (
            <li key={s.name}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${BRAND.artist} on ${s.name}, ${s.handle} (opens in a new tab)`}
                className="inline-flex min-h-[40px] items-center px-3.5 text-[0.62rem] tracking-[0.26em] text-[#8a8494] transition-colors duration-200 hover:text-[var(--gold-hot)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-hot)]"
              >
                {s.name.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>

        <p
          className="text-balance text-[0.58rem] leading-relaxed tracking-[0.22em] text-[#57505f] sm:tracking-[0.32em]"
          style={MONO}
        >
          {BRAND.album.toUpperCase()} · OUT {BRAND.releaseDateDisplay} ·{" "}
          {BRAND.label.toUpperCase()}
        </p>

        <Link
          href="/halo"
          className="inline-flex min-h-[40px] items-center gap-2 px-3 text-[0.82rem] tracking-[0.3em] text-[#5b6672] transition-colors duration-200 hover:text-[var(--halo-silver)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--halo-silver)]"
          style={ITALIANA}
        >
          THE HALO · THE LORE ABOVE
          <span aria-hidden="true" className="text-[0.7rem]">
            ↗
          </span>
        </Link>
      </div>

      {/* the sprawl, glowing at the bottom of everything */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0">
        <div
          className="absolute inset-x-0 top-0 z-10 h-24"
          style={{
            background:
              "linear-gradient(180deg, var(--void) 0%, rgba(6,5,7,0) 100%)",
          }}
        />
        <Skyline />
      </div>
    </footer>
  );
}
