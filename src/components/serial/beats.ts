/**
 * THE SERIAL — chapter reader beat vocabulary.
 *
 * A chapter is verbatim paragraphs (from @/lib/album) + a beat map assigning
 * each paragraph a cinematic treatment. No copy lives here — only types, the
 * reader config contract, and the Chapter-0 pulse-engine tuning.
 */

export type Treatment =
  | "body" // measured literary body copy
  | "dialogue" // a pure spoken line, set off in the margin rhythm
  | "bell" // "ringing its victory bell" — resonant ring ripple
  | "fracture" // "cracks straight down the middle" — hairline fracture
  | "fade" // "gold to white to gone" — the screen fades, final words dissolve
  | "death" // "—and then there's nothing." — dead black, tiny type
  | "void" // the nothing — sparse small type on black
  | "beat" // short emphatic single line
  | "ignite" // "Something gold. And patient..." — the return ignites
  | "return"; // post-return body, gold-warmed

/** Anchors the pulse engine and atmosphere scrubs measure against. */
export type Anchor = "death" | "return" | "fade" | "finale";

export interface BeatDef {
  /** Index into the chapter's paragraph array. */
  i: number;
  t: Treatment;
  anchor?: Anchor;
  /** For `fade`: the trailing substring whose letters dissolve. */
  dissolveFrom?: string;
  /** Relative type scale for `beat`/`void` moments (1 = base). */
  scale?: number;
}

/**
 * Everything the chapter reader needs to stage one chapter.
 * All prose fields must be verbatim canon (from @/lib/album) — the reader
 * never invents copy.
 */
export interface ChapterReaderConfig {
  /** Chapter number (0 = the prologue chapter). */
  n: number;
  /** CHAPTERS slug — also the localStorage progress key. */
  slug: string;
  /** Mono kicker over the title, e.g. "The Serial — Chapter 0". */
  kicker: string;
  /** Display title, e.g. "CAME BACK WRONG". */
  title: string;
  /** Optional trailing word of `title` rendered with the chromatic glitch. */
  glitchWord?: string;
  /** Italic sub-line under the title (verbatim track role, etc.). */
  sub?: string;
  /** The verbatim chapter text, one entry per paragraph. */
  paragraphs: string[];
  /** Treatment per paragraph index. The finale index is rendered by <Finale/>. */
  beats: BeatDef[];
  finale: {
    /** Paragraph index staged as the finale line. */
    index: number;
    /** Title-card heading (the chapter/track name). */
    kicker: string;
    /** Title-card meta line, e.g. "Track 12 of 14 · Throne at the Bottom". */
    meta: string;
    /** Verbatim sung lines for the title card (" / " = line break). */
    lines: string[];
  };
  /** Corner HUD strings; omit to hide the HUD. */
  hud?: { lv: string; zone: string; signs: string };
  /**
   * Scroll-synced EKG rail. Requires "death", "return" and "finale" anchors
   * in the beat map — the pulse engine measures against them.
   */
  pulse: boolean;
  /** End-of-chapter hook: slug of the forthcoming chapter this read seeds. */
  hookSlug?: string;
}

/**
 * Chapter-0 pulse engine constants. All tape distances are in document pixels,
 * so the heartbeat is a pure function of scroll position — the reader conducts
 * it. The wrong-rhythm arrays are fixed module constants (never Math.random)
 * so SSR and client agree and the "wrongness" is reproducible.
 */
export const PULSE = {
  corridorStartSpacing: 104,
  corridorEndSpacing: 292,
  corridorAmpStart: 1,
  corridorAmpEnd: 0.4,
  corridorBpmStart: 78,
  corridorBpmEnd: 29,
  /** Irregular inter-beat gaps for the return (px along the tape). */
  wrongIntervals: [86, 214, 108, 268, 64, 178, 132, 300, 92, 158, 74, 236],
  /** Amplitudes paired to each wrong beat — deliberately uneven. */
  wrongAmp: [0.94, 0.55, 1.08, 0.6, 0.98, 0.5, 1.12, 0.7, 0.86, 0.62, 1.02, 0.58],
  /** Erratic readout values shown at the return (the rhythm is unrecognized). */
  wrongBpm: [128, 51, 163, 64, 142, 43, 177, 88, 119, 57, 151, 72],
} as const;
