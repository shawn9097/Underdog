/**
 * THE SIGNAL — channel model for the pirate broadcast console.
 * All track content comes verbatim from "@/lib/album" (canon).
 * Frequencies are deterministic console dressing (stable server/client).
 */
import { TRACKS, type Track } from "@/lib/album";

export interface Channel {
  ch: number;
  /** Display frequency, e.g. "089.5". Ghost carrier has none. */
  freq: string;
  /** null => CH 00 ghost carrier ("Prey", cut from the final 14). */
  track: Track | null;
}

export function padCh(n: number): string {
  return String(n).padStart(2, "0");
}

function freqFor(n: number): string {
  return (88.1 + (n - 1) * 1.4).toFixed(1).padStart(5, "0");
}

/** Indexed by channel number: CHANNELS[0] is the ghost, CHANNELS[1..14] the album. */
export const CHANNELS: Channel[] = [
  { ch: 0, freq: "---.-", track: null },
  ...TRACKS.map((t) => ({ ch: t.n, freq: freqFor(t.n), track: t })),
];

/** Deterministic PRNG for the signal-trace fingerprints. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seed a fingerprint from track number + BPM + title characters. */
export function seedFor(track: Track | null): number {
  if (!track) return 0xdead;
  let s = track.n * 7919 + (track.bpm ?? 0) * 131;
  for (let i = 0; i < track.title.length; i++) {
    s = (s * 31 + track.title.charCodeAt(i)) >>> 0;
  }
  return s;
}
