/**
 * CAME BACK WRONG — beat map for the /prologue surface.
 *
 * Every paragraph of the locked Season-1 prologue (PROLOGUE in @/lib/album)
 * is assigned a cinematic treatment mapped to the narrative arc:
 *   corridor (dying gold) → the fade (gold→white→gone) → death (black) →
 *   the return (gold ignition) → finale.
 *
 * No copy lives here — only which paragraph gets which staging. The text is
 * always read verbatim from PROLOGUE at render time.
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
  /** Index into the PROLOGUE array. */
  i: number;
  t: Treatment;
  anchor?: Anchor;
  /** For `fade`: the trailing substring whose letters dissolve. */
  dissolveFrom?: string;
  /** Relative type scale for `beat`/`void` moments (1 = base). */
  scale?: number;
}

/**
 * Treatment per PROLOGUE index (0–28). Verified line-by-line against
 * docs/underdog-city-brief.md Appendix A. 28 (the finale line) is rendered
 * by <Finale/>, not <Paragraph/>, but its anchor lives here for reference.
 */
export const BEATS: BeatDef[] = [
  { i: 0, t: "body" }, // "I've got maybe a minute of blood left in me..."
  { i: 1, t: "dialogue" }, // "Run," I tell her. "I'm fine. Go."
  { i: 2, t: "body" }, // "...service corridor sixty levels under the Halo..."
  { i: 3, t: "dialogue" }, // "Go. Before the bell stops ringing."
  { i: 4, t: "bell" }, // "...the Halo is ringing its victory bell."
  { i: 5, t: "body" }, // "The man with the clean boots is already gone..."
  { i: 6, t: "body" }, // "She's crying..."
  { i: 7, t: "body" }, // "Listen to me." ...voice going wrong
  { i: 8, t: "fracture" }, // "...cracks straight down the middle."
  { i: 9, t: "body" }, // "I made her a promise once..."
  { i: 10, t: "body" }, // "I'm about to break that promise..."
  { i: 11, t: "body" }, // "She takes my hand. Presses something into it..."
  { i: 12, t: "dialogue" }, // "Hold on," she whispers. "Please. Just hold on."
  { i: 13, t: "body" }, // "I want to. God help me, I want to."
  {
    i: 14,
    t: "fade",
    anchor: "fade",
    dissolveFrom: "dissolving like a word said too many times—",
  },
  { i: 15, t: "death", anchor: "death" }, // "—and then there's nothing."
  { i: 16, t: "void", scale: 1 }, // "And the nothing is almost a mercy."
  { i: 17, t: "void", scale: 1 }, // "So that's it, I think. That's dying..."
  { i: 18, t: "beat", scale: 1.15 }, // "I'm wrong."
  { i: 19, t: "void", scale: 1 }, // "Here's what nobody tells you about the bottom..."
  { i: 20, t: "void", scale: 1 }, // "Something moves behind my ribs..."
  { i: 21, t: "ignite", anchor: "return" }, // "Something gold. And patient. And very, very angry."
  { i: 22, t: "return" }, // "I don't remember my name..."
  { i: 23, t: "return" }, // "But I remember the bell."
  { i: 24, t: "return" }, // "...celebrating the hero who murdered me."
  { i: 25, t: "beat", scale: 1.3 }, // "My eyes open in the dark."
  { i: 26, t: "beat", scale: 1.7 }, // "Fine."
  { i: 27, t: "beat", scale: 2.1 }, // "They want a monster?"
  { i: 28, t: "beat", anchor: "finale", scale: 3 }, // "I'll be the best one they ever made."
];

/**
 * Pulse engine constants. All tape distances are in document pixels, so the
 * heartbeat is a pure function of scroll position — the reader conducts it.
 * The wrong-rhythm arrays are fixed module constants (never Math.random) so
 * SSR and client agree and the "wrongness" is reproducible.
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
