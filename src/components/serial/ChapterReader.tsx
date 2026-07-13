"use client";

/**
 * THE SERIAL — kinetic chapter reader.
 *
 * Generalized from the original /prologue cinema: a chapter's verbatim
 * paragraphs + beat map arrive as props (ChapterReaderConfig) and are staged
 * as scroll-paced kinetic-typography cinema. Long-form fiction first, effects
 * second: the read stays comfortable at a ~65ch measure with an immaculate
 * rag.
 *
 * All hidden states are applied here via gsap.set and gated on reduced-motion,
 * so if motion is off (or JS never runs) every word is visible from CSS alone.
 */

import "./reader.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChapterReaderConfig } from "./beats";
import ChapterEnd from "./ChapterEnd";
import Finale from "./Finale";
import Paragraph from "./Paragraph";
import Pulse, { type PulseHandle } from "./Pulse";
import ReadingProgress from "./ReadingProgress";

export default function ChapterReader({ config }: { config: ChapterReaderConfig }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<PulseHandle>(null);
  const [reduced, setReduced] = useState(false);

  // Track reduced-motion for the pulse glow (scroll-driven either way).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // A bell ring drops a single faint blip onto the EKG at the read position.
  const handleBell = () => {
    const y = window.scrollY + window.innerHeight * 0.5;
    pulseRef.current?.blip(y);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motionOff = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (motionOff) {
        // Safe static states: everything legible, atmosphere resolved.
        gsap.set(".pl-corridor", { opacity: 1 });
        gsap.set(".pl-white", { opacity: 0 });
        gsap.set(".pl-ember", { opacity: 0.5 });
        gsap.set(".pl-cracks", { opacity: 0.85 });
        gsap.set(".pl-cracks path", { strokeDasharray: "none", strokeDashoffset: 0 });
        return;
      }

      // Guard every staged sequence on its anchor actually existing in this
      // chapter's beat map, so future chapters can omit any of them.
      const has = (sel: string) => root.querySelector(sel) !== null;

      const q = "[data-reveal]";
      const reveals = gsap.utils.toArray<HTMLElement>(q);
      reveals.forEach((el) => {
        gsap.set(el, { autoAlpha: 0, y: 22 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power2.out" }),
        });
      });

      // --- The fade: corridor out, white wash 0→1→0, words dissolve ---
      if (has('[data-anchor="fade"]')) {
        gsap.set(".pl-diss-letter", { opacity: 1, filter: "blur(0px)", y: 0 });

        gsap.fromTo(
          ".pl-corridor",
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: '[data-anchor="fade"]',
              start: "top 72%",
              end: "bottom 38%",
              scrub: true,
            },
          },
        );

        const fadeTl = gsap.timeline({
          scrollTrigger: {
            trigger: '[data-anchor="fade"]',
            start: "top 78%",
            end: "bottom 28%",
            scrub: true,
          },
        });
        fadeTl
          .fromTo(".pl-white", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.55 })
          .to(".pl-white", { opacity: 0, ease: "none", duration: 0.45 });

        gsap.to(".pl-diss-letter", {
          opacity: 0,
          filter: "blur(7px)",
          y: -5,
          stagger: 0.02,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-anchor="fade"]',
            start: "top 56%",
            end: "bottom 42%",
            scrub: true,
          },
        });
      }

      // --- Fracture: a hairline crack draws down and the line shudders ---
      if (has("[data-fracture]")) {
        ScrollTrigger.create({
          trigger: "[data-fracture]",
          start: "top 78%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              ".pl-fracture-line",
              { scaleY: 0, opacity: 0 },
              {
                scaleY: 1,
                opacity: 1,
                duration: 0.5,
                ease: "power2.in",
                transformOrigin: "top",
              },
            );
            gsap.fromTo(
              "[data-fracture]",
              { x: -1.6 },
              {
                x: 1.6,
                duration: 0.05,
                repeat: 5,
                yoyo: true,
                ease: "none",
                onComplete: () => gsap.set("[data-fracture]", { x: 0 }),
              },
            );
          },
        });
      }

      // --- The return: ember rises, kintsugi cracks draw in with gold ---
      if (has('[data-anchor="return"]') && has('[data-anchor="finale"]')) {
        gsap.fromTo(
          ".pl-ember",
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: '[data-anchor="return"]',
              start: "top 88%",
              endTrigger: '[data-anchor="finale"]',
              end: "top 45%",
              scrub: true,
            },
          },
        );

        const paths = gsap.utils.toArray<SVGPathElement>(".pl-cracks path");
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.fromTo(
          ".pl-cracks",
          { opacity: 0 },
          {
            opacity: 0.72,
            ease: "none",
            scrollTrigger: {
              trigger: '[data-anchor="return"]',
              start: "top 85%",
              endTrigger: '[data-anchor="finale"]',
              end: "top 55%",
              scrub: true,
            },
          },
        );
        gsap.to(".pl-cracks path", {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-anchor="return"]',
            start: "top 80%",
            endTrigger: '[data-anchor="finale"]',
            end: "top 40%",
            scrub: true,
          },
        });
      }

      // --- Finale line: letters rise into place ---
      if (has('[data-anchor="finale"]')) {
        gsap.set(".pl-fin-letter", { autoAlpha: 0, yPercent: 60 });
        ScrollTrigger.create({
          trigger: '[data-anchor="finale"]',
          start: "top 78%",
          once: true,
          onEnter: () =>
            gsap.to(".pl-fin-letter", {
              autoAlpha: 1,
              yPercent: 0,
              stagger: 0.04,
              duration: 0.7,
              ease: "power3.out",
            }),
        });
      }

      // Opening cue fades as you leave the top.
      gsap.to(".pl-scrollcue", {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "+=280", scrub: true },
      });

      ScrollTrigger.refresh();
    }, root);

    // Positions shift once webfonts swap in — refresh when they settle.
    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [config]);

  // Split the display title so the glitch word keeps its treatment.
  const glitch =
    config.glitchWord && config.title.endsWith(config.glitchWord)
      ? config.glitchWord
      : null;
  const titleHead = glitch
    ? config.title.slice(0, config.title.length - glitch.length)
    : config.title;

  return (
    <div className="pl" ref={rootRef}>
      <div className="pl-layer pl-corridor" aria-hidden="true" />
      <div className="pl-layer pl-white" aria-hidden="true" />
      <div className="pl-layer pl-ember" aria-hidden="true" />
      <div className="pl-layer pl-cracks" aria-hidden="true">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <path
            d="M500,-30 C505,120 468,190 522,300 C566,392 500,470 540,560 C580,650 520,724 560,858 C586,946 560,1010 556,1060"
            strokeWidth="2.2"
          />
          <path
            d="M522,300 C616,318 700,262 828,304 C900,328 948,300 1030,332"
            strokeWidth="1.6"
          />
          <path
            d="M500,300 C384,338 306,300 168,344 C96,366 44,340 -30,368"
            strokeWidth="1.4"
          />
          <path
            d="M540,560 C446,600 366,562 244,620 C168,656 108,632 20,664"
            strokeWidth="1.5"
          />
          <path
            d="M560,858 C662,900 760,862 902,902 C968,920 1010,900 1060,922"
            strokeWidth="1.7"
          />
          <path
            d="M560,560 C640,520 720,540 812,506"
            strokeWidth="1.1"
          />
        </svg>
      </div>
      <div className="pl-layer pl-grain" aria-hidden="true" />
      <div className="pl-topscrim" aria-hidden="true" />
      <div className="pl-defib" data-pl-defib aria-hidden="true" />

      {config.pulse && <Pulse reduced={reduced} handleRef={pulseRef} />}

      <ReadingProgress slug={config.slug} />

      <Link className="pl-back" href="/serial">
        <span aria-hidden="true">↑</span> THE SERIAL
      </Link>

      {config.hud && (
        <div className="pl-hud" data-pl-hud aria-hidden="true">
          <span className="pl-hud-lv">{config.hud.lv}</span>
          <span>{config.hud.zone}</span>
          <span className="pl-hud-signs" data-pl-signs>
            {config.hud.signs}
          </span>
        </div>
      )}

      <article className="pl-article" data-pl-article>
        <header className="pl-open">
          <p className="pl-open-kicker">{config.kicker}</p>
          <h1 className="pl-open-title">
            {titleHead}
            {glitch && (
              <span className="pl-glitch" data-text={glitch}>
                {glitch}
              </span>
            )}
          </h1>
          {config.sub && <p className="pl-open-sub">{config.sub}</p>}
          <p className="pl-scrollcue">
            scroll
            <span aria-hidden="true">↓</span>
          </p>
        </header>

        {config.beats
          .filter((def) => def.i !== config.finale.index)
          .map((def) => (
            <Paragraph
              key={def.i}
              def={def}
              text={config.paragraphs[def.i]}
              onBell={def.t === "bell" ? handleBell : undefined}
            />
          ))}
      </article>

      <Finale
        text={config.paragraphs[config.finale.index]}
        kicker={config.finale.kicker}
        meta={config.finale.meta}
        lines={config.finale.lines}
      />

      <ChapterEnd slug={config.slug} hookSlug={config.hookSlug} />
    </div>
  );
}
