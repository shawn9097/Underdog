"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRAND } from "@/lib/album";
import { BOLDONSE, GOLD_TEXT, MONO, SERIF_IT } from "./voices";
import Mask from "./Mask";
import Doors from "./Doors";
import WhatsNew from "./WhatsNew";
import HomeFooter from "./HomeFooter";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/**
 * Page-scoped keyframes (globals.css is off-limits). Pure CSS so the
 * opening drain and the idle signage run without JS; everything sits
 * behind a reduced-motion gate.
 */
const KEYFRAMES = `
.udc-drain{opacity:0;background:var(--void);}
@media (prefers-reduced-motion: no-preference){
  .udc-drain{animation:udcDrain 1.9s cubic-bezier(0.55,0,0.4,1) both;}
  .udc-float{animation:udcFloat 2.4s ease-in-out infinite;}
  .udc-live{animation:udcPulse 1.9s ease-in-out infinite;}
  .udc-neon{animation:udcNeon 7s infinite;}
  .udc-wordmark{animation:udcGlitch 7.4s steps(1,end) 2.6s infinite;}
  .udc-kindle{animation:udcKindle 6s ease-in-out 1s infinite;}
}
@keyframes udcDrain{
  0%{opacity:1;background:#f4f6f8}
  30%{opacity:1;background:#f4f6f8}
  55%{opacity:1;background:#c9d2dc}
  75%{opacity:1;background:#2a2531}
  100%{opacity:0;background:#060507}
}
@keyframes udcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
/* the mask is a door too — wake what's behind the eyes */
.udc-mask-btn{appearance:none;background:none;border:0;padding:0;cursor:pointer;transition:filter 550ms ease;}
.udc-mask-btn.is-awake{filter:brightness(1.4) drop-shadow(0 0 26px rgba(245,200,76,0.55));}
.udc-mask-btn:focus-visible{outline:2px solid var(--gold-hot);outline-offset:6px;}
/* the mask carries something gold, and patient — a slow kindle behind the eyes */
@keyframes udcKindle{0%,100%{opacity:0.32}50%{opacity:0.7}}
/* the fractured identity splits and re-forms — brief, rare, then whole again */
@keyframes udcGlitch{
  0%,88%,100%{text-shadow:0.03em 0.03em 0 rgba(212,167,44,0.25);transform:translate(0,0)}
  89%{text-shadow:-0.022em 0 0 rgba(255,47,126,0.7),0.022em 0 0 rgba(41,224,212,0.7);transform:translate(1px,0)}
  91%{text-shadow:0.022em 0 0 rgba(255,47,126,0.65),-0.022em 0 0 rgba(41,224,212,0.65);transform:translate(-1px,0)}
  93%{text-shadow:0.03em 0.03em 0 rgba(212,167,44,0.25);transform:translate(0,0)}
  95%{text-shadow:-0.018em 0 0 rgba(255,47,126,0.6),0.018em 0 0 rgba(41,224,212,0.6);transform:translate(1px,0)}
  97%{text-shadow:0.03em 0.03em 0 rgba(212,167,44,0.25);transform:translate(0,0)}
}
@keyframes udcPulse{0%,100%{opacity:1}50%{opacity:0.35}}
@keyframes udcNeon{
  0%,4.4%,7%,51.9%,53%,77.9%,79%,100%{opacity:1}
  4.5%,6.9%{opacity:0.4}
  52%,52.8%{opacity:0.55}
  78%,78.8%{opacity:0.5}
}
`;

/**
 * THE FRONT DOOR of Underdog City.
 * One viewport of identity (mask + manifesto), three doors, a what's-new
 * strip, street level. Short on purpose — this is a place you come back
 * to, not a ride you take once.
 */
const MASK_VOW = "They want a monster? I'll be the best one they ever made.";

