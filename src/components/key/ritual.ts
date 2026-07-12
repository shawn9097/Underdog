/**
 * CLAIM YOUR KEY — pure ritual logic.
 *
 * Seeded fracture generation, key geometry derived from the fracture seed,
 * and deed derivations. No DOM. Everything deterministic given a seed so a
 * visitor's key is genuinely — and reproducibly — their own.
 */

export type Pt = { x: number; y: number };

/** 32-bit FNV-1a hash. */
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Fracture propagation                                                */
/* ------------------------------------------------------------------ */

export interface Crack {
  /** Polyline in slab-local pixel space (normalize before storing). */
  pts: Pt[];
  /** Stroke width at the root of this branch. */
  w: number;
  /** Branch depth: 0 = primary fracture. */
  depth: number;
}

/**
 * Grow a branching crack network from an impact origin.
 * Runs in slab-local pixel space (w × h) so step sizes feel physical.
 */
export function growCracks(
  rng: () => number,
  origin: Pt,
  w: number,
  h: number,
  strike: number
): Crack[] {
  const cracks: Crack[] = [];
  const scale = Math.min(w, h);

  const grow = (
    start: Pt,
    angle: number,
    len: number,
    width: number,
    depth: number
  ) => {
    const pts: Pt[] = [{ ...start }];
    let x = start.x;
    let y = start.y;
    let a = angle;
    let traveled = 0;
    while (traveled < len) {
      const step = scale * (0.02 + rng() * 0.035);
      a += (rng() - 0.5) * 0.9;
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      traveled += step;
      if (x < 2 || y < 2 || x > w - 2 || y > h - 2) break;
      pts.push({ x, y });
      if (depth < 3 && rng() < 0.15) {
        grow(
          { x, y },
          a + (rng() < 0.5 ? 1 : -1) * (0.55 + rng() * 0.95),
          len * (0.3 + rng() * 0.32),
          width * 0.62,
          depth + 1
        );
      }
    }
    if (pts.length > 2) cracks.push({ pts, w: width, depth });
  };

  const primaries = 4 + Math.floor(rng() * 3) + strike;
  for (let i = 0; i < primaries; i++) {
    const a = (i / primaries) * Math.PI * 2 + rng() * 1.1;
    grow(
      origin,
      a,
      scale * (0.26 + rng() * 0.38) * (0.75 + strike * 0.28),
      2.2 + rng() * 1.1,
      0
    );
  }
  return cracks;
}

/* ------------------------------------------------------------------ */
/* Key geometry — bitting cut from the fracture seed                   */
/* ------------------------------------------------------------------ */

/** Six bitting cuts, each depth 1–7, derived from the fracture seed. */
export function deriveBitting(seed: number): number[] {
  const rng = mulberry32((seed ^ 0x9e3779b9) >>> 0);
  return Array.from({ length: 6 }, () => 1 + Math.floor(rng() * 7));
}

export interface KeyShape {
  /** Outer silhouette, closed polyline in a 0–1 unit square. */
  outer: Pt[];
  /** Bow hole, closed polyline. */
  hole: Pt[];
}

const BOW_C = { x: 0.5, y: 0.215 };
const BOW_R = 0.15;
const STEM_HW = 0.034;

function wrapAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/**
 * Build the key silhouette: a broken-crown bow (three prongs, one chip),
 * a stem, and six bitting teeth whose depths come from the fracture seed.
 */
export function keyShape(bitting: number[]): KeyShape {
  const C = BOW_C;
  const R = BOW_R;
  const sw = STEM_HW;

  const phi = Math.asin((sw * 1.25) / R);
  const aStart = Math.PI / 2 - phi; // right stem attach
  const aEnd = Math.PI / 2 + phi - Math.PI * 2; // left stem attach

  const spikes = [-Math.PI / 2 - 0.5, -Math.PI / 2, -Math.PI / 2 + 0.5];
  const chipA = Math.PI * 0.92; // the broken-crown chip, lower left

  const steps = 96;
  const outer: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = aStart + (aEnd - aStart) * (i / steps);
    let r = R;
    for (const s of spikes) {
      const d = Math.abs(wrapAngle(a - s));
      if (d < 0.17) r = R + 0.072 * (1 - d / 0.17);
    }
    const dChip = Math.abs(wrapAngle(a - chipA));
    if (dChip < 0.14) r = R - 0.034 * (1 - dChip / 0.14);
    outer.push({ x: C.x + Math.cos(a) * r, y: C.y + Math.sin(a) * r });
  }

  const stemTop = C.y + R * 0.88;
  const tipY = 0.962;
  const teethTop = 0.6;
  const teethBot = 0.918;
  const cuts = bitting.length;
  const cutH = (teethBot - teethTop) / cuts;

  // left flank down, tip point
  outer.push({ x: C.x - sw, y: stemTop });
  outer.push({ x: C.x - sw, y: tipY - 0.034 });
  outer.push({ x: C.x, y: tipY });
  outer.push({ x: C.x + sw, y: tipY - 0.034 });

  // right flank up through the bitting (bottom cut first)
  for (let i = cuts - 1; i >= 0; i--) {
    const yB = teethTop + cutH * (i + 1);
    const yT = teethTop + cutH * i;
    const d = 0.02 + bitting[i] * 0.0125;
    outer.push({ x: C.x + sw + d, y: yB - cutH * 0.14 });
    outer.push({ x: C.x + sw + d, y: yT + cutH * 0.14 });
    outer.push({ x: C.x + sw, y: yT });
  }
  outer.push({ x: C.x + sw, y: stemTop });

  const hole: Pt[] = [];
  const hr = 0.06;
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    hole.push({ x: C.x + Math.cos(a) * hr, y: C.y + Math.sin(a) * hr });
  }

  return { outer, hole };
}

