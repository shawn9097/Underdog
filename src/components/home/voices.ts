/**
 * THE FRONT DOOR — shared type voices.
 * Same families the rest of the city speaks in (see src/lib/fonts.ts).
 */

export const BOLDONSE = { fontFamily: "var(--font-boldonse)" } as const;

export const MONO = { fontFamily: "var(--font-geist-mono)" } as const;

export const SERIF_IT = {
  fontFamily: "var(--font-instrument-serif)",
  fontStyle: "italic",
} as const;

export const ITALIANA = { fontFamily: "var(--font-italiana)" } as const;

export const SANS = { fontFamily: "var(--font-instrument-sans)" } as const;

export const SHOULDERS = {
  fontFamily: "var(--font-big-shoulders)",
  fontWeight: 700,
} as const;

export const TEKTUR = { fontFamily: "var(--font-tektur)", fontWeight: 500 } as const;

/** Kintsugi gold poured into type. */
export const GOLD_TEXT = {
  backgroundImage:
    "linear-gradient(180deg, var(--gold-white) 0%, var(--gold-hot) 38%, var(--gold) 62%, var(--gold-dim) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;
