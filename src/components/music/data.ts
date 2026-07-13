/**
 * THE MUSIC ROOM — data helpers.
 * Canon comes verbatim from "@/lib/album" and "@/lib/lyrics"; nothing here
 * invents copy. The deterministic fingerprint PRNG is inherited from THE
 * SIGNAL console (absorbed when that surface was folded into this one).
 */
import { TRACKS, type Track } from "@/lib/album";

/** Deterministic PRNG for the master-trace fingerprints. */
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
export function seedFor(track: Track): number {
  let s = track.n * 7919 + (track.bpm ?? 0) * 131;
  for (let i = 0; i < track.title.length; i++) {
    s = (s * 31 + track.title.charCodeAt(i)) >>> 0;
  }
  return s;
}

export function padN(n: number): string {
  return String(n).padStart(2, "0");
}

export function trackBySlug(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

/** Previous / next track in album order (no wrap — the record has edges). */
export function neighborsOf(slug: string): { prev: Track | null; next: Track | null } {
  const i = TRACKS.findIndex((t) => t.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? TRACKS[i - 1] : null,
    next: i < TRACKS.length - 1 ? TRACKS[i + 1] : null,
  };
}

export function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Lyric parsing — verbatim text, structure preserved.                  */
/* Lines inside [brackets] are the songbook's stage directions; they    */
/* render as marginalia. Brackets may span multiple lines (e.g. the     */
/* aerosol-can directions in "The Old Song").                           */
/* ------------------------------------------------------------------ */

export interface LyricItem {
  t: "dir" | "ln" | "gap";
  s: string;
}

export function parseLyrics(raw: string): LyricItem[] {
  const out: LyricItem[] = [];
  let depth = 0;
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (out.length && out[out.length - 1].t !== "gap") out.push({ t: "gap", s: "" });
      continue;
    }
    const opens = (trimmed.match(/\[/g) ?? []).length;
    const closes = (trimmed.match(/\]/g) ?? []).length;
    if (depth > 0 || trimmed.startsWith("[")) {
      out.push({ t: "dir", s: trimmed });
      depth = Math.max(0, depth + opens - closes);
    } else {
      out.push({ t: "ln", s: line });
    }
  }
  while (out.length && out[out.length - 1].t === "gap") out.pop();
  return out;
}

/** Style plate split into composition chips (verbatim fragments). */
export function styleChips(track: Track): string[] {
  return track.style.split(", ");
}

const SECTION_RE =
  /^\[(intro|verse|pre[\s-]?chorus|chorus|bridge|breakdown|drop|post[\s-]?chorus|post[\s-]?breakdown|final chorus|outro|hook|refrain|interlude|half-time)/i;

export interface LyricSection {
  /** Index into the LyricItem[] the anchor id attaches to. */
  idx: number;
  /** Clean short label, e.g. "Verse 1", "Chorus", "Breakdown". */
  label: string;
}

/**
 * Song structure parsed from the songbook's [stage directions]. Only the
 * recognizable section headers become index entries; descriptive directions
 * (e.g. "[spoken, flat]") are skipped. Returns [] for tracks with no marked
 * structure (several tracks are plain lyric blocks).
 */
export function lyricSections(items: LyricItem[]): LyricSection[] {
  const out: LyricSection[] = [];
  items.forEach((it, idx) => {
    if (it.t !== "dir" || !SECTION_RE.test(it.s)) return;
    const inner = it.s.replace(/^\[/, "").replace(/\][^\]]*$/, "");
    // First segment before an em/en dash or colon — avoids eating "Pre-Chorus".
    let label = inner.split(/[—–:]/)[0].trim();
    if (label.length > 22) label = label.slice(0, 22).trim();
    if (label) out.push({ idx, label });
  });
  return out;
}