/** SVG path (0–100 viewBox) with evenodd hole. */
export function keySvgPath(shape: KeyShape): string {
  const d = (pts: Pt[]) =>
    "M" +
    pts.map((p) => `${(p.x * 100).toFixed(2)} ${(p.y * 100).toFixed(2)}`).join(" L") +
    " Z";
  return `${d(shape.outer)} ${d(shape.hole)}`;
}

/**
 * The wound that stays visible in the gold: a seeded kintsugi crack
 * running through the bow. Unit-square coordinates.
 */
export function bowCrack(seed: number): Pt[] {
  const rng = mulberry32((seed ^ 0x51ed270b) >>> 0);
  const pts: Pt[] = [];
  let x = BOW_C.x - BOW_R * 0.95;
  let y = BOW_C.y - BOW_R * 0.35 + rng() * BOW_R * 0.7;
  let a = 0.25 - rng() * 0.5;
  pts.push({ x, y });
  for (let i = 0; i < 9; i++) {
    a += (rng() - 0.5) * 0.9;
    x += Math.cos(a) * BOW_R * 0.26;
    y += Math.sin(a) * BOW_R * 0.26;
    pts.push({ x, y });
    if (x > BOW_C.x + BOW_R) break;
  }
  return pts;
}

export function bowCrackSvgPath(seed: number): string {
  const pts = bowCrack(seed);
  return (
    "M" +
    pts.map((p) => `${(p.x * 100).toFixed(2)} ${(p.y * 100).toFixed(2)}`).join(" L")
  );
}

/** Resample a closed polyline to exactly n points, evenly by arc length. */
export function resample(pts: Pt[], n: number): Pt[] {
  if (pts.length < 2) return Array.from({ length: n }, () => ({ ...pts[0] }));
  const loop = [...pts, pts[0]];
  const cum: number[] = [0];
  for (let i = 1; i < loop.length; i++) {
    const dx = loop[i].x - loop[i - 1].x;
    const dy = loop[i].y - loop[i - 1].y;
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  const total = cum[cum.length - 1];
  const out: Pt[] = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const target = (i / n) * total;
    while (j < cum.length - 2 && cum[j + 1] < target) j++;
    const span = cum[j + 1] - cum[j] || 1;
    const t = (target - cum[j]) / span;
    out.push({
      x: loop[j].x + (loop[j + 1].x - loop[j].x) * t,
      y: loop[j].y + (loop[j + 1].y - loop[j].y) * t,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* The deed                                                            */
/* ------------------------------------------------------------------ */

export interface Claim {
  alias: string;
  email: string;
  /** Fracture seed accumulated from the visitor's actual strike points. */
  seed: number;
  bitting: number[];
  deedId: string;
  /** Sublevel depth below the Halo. */
  depth: number;
  issuedISO: string;
}

export const CLAIM_STORAGE_KEY = "uc:key-claim:v1";

/** Deterministic deed number + depth from alias/email. */
export function deriveDeed(alias: string, email: string): { deedId: string; depth: number } {
  const a = alias.trim().toLowerCase();
  const e = email.trim().toLowerCase();
  const h1 = fnv1a(`${a}|${e}`);
  const h2 = fnv1a(`${e}†${a}`);
  const deedId = `UC-${String(h1 % 10000).padStart(4, "0")}-${String(h2 % 10000).padStart(4, "0")}`;
  const depth = 61 + (((h1 ^ h2) >>> 0) % 39);
  return { deedId, depth };
}

export function loadClaim(): Claim | null {
  try {
    const raw = window.localStorage.getItem(CLAIM_STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Claim;
    if (
      typeof c.alias === "string" &&
      typeof c.email === "string" &&
      typeof c.seed === "number" &&
      Array.isArray(c.bitting) &&
      c.bitting.length > 0 &&
      typeof c.deedId === "string"
    ) {
      return c;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveClaim(c: Claim): void {
  try {
    window.localStorage.setItem(CLAIM_STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* private mode — the deed still renders this visit */
  }
}

export function clearClaim(): void {
  try {
    window.localStorage.removeItem(CLAIM_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export function formatIssued(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function seedHex(seed: number): string {
  return `0x${(seed >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}
