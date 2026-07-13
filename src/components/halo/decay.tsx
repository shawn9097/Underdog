"use client";

/**
 * THE HALO — decay engine.
 *
 * The visitor arrives with a Worth Index of 100.00. Every honest
 * interaction — scroll, click, hover-dwell, assessment answers — deducts
 * from it. Stage thresholds drive the corruption styling; at 0 the
 * visitor is Dropped.
 *
 * Accessibility guard: corruption (glitching / truth-swaps) only targets
 * sections the visitor has already seen, tracked per-section here.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

export type Stage = 0 | 1 | 2 | 3;

export interface DecayApi {
  /** 100 → 0. The Sainted are always deducting. */
  worth: number;
  stage: Stage;
  dropped: boolean;
  reduced: boolean;
  mounted: boolean;
  lastSpend: { amount: number; at: number } | null;
  spend: (amount: number) => void;
  /** Immediate final determination — triggers the Drop. */
  judge: () => void;
  markSeen: (id: string) => void;
  seenIds: ReadonlySet<string>;
}

export const DecayContext = createContext<DecayApi | null>(null);

export function useDecay(): DecayApi {
  const ctx = useContext(DecayContext);
  if (!ctx) throw new Error("useDecay must be used inside HaloRoot");
  return ctx;
}

export function stageOf(worth: number): Stage {
  if (worth > 75) return 0;
  if (worth > 50) return 1;
  if (worth > 25) return 2;
  return 3;
}

const SectionContext = createContext<string>("");

/** True once the visitor has actually read the enclosing section. */
export function useSectionSeen(): boolean {
  const id = useContext(SectionContext);
  const { seenIds } = useDecay();
  return id !== "" && seenIds.has(id);
}

/**
 * A page section that (a) registers itself as "seen" once meaningfully
 * scrolled into view and (b) is marked data-fall so the Drop can take it.
 */
export function Section({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const { markSeen } = useDecay();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (
            e.isIntersecting &&
            (e.intersectionRatio >= 0.12 || e.boundingClientRect.top < 0)
          ) {
            markSeen(id);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: [0, 0.12] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id, markSeen]);

  return (
    <SectionContext.Provider value={id}>
      <section
        id={id}
        ref={ref}
        data-fall=""
        className={className ? `hl-section ${className}` : "hl-section"}
      >
        {children}
      </section>
    </SectionContext.Provider>
  );
}
