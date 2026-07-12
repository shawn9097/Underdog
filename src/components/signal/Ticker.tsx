"use client";

import { useEffect, useState } from "react";
import { BRAND, msUntilRelease } from "@/lib/album";

/**
 * Persistent broadcast crawl: manifesto + tenant hook + live release countdown.
 * The countdown mounts client-side only (no hydration divergence); the static
 * date string is always present even without JS.
 */
export default function Ticker() {
  const [tminus, setTminus] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const ms = msUntilRelease(Date.now());
      if (ms <= 0) {
        setTminus("OUT NOW");
        return;
      }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setTminus(
        `T-MINUS ${d}D ${String(h).padStart(2, "0")}H ${String(m).padStart(2, "0")}M`
      );
    };
    update();
    const id = window.setInterval(update, 30000);
    return () => window.clearInterval(id);
  }, []);

  const segs = [
    BRAND.manifesto,
    BRAND.emailHook,
    `ALBUM DROPS ${BRAND.releaseDateDisplay}${tminus ? ` — ${tminus}` : ""}`,
    `${BRAND.album} — 14 tracks — ${BRAND.label}`,
    BRAND.taglines[0],
    "This is not a licensed broadcast.",
  ];

  return (
    <div className="sig-ticker" aria-label="Broadcast ticker">
      <div className="sig-ticker-track">
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="sig-ticker-copy"
            aria-hidden={copy === 1 || undefined}
          >
            {segs.map((s, i) => (
              <span key={i}>
                <i aria-hidden>◆</i>
                {s}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
