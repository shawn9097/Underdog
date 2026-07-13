"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BRAND, PROLOGUE } from "@/lib/album";

/** The red verdict, stamped over the viewport as the floor gives way. */
export function DropStamp() {
  return (
    <div className="hl-stamp" aria-hidden="true">
      <div className="hl-stamp-inner">
        <span className="hl-stamp-word">WORTHLESS</span>
        <span className="hl-stamp-sub">BY ORDER OF THE SAINTED</span>
      </div>
    </div>
  );
}

/**
 * Where the visitor lands. Void, one gold thread, and two ways onward.
 * The quote is PROLOGUE[19], verbatim.
 */
export function VoidScreen({ on }: { on: boolean }) {
  const hRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (on) {
      const t = setTimeout(() => hRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [on]);

  return (
    <div
      className={on ? "hl-void is-on" : "hl-void"}
      role="region"
      aria-label="Final determination"
      aria-hidden={on ? undefined : true}
    >
      <div className="hl-void-inner">
        <p className="hl-micro hl-void-micro">
          FINAL DETERMINATION — VERDICT: WORTHLESS
        </p>
        <span className="hl-thread" aria-hidden="true" />
        <h2 ref={hRef} tabIndex={-1} className="hl-void-h">
          &ldquo;{PROLOGUE[19]}&rdquo;
        </h2>
        <div className="hl-void-links">
          <Link href="/" className="hl-void-link">
            the fall is survivable — <span>THE DESCENT ↓</span>
          </Link>
          <Link href="/key" className="hl-void-link">
            claim your key — <span>THE KEY →</span>
          </Link>
        </div>
        <p className="hl-void-foot">{BRAND.emailHook}</p>
      </div>
    </div>
  );
}
