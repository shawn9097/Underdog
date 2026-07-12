"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CityNav from "@/components/CityNav";
import { createDescentState } from "./state";
import {
  HaloSection,
  FallSection,
  ImpactSection,
  CitySection,
  ThroneSection,
} from "./Sections";

const FallScene = dynamic(() => import("./FallScene"), { ssr: false });

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/**
 * THE DESCENT — one continuous scroll is The Drop.
 * Halo (white) → the fall (light drains to void) → impact (kintsugi gold)
 * → Underdog City (neon) → the throne (album).
 */
export default function DescentPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const meterNumRef = useRef<HTMLSpanElement>(null);
  const meterDotRef = useRef<HTMLDivElement>(null);
  const meterBottomRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef(createDescentState());

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const st = stateRef.current;

    const ctx = gsap.context(() => {
      /* ---------- zone trackers feeding the WebGL scene ---------- */
      ScrollTrigger.create({
        trigger: "#fall",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (s) => {
          st.fall = s.progress;
        },
      });
      ScrollTrigger.create({
        trigger: "#impact",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (s) => {
          st.impact = s.progress;
        },
      });
      ScrollTrigger.create({
        trigger: "#city",
        start: "top bottom",
        end: "max",
        onUpdate: (s) => {
          st.after = s.progress;
        },
      });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (s) => {
          st.vel = Math.min(Math.abs(s.getVelocity()) / 2600, 1);
        },
      });

      /* ---------- depth meter: levels below the Halo ---------- */
      const setLevel = (p: number) => {
        const lv = Math.round(p * 60);
        if (meterNumRef.current)
          meterNumRef.current.textContent = `LV -${String(lv).padStart(4, "0")}`;
        if (meterDotRef.current)
          meterDotRef.current.style.transform = `translateY(${(p * 116).toFixed(1)}px)`;
        if (meterBottomRef.current)
          meterBottomRef.current.style.opacity = p >= 1 ? "1" : "0";
      };
      ScrollTrigger.create({
        trigger: "#fall",
        start: "top top",
        end: "bottom top",
        onUpdate: (s) => setLevel(s.progress),
        onLeave: () => setLevel(1),
        onLeaveBack: () => setLevel(0),
      });

      /* ---------- the light drains: white → void (scroll-mapped) ---------- */
      gsap.set(bgRef.current, { backgroundColor: "#f4f6f8" });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: "#fall",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
        .to(bgRef.current, {
          backgroundColor: "#f4f6f8",
          duration: 0.05,
          ease: "none",
        })
        .to(bgRef.current, {
          backgroundColor: "#c9d2dc",
          duration: 0.06,
          ease: "none",
        })
        .to(bgRef.current, {
          backgroundColor: "#2a2531",
          duration: 0.08,
          ease: "none",
        })
        .to(bgRef.current, {
          backgroundColor: "#060507",
          duration: 0.1,
          ease: "none",
        })
        // hold the void for the rest of the fall so the darkness lands early
        .to(bgRef.current, {
          backgroundColor: "#060507",
          duration: 0.71,
          ease: "none",
        });

      if (reduced) return; // everything below is motion; content is already visible

      /* ---------- THE HALO: bell + verdict ---------- */
      gsap.fromTo(
        ".bell-ring",
        { scale: 0.55, opacity: 0.9 },
        {
          scale: 1.75,
          opacity: 0,
          duration: 3.4,
          ease: "power1.out",
          repeat: -1,
          stagger: 1.7,
        }
      );
      gsap.from(".verdict-stamp", {
        scale: 1.7,
        autoAlpha: 0,
        rotate: 3,
        duration: 0.45,
        ease: "power3.in",
        delay: 0.9,
      });
      gsap.to(".floor-cue", {
        y: 9,
        duration: 0.95,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      /* ---------- THE FALL: prologue fragments drift in ---------- */
      gsap.utils.toArray<HTMLElement>(".fall-q").forEach((q) => {
        gsap.fromTo(
          q,
          { autoAlpha: 0, y: 70 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: q,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      /* ---------- IMPACT: the break floods with gold ---------- */
      const cores = gsap.utils.toArray<SVGPathElement>(".crack-core");
      const glows = gsap.utils.toArray<SVGPathElement>(".crack-glow");
      [...cores, ...glows].forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });
      gsap.set(".impact-line", { autoAlpha: 0, y: 44 });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: "#impact",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        })
        .to(
          "#impact-shake",
          {
            keyframes: [
              { x: -11, y: 7 },
              { x: 9, y: -6 },
              { x: -5, y: 3 },
              { x: 0, y: 0 },
            ],
            duration: 0.06,
            ease: "none",
          },
          0.02
        )
        .to(
          cores,
          {
            strokeDashoffset: 0,
            duration: 0.34,
            ease: "power2.in",
            stagger: 0.008,
          },
          0.06
        )
        .to(
          glows,
          {
            strokeDashoffset: 0,
            duration: 0.3,
            ease: "power1.inOut",
            stagger: 0.007,
          },
          0.3
        )
        .fromTo(
          "#impact-flash",
          { autoAlpha: 0 },
          { autoAlpha: 0.9, duration: 0.08, ease: "power4.in" },
          0.58
        )
        .to("#impact-flash", { autoAlpha: 0.14, duration: 0.14 }, 0.68)
        .to(
          ".impact-line",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.12,
            stagger: 0.055,
            ease: "power2.out",
          },
          0.6
        );

      /* ---------- CITY: skyline parallax + tenant sign flicker ---------- */
      gsap.fromTo(
        "#sky-far",
        { y: 70 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: "#city",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
      gsap.fromTo(
        "#sky-mid",
        { y: 120 },
        {
          y: 18,
          ease: "none",
          scrollTrigger: {
            trigger: "#city",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
      gsap
        .timeline({ repeat: -1, repeatDelay: 3.4, delay: 1.2 })
        .to("#tenant-sign", { opacity: 0.35, duration: 0.05 })
        .to("#tenant-sign", { opacity: 1, duration: 0.07 })
        .to("#tenant-sign", { opacity: 0.5, duration: 0.04 }, "+=0.28")
        .to("#tenant-sign", { opacity: 1, duration: 0.06 });

      /* ---------- generic rises (city + throne) ---------- */
      gsap.utils.toArray<HTMLElement>(".rise").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          }
        );
      });
    }, rootRef);

    document.fonts?.ready
      ?.then(() => ScrollTrigger.refresh())
      .catch(() => undefined);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} style={{ overflowX: "clip" }}>
      {/* scroll-mapped light: white above, void below */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="fixed inset-0 z-0"
        style={{ background: "var(--void)" }}
      />

      <FallScene state={stateRef.current} />

      <main className="relative z-[2]">
        <HaloSection />
        <FallSection />
        <ImpactSection />
        <CitySection />
        <ThroneSection />
      </main>

      {/* film grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30"
        style={{ backgroundImage: GRAIN, opacity: 0.05 }}
      />

      {/* depth meter — levels below the Halo */}
      <div
        aria-hidden="true"
        className="fixed right-3 top-14 z-40 text-white mix-blend-difference sm:right-5 sm:top-1/2 sm:-translate-y-1/2"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        <div className="flex flex-col items-end gap-2">
          <span ref={meterNumRef} className="text-[0.68rem] tracking-[0.18em]">
            LV -0000
          </span>
          <div className="relative mr-[2px] hidden h-[120px] w-px self-end bg-white/40 sm:block">
            <div
              ref={meterDotRef}
              className="absolute -left-[2px] top-0 h-[5px] w-[5px] bg-white"
            />
          </div>
          <span
            className="hidden text-[0.52rem] tracking-[0.32em] sm:block"
            style={{ writingMode: "vertical-rl" }}
          >
            BELOW THE HALO
          </span>
          <span
            ref={meterBottomRef}
            className="text-[0.58rem] tracking-[0.25em]"
            style={{ opacity: 0 }}
          >
            BOTTOM
          </span>
        </div>
      </div>

      <CityNav />
    </div>
  );
}