export default function HomePage({
  initialTenantCount,
}: {
  initialTenantCount: number | null;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const maskWrapRef = useRef<HTMLDivElement>(null);
  const [awake, setAwake] = useState(false);
  const awakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wakeMask = () => {
    if (awakeTimer.current) clearTimeout(awakeTimer.current);
    setAwake(true);
    awakeTimer.current = setTimeout(() => setAwake(false), 3800);
  };

  useEffect(
    () => () => {
      if (awakeTimer.current) clearTimeout(awakeTimer.current);
    },
    []
  );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return; // everything below is motion; content is already visible

    const ctx = gsap.context(() => {
      // entrance — timed to land as the drain clears
      gsap.from(".mask-root", {
        autoAlpha: 0,
        scale: 0.93,
        y: 10,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.55,
      });
      gsap.from(".hero-in", {
        autoAlpha: 0,
        y: 24,
        duration: 0.85,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.8,
      });
      // below the fold: rise on first approach only
      gsap.utils.toArray<HTMLElement>(".rise-in").forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 42,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    }, rootRef);

    // the mask watches the room — fine pointers only
    let offTilt: (() => void) | undefined;
    const hero = heroRef.current;
    const maskWrap = maskWrapRef.current;
    if (window.matchMedia("(pointer: fine)").matches && hero && maskWrap) {
      gsap.set(maskWrap, { transformPerspective: 700 });
      const rx = gsap.quickTo(maskWrap, "rotationX", {
        duration: 0.7,
        ease: "power2.out",
      });
      const ry = gsap.quickTo(maskWrap, "rotationY", {
        duration: 0.7,
        ease: "power2.out",
      });
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      };
      const onLeave = () => {
        rx(0);
        ry(0);
      };
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
      offTilt = () => {
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
      };
    }

    document.fonts?.ready
      ?.then(() => ScrollTrigger.refresh())
      .catch(() => undefined);

    return () => {
      offTilt?.();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} style={{ overflowX: "clip" }}>
      <style>{KEYFRAMES}</style>

      {/* the light drains — the Drop, compressed to a breath */}
      <div
        aria-hidden="true"
        className="udc-drain pointer-events-none fixed inset-0 z-[10000]"
      />

      <main className="relative">
        {/* ------------------------------------------------ 1 · the hero */}
        <section
          ref={heroRef}
          aria-label={`${BRAND.artist} — the front door`}
          className="relative flex min-h-[100svh] flex-col overflow-hidden"
        >
          <HeroScene />

          {/* gold seeping up from the throne below */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[36vh]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(212,167,44,0.14) 0%, rgba(212,167,44,0) 65%)",
            }}
          />

          {/* marginalia */}
          <div
            className="relative z-10 flex items-start justify-between px-5 pt-5 sm:px-8 sm:pt-6"
            style={MONO}
          >
            <p className="hero-in text-[0.58rem] tracking-[0.32em] text-[#57505f]">
              CENOTAPH RECORDS PRESENTS
            </p>
            <p className="hero-in hidden text-[0.58rem] tracking-[0.32em] text-[#57505f] sm:block">
              LV -0060 · BELOW THE HALO
            </p>
          </div>

          {/* identity */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center sm:gap-7">
            <div
              ref={maskWrapRef}
              className="mask-root"
              style={{ width: "clamp(118px, 26vw, 176px)" }}
            >
              <button
                type="button"
                onClick={wakeMask}
                aria-label="The mask of Underdog City — wake what's behind the eyes"
                className={`udc-mask-btn block w-full ${
                  awake ? "is-awake" : ""
                }`}
              >
                <Mask />
              </button>
            </div>
            <h1
              className="hero-in udc-wordmark text-[var(--bone)]"
              style={{
                ...BOLDONSE,
                fontSize: "clamp(2.3rem, 8.4vw, 6.6rem)",
                lineHeight: 1.16,
                textShadow: "0.03em 0.03em 0 rgba(212,167,44,0.25)",
              }}
            >
              UNDERDOG CITY
            </h1>
            <p
              className="hero-in max-w-md text-balance text-[0.6rem] leading-relaxed tracking-[0.28em] text-[#8a8494]"
              style={MONO}
            >
              A DARK-FANTASY MUSIC WORLD · DEBUT ALBUM OUT{" "}
              {BRAND.releaseDateDisplay}
            </p>
            <div className="hero-in max-w-2xl">
              <p
                className="text-balance text-[var(--halo-silver)]"
                style={{
                  ...SERIF_IT,
                  fontSize: "clamp(1.1rem, 2.3vw, 1.55rem)",
                }}
              >
                &ldquo;We all rule down here. There&rsquo;s only one rule in
                Underdog City:
              </p>
              <p
                className="mt-3"
                style={{
                  ...BOLDONSE,
                  ...GOLD_TEXT,
                  fontSize: "clamp(1.4rem, 4.3vw, 2.9rem)",
                  lineHeight: 1.3,
                }}
              >
                TURN THAT SHIT UP&nbsp;LOUD.&rdquo;
              </p>
            </div>
          </div>

          {/* the vow — surfaces when the mask is woken (hidden easter egg) */}
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[4.5rem] z-10 px-6 text-center text-balance transition-opacity duration-700"
            style={{
              ...SERIF_IT,
              fontSize: "clamp(1rem, 2.2vw, 1.45rem)",
              color: "var(--gold-hot)",
              textShadow: "0 0 18px rgba(245,200,76,0.4)",
              opacity: awake ? 1 : 0,
            }}
          >
            &ldquo;{MASK_VOW}&rdquo;
          </p>
          <span className="sr-only" role="status" aria-live="polite">
            {awake ? MASK_VOW : ""}
          </span>

          {/* the cue down */}
          <div
            className="udc-float relative z-10 flex flex-col items-center gap-1.5 pb-6 text-[#57505f]"
            style={MONO}
          >
            <p className="text-[0.6rem] tracking-[0.5em]">THREE DOORS BELOW</p>
            <span aria-hidden="true" className="text-sm leading-none">
              ▼
            </span>
          </div>
        </section>

        {/* --------------------------------------------- 2 · three doors */}
        <Doors />

        {/* --------------------------------------------- 3 · what's new */}
        <WhatsNew initialTenantCount={initialTenantCount} />

        {/* --------------------------------------------- 4 · street level */}
        <HomeFooter />
      </main>

      {/* film grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[30]"
        style={{ backgroundImage: GRAIN, opacity: 0.05 }}
      />
    </div>
  );
}
