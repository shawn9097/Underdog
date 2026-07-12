/**
 * Mutable scroll state shared between the DOM scroll orchestration
 * (gsap ScrollTrigger in DescentPage) and the WebGL scene (FallScene).
 * A single stable object is mutated on scroll and read in useFrame —
 * no React re-renders on scroll.
 */
export interface DescentState {
  /** 0..1 progress of THE FALL section through the viewport. */
  fall: number;
  /** 0..1 progress of the IMPACT section through the viewport. */
  impact: number;
  /** 0..1 progress from the city section to the end of the page. */
  after: number;
  /** Normalized recent scroll velocity, decays in the render loop. */
  vel: number;
}

export function createDescentState(): DescentState {
  return { fall: 0, impact: 0, after: 0, vel: 0 };
}

/** Deterministic PRNG — identical output on server and client. */
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
