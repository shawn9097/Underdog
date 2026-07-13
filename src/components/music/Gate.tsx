"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BRAND, LINKS, SOCIALS } from "@/lib/album";
import Countdown from "./Countdown";
import { VaultDoor } from "./Kintsugi";
import { useMusic, type LockedReason } from "./state";

const BANNERS: Record<Exclude<LockedReason, "anon">, { tag: string; body: string }> = {
  v1: {
    tag: "OLD KEY DETECTED",
    body: "Your key predates the wall — the vault was re-cut when the tenant ledger went up. Claim again and your new key opens this door.",
  },
  invalid: {
    tag: "KEY REJECTED AT THE DOOR",
    body: "The vault didn't recognize that key. Claim a fresh one at the community office — the door remembers its tenants.",
  },
  offline: {
    tag: "THE VAULT ISN'T ANSWERING",
    body: "The wire between here and the vault is down. Nothing is lost — the masters keep. Try the door again.",
  },
};

/**
 * THE VAULT DOOR — pre-release gate for anonymous visitors.
 * A sealed, kintsugi-veined door of the world: countdown, presave, the
 * tenant incentive stated plainly. Only rendered after client-side gate
 * resolution, so all timers tick live values from first paint.
 */
export default function Gate({ reason }: { reason: LockedReason }) {
  const { retry } = useMusic();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // Gold veins draw themselves through the seam once.
      const veins = root.querySelectorAll<SVGPathElement>(".mu-door-vein");
      veins.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.fromTo(
          p,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            delay: 0.25 + i * 0.12,
            ease: "power2.out",
          },
        );
      });
      // The door breathes — barely. (Copy-column reveal is CSS-driven; see
      // .mu-gate-copy in music.css — CSS can't freeze under StrictMode.)
      gsap.to(root.querySelector(".mu-gate-door"), {
        filter: "drop-shadow(0 0 46px rgba(212,167,44,0.16))",
        duration: 3.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, root);
    return () => ctx.revert();
  }, [reason]);

  const banner = reason !== "anon" ? BANNERS[reason] : null;

  return (
    <div className="mu-gate" ref={rootRef}>
      <div className="mu-gate-bg" aria-hidden />
      <div className="mu-gate-grain" aria-hidden />

      <div className="mu-gate-grid">
        <div className="mu-gate-copy">
          {banner && (
            <div
              className={`mu-gate-banner${reason === "offline" ? " is-down" : ""}`}
              role="status"
            >
              <span className="mu-gate-banner-tag">{banner.tag}</span>
              <p>{banner.body}</p>
              {reason === "offline" && (
                <button type="button" className="mu-btn mu-btn-ghost" onClick={retry}>
                  KNOCK AGAIN
                </button>
              )}
            </div>
          )}

          <p className="mu-eyebrow">
            {BRAND.artist.toUpperCase()} · {BRAND.label.toUpperCase()}
          </p>
          <h1 className="mu-gate-title">
            <span className="mu-gate-title-top">THE VAULT</span>
            <span className="mu-gate-title-main">
              THRONE AT
              <br />
              THE BOTTOM
            </span>
          </h1>
          <p className="mu-gate-sub">
            Fourteen masters, racked and sealed behind this door. The city opens it for
            everyone on <b>{BRAND.releaseDateDisplay}</b>.
          </p>

          <Countdown onZero={retry} />

          <div className="mu-gate-ctas">
            <a
              className="mu-btn mu-btn-gold"
              href={LINKS.presave}
              target="_blank"
              rel="noopener"
            >
              PRESAVE THE ALBUM ↗
            </a>
            <Link className="mu-btn mu-btn-ghost" href="/community">
              CLAIM YOUR KEY →
            </Link>
          </div>
          <p className="mu-gate-incentive">
            Tenants don&rsquo;t wait. Claim your key and this door opens for you{" "}
            <em>before</em> release — the whole album, on-site, early.
          </p>

          <ul className="mu-socials" aria-label="Underdog City elsewhere">
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a href={s.url} target="_blank" rel="noopener">
                  <span className="mu-socials-name">{s.name}</span>
                  <span className="mu-socials-handle">{s.handle}</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mu-gate-foot" aria-hidden>
            MASTERS VAULT ▪ SIXTY LEVELS UNDER THE HALO ▪ SEALED{" "}
            {BRAND.releaseDateDisplay}
          </p>
        </div>

        <div className="mu-gate-doorwrap" aria-hidden>
          <VaultDoor className="mu-gate-door" />
          <span className="mu-gate-plate">
            MASTERS VAULT — {BRAND.label.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Neutral SSR shell — brief styled shimmer while tenancy resolves. */
export function Resolving() {
  return (
    <div className="mu-resolve" aria-busy="true">
      <span className="mu-resolve-line" aria-hidden />
      <p className="mu-resolve-txt">RESOLVING TENANCY…</p>
    </div>
  );
}
